<template>
  <div class="w-full min-h-80">
    <div
      ref="mapContainer"
      class="map-preview-shell block w-full h-[clamp(320px,42vh,420px)] min-h-80 rounded-lg overflow-hidden"
      :style="mapThemeVars"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import L from 'leaflet';

const props = defineProps({
  track: {
    type: [String, Array, null],
    default: null,
  },
  ready: {
    type: Boolean,
    default: false,
  },
  mapStyle: {
    type: String,
    default: '',
  },
  isDarkMode: {
    type: Boolean,
    default: undefined,
  },
});

const mapContainer = ref(null);

const DEFAULT_CENTER = [30.572269, 104.066541];
const DEFAULT_ZOOM = 12;
const MAP_THEME_CONFIG = {
  light: {
    styleCode: 7,
    tileFilter: 'none',
    trackColor: '#0284c7',
    repeatSegmentColor: '#ea580c',
    repeatSegmentOpacity: 0.62,
    containerBg: '#d9e6f7',
    containerShadow: '0 12px 30px rgba(15, 23, 42, 0.18)',
    markerShadow: '0 4px 12px rgba(15, 23, 42, 0.32)',
    attributionBg: 'rgba(255, 255, 255, 0.86)',
    attributionColor: '#334155',
    attributionLink: '#0f172a',
  },
  dark: {
    styleCode: 8,
    tileFilter: 'invert(1) hue-rotate(180deg) saturate(0.8) brightness(0.72) contrast(1.08)',
    trackColor: '#38bdf8',
    repeatSegmentColor: '#f59e0b',
    repeatSegmentOpacity: 0.5,
    containerBg: '#020617',
    containerShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
    markerShadow: '0 4px 12px rgba(0, 0, 0, 0.45)',
    attributionBg: 'rgba(10, 16, 30, 0.75)',
    attributionColor: '#94a3b8',
    attributionLink: '#cbd5e1',
  },
};

const GAODE_TILE_URL =
  'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style={style}&x={x}&y={y}&z={z}';

let map = null;
let baseLayer = null;
let resizeObserver = null;

let trackPolyline = null;
let repeatedSegmentLayer = null;
let startMarker = null;
let endMarker = null;

let drawVersion = 0;
let animationTimer = null;
let rawTrackPoints = [];

function resolveMapThemeKey(styleKey, isDarkMode) {
  const normalized = typeof styleKey === 'string' ? styleKey.trim().toLowerCase() : '';

  if (normalized === 'light' || normalized === 'city') {
    return 'light';
  }

  if (normalized === 'dark' || normalized === 'darkmatter') {
    return 'dark';
  }

  if (typeof isDarkMode === 'boolean') {
    return isDarkMode ? 'dark' : 'light';
  }

  return 'dark';
}

const activeMapThemeKey = computed(() => resolveMapThemeKey(props.mapStyle, props.isDarkMode));

function getThemeConfig(themeKey) {
  return MAP_THEME_CONFIG[themeKey] ?? MAP_THEME_CONFIG.dark;
}

const mapThemeVars = computed(() => {
  const theme = getThemeConfig(activeMapThemeKey.value);
  return {
    '--map-surface': theme.containerBg,
    '--map-shadow': theme.containerShadow,
    '--map-tile-filter': theme.tileFilter,
    '--map-marker-shadow': theme.markerShadow,
    '--map-attribution-bg': theme.attributionBg,
    '--map-attribution-text': theme.attributionColor,
    '--map-attribution-link': theme.attributionLink,
  };
});

function parseTrack(rawTrack) {
  if (!rawTrack) return [];

  let parsed = rawTrack;
  if (typeof rawTrack === 'string') {
    try {
      parsed = JSON.parse(rawTrack);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) return [];

  const points = [];
  for (const item of parsed) {
    let lngRaw;
    let latRaw;

    if (Array.isArray(item) && item.length >= 2) {
      [lngRaw, latRaw] = item;
    } else if (item && typeof item === 'object') {
      lngRaw = item.lng ?? item.lon ?? item.longitude;
      latRaw = item.lat ?? item.latitude;
    } else {
      const text = String(item || '').trim();
      if (!text) continue;
      if (text.includes(',')) {
        [lngRaw, latRaw] = text.split(',');
      } else {
        const matched = text.match(/^(-?\d+(?:\.\d+)?)\-(-?\d+(?:\.\d+)?)$/);
        if (!matched) continue;
        lngRaw = matched[1];
        latRaw = matched[2];
      }
    }

    const lng = Number(lngRaw);
    const lat = Number(latRaw);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;

    const prev = points[points.length - 1];
    if (!prev || prev[0] !== lng || prev[1] !== lat) {
      points.push([lng, lat]);
    }
  }

  return points;
}

function outOfChina(lng, lat) {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

function transformLat(lng, lat) {
  let ret =
    -100.0 +
    2.0 * lng +
    3.0 * lat +
    0.2 * lat * lat +
    0.1 * lng * lat +
    0.2 * Math.sqrt(Math.abs(lng));
  ret +=
    ((20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0) /
    3.0;
  ret +=
    ((20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin((lat / 3.0) * Math.PI)) * 2.0) / 3.0;
  ret +=
    ((160.0 * Math.sin((lat / 12.0) * Math.PI) + 320.0 * Math.sin((lat * Math.PI) / 30.0)) * 2.0) /
    3.0;
  return ret;
}

function transformLng(lng, lat) {
  let ret =
    300.0 +
    lng +
    2.0 * lat +
    0.1 * lng * lng +
    0.1 * lng * lat +
    0.1 * Math.sqrt(Math.abs(lng));
  ret +=
    ((20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0) /
    3.0;
  ret +=
    ((20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin((lng / 3.0) * Math.PI)) * 2.0) / 3.0;
  ret +=
    ((150.0 * Math.sin((lng / 12.0) * Math.PI) + 300.0 * Math.sin((lng / 30.0) * Math.PI)) * 2.0) /
    3.0;
  return ret;
}

function wgs84ToGcj02(lng, lat) {
  if (outOfChina(lng, lat)) return [lng, lat];
  const a = 6378245.0;
  const ee = 0.00669342162296594323;
  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI);
  dLng = (dLng * 180.0) / ((a / sqrtMagic) * Math.cos(radLat) * Math.PI);
  return [lng + dLng, lat + dLat];
}

function toLatLng(point) {
  const [gcjLng, gcjLat] = wgs84ToGcj02(point[0], point[1]);
  return [gcjLat, gcjLng];
}

function getDisplayTrackPoints(points) {
  if (!Array.isArray(points) || points.length === 0) return [];
  return points.map(toLatLng);
}

function stopTrackAnimation() {
  if (!animationTimer) return;
  clearInterval(animationTimer);
  animationTimer = null;
}

function clearMarkers() {
  if (startMarker) {
    startMarker.remove();
    startMarker = null;
  }
  if (endMarker) {
    endMarker.remove();
    endMarker = null;
  }
}

function invalidateMapSize() {
  if (!map || !mapContainer.value) return;
  const width = mapContainer.value.clientWidth || 0;
  const height = mapContainer.value.clientHeight || 0;
  if (width < 20 || height < 20) return;
  map.invalidateSize({ animate: false, pan: false });
}

function scheduleInitialInvalidate() {
  invalidateMapSize();
  setTimeout(invalidateMapSize, 100);
  setTimeout(invalidateMapSize, 320);
}

function applyGaodeBasemap(themeKey) {
  if (!map) return;

  if (baseLayer) {
    baseLayer.remove();
    baseLayer = null;
  }

  const styleCode = getThemeConfig(themeKey).styleCode;
  baseLayer = L.tileLayer(GAODE_TILE_URL, {
    subdomains: '1234',
    style: styleCode,
    minZoom: 3,
    maxZoom: 19,
    keepBuffer: 2,
    updateWhenIdle: true,
    updateWhenZooming: false,
    // attribution: '&copy; AutoNavi',
  });

  baseLayer.addTo(map);
}

function ensureTrackLayers() {
  if (!map) return;

  const theme = getThemeConfig(activeMapThemeKey.value);

  if (!trackPolyline) {
    trackPolyline = L.polyline([], {
      color: theme.trackColor,
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
  }

  if (!repeatedSegmentLayer) {
    repeatedSegmentLayer = L.layerGroup().addTo(map);
  }
}

function applyTrackTheme() {
  const theme = getThemeConfig(activeMapThemeKey.value);

  if (trackPolyline) {
    trackPolyline.setStyle({ color: theme.trackColor });
  }

  if (repeatedSegmentLayer) {
    repeatedSegmentLayer.eachLayer((layer) => {
      if (layer && typeof layer.setStyle === 'function') {
        layer.setStyle({
          color: theme.repeatSegmentColor,
          opacity: theme.repeatSegmentOpacity,
        });
      }
    });
  }
}

function normalizePointKey(point) {
  return `${Number(point[0]).toFixed(6)},${Number(point[1]).toFixed(6)}`;
}

function normalizeSegmentKey(a, b) {
  const aKey = normalizePointKey(a);
  const bKey = normalizePointKey(b);
  return aKey < bKey ? `${aKey}|${bKey}` : `${bKey}|${aKey}`;
}

function buildRepeatedSegments(points) {
  if (!Array.isArray(points) || points.length < 2) return [];

  const countMap = new Map();
  for (let i = 0; i < points.length - 1; i++) {
    const key = normalizeSegmentKey(points[i], points[i + 1]);
    countMap.set(key, (countMap.get(key) || 0) + 1);
  }

  const result = [];
  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    const key = normalizeSegmentKey(from, to);
    if ((countMap.get(key) || 1) <= 1) continue;
    result.push([from, to]);
  }

  return result;
}

function updateTrackPolyline(points) {
  if (!trackPolyline) return;
  trackPolyline.setLatLngs(points);
}

function updateRepeatedSegments(points) {
  if (!repeatedSegmentLayer) return;
  repeatedSegmentLayer.clearLayers();
  const theme = getThemeConfig(activeMapThemeKey.value);

  const segments = buildRepeatedSegments(points);
  for (const segment of segments) {
    L.polyline(segment, {
      color: theme.repeatSegmentColor,
      weight: 5,
      opacity: theme.repeatSegmentOpacity,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(repeatedSegmentLayer);
  }
}

function createMarkerIcon(label, className) {
  return L.divIcon({
    className: `custom-map-marker ${className}`,
    html: `<span>${label}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function renderMarkers(points) {
  clearMarkers();
  if (!map || points.length < 2) return;

  startMarker = L.marker(points[0], {
    icon: createMarkerIcon('起', 'marker-start'),
    interactive: false,
    keyboard: false,
  }).addTo(map);

  endMarker = L.marker(points[points.length - 1], {
    icon: createMarkerIcon('终', 'marker-end'),
    interactive: false,
    keyboard: false,
  }).addTo(map);
}

function fitToTrack(points) {
  if (!map || points.length < 2) return;

  const bounds = L.latLngBounds(points);
  if (!bounds.isValid()) return;

  map.fitBounds(bounds, {
    padding: [48, 48],
    animate: true,
    duration: 0.55,
    maxZoom: 18,
  });
}

function animateTrack(points) {
  stopTrackAnimation();

  if (points.length < 2) {
    updateTrackPolyline([]);
    updateRepeatedSegments([]);
    return Promise.resolve();
  }

  const total = points.length;
  const step = Math.max(1, Math.ceil((total - 1) / 60));
  let visible = 2;

  updateTrackPolyline(points.slice(0, visible));
  updateRepeatedSegments([]);

  return new Promise((resolve) => {
    animationTimer = setInterval(() => {
      visible = Math.min(total, visible + step);
      updateTrackPolyline(points.slice(0, visible));

      if (visible >= total) {
        stopTrackAnimation();
        updateRepeatedSegments(points);
        resolve();
      }
    }, 30);
  });
}

async function redrawTrack() {
  if (!map) return;

  const currentVersion = ++drawVersion;
  ensureTrackLayers();
  applyTrackTheme();
  const displayPoints = getDisplayTrackPoints(rawTrackPoints);

  if (!props.ready || displayPoints.length < 2) {
    stopTrackAnimation();
    updateTrackPolyline([]);
    updateRepeatedSegments([]);
    clearMarkers();
    return;
  }

  renderMarkers(displayPoints);
  fitToTrack(displayPoints);
  await animateTrack(displayPoints);

  if (currentVersion !== drawVersion) {
    stopTrackAnimation();
  }
}

async function initMap() {
  if (map || !mapContainer.value) return;

  map = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false,
    preferCanvas: true,
    zoomSnap: 0.5,
    zoomDelta: 0.5,
  });

  map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);

  L.control
    .attribution({
      position: 'bottomleft',
      prefix: false,
    })
    .addTo(map);

  applyGaodeBasemap(activeMapThemeKey.value);

  await new Promise((resolve) => map.whenReady(resolve));
  await nextTick();
  scheduleInitialInvalidate();

  if (typeof ResizeObserver !== 'undefined' && mapContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      invalidateMapSize();
    });
    resizeObserver.observe(mapContainer.value);
  }
}

watch(
  () => [props.track, props.ready],
  async ([track]) => {
    rawTrackPoints = parseTrack(track);
    if (!map) return;
    await redrawTrack();
  },
  { immediate: true },
);

watch(
  () => activeMapThemeKey.value,
  async (nextTheme, prevTheme) => {
    if (!map || nextTheme === prevTheme) return;
    applyGaodeBasemap(nextTheme);
    applyTrackTheme();
    await redrawTrack();
  },
);

onMounted(async () => {
  await initMap();
  invalidateMapSize();
  await redrawTrack();

  window.addEventListener('resize', invalidateMapSize);
  window.addEventListener('orientationchange', invalidateMapSize);
});

onBeforeUnmount(() => {
  stopTrackAnimation();
  clearMarkers();

  window.removeEventListener('resize', invalidateMapSize);
  window.removeEventListener('orientationchange', invalidateMapSize);

  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  if (baseLayer) {
    baseLayer.remove();
    baseLayer = null;
  }

  if (map) {
    map.remove();
    map = null;
  }

  trackPolyline = null;
  repeatedSegmentLayer = null;
});
</script>

<style scoped>
.map-preview-shell {
  background: var(--map-surface);
  box-shadow: var(--map-shadow);
  position: relative;
  z-index: 0;
}

:deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  background: var(--map-surface);
}

:deep(.leaflet-pane),
:deep(.leaflet-map-pane),
:deep(.leaflet-map-pane canvas) {
  z-index: 1 !important;
}

:deep(.leaflet-control-container) {
  z-index: 2 !important;
}

:deep(.leaflet-tile-pane) {
  filter: var(--map-tile-filter);
}

:deep(.leaflet-div-icon) {
  background: transparent;
  border: none;
}

:deep(.custom-map-marker) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border-radius: 50px;
  box-shadow: var(--map-marker-shadow);
  line-height: 1;
  text-align: center;
}

:deep(.marker-start) {
  background: #10b981;
}

:deep(.marker-end) {
  background: #f97316;
}

:deep(.leaflet-control-attribution) {
  background: var(--map-attribution-bg);
  color: var(--map-attribution-text);
}

:deep(.leaflet-control-attribution a) {
  color: var(--map-attribution-link);
}
</style>
