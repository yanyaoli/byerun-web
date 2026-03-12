<template>
  <div class="map-preview-root">
    <div ref="mapContainer" class="map-container" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { gcj02ToWgs84 } from '@/utils/coordinate';

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
    default: 'dark',
  },
});

const mapContainer = ref(null);

const BASEMAP_STYLES = {
  city: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  dark: 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json',
  darkMatter: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
};

const TRACK_SOURCE_ID = 'byerun-track-source';
const TRACK_SEGMENT_SOURCE_ID = 'byerun-track-segment-source';
const TRACK_LAYER_ID = 'byerun-track-layer';
const TRACK_SEGMENT_LAYER_ID = 'byerun-track-segment-layer';
const DEFAULT_CENTER = [104.066541, 30.572269];
const DEFAULT_ZOOM = 12;

let map = null;
let trackPoints = [];
let drawVersion = 0;
let trackTimer = null;
let startMarker = null;
let endMarker = null;

function resolveBasemapStyle(styleKey) {
  return BASEMAP_STYLES[styleKey] || BASEMAP_STYLES.city;
}

function stopTrackAnimation() {
  if (trackTimer) {
    clearInterval(trackTimer);
    trackTimer = null;
  }
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

  const result = [];
  for (const item of parsed) {
    const [lngRaw, latRaw] = String(item || '').split('-');
    const lng = Number(lngRaw);
    const lat = Number(latRaw);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
    const [wgsLng, wgsLat] = gcj02ToWgs84(lng, lat);

    const prev = result[result.length - 1];
    if (!prev || prev[0] !== wgsLng || prev[1] !== wgsLat) {
      result.push([wgsLng, wgsLat]);
    }
  }
  return result;
}

function ensureTrackLayer() {
  if (!map) return;

  if (!map.getSource(TRACK_SOURCE_ID)) {
    map.addSource(TRACK_SOURCE_ID, {
      type: 'geojson',
      lineMetrics: true,
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [],
        },
      },
    });
  }

  if (!map.getSource(TRACK_SEGMENT_SOURCE_ID)) {
    map.addSource(TRACK_SEGMENT_SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
  }

  if (!map.getLayer(TRACK_LAYER_ID)) {
    map.addLayer({
      id: TRACK_LAYER_ID,
      type: 'line',
      source: TRACK_SOURCE_ID,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-width': 5,
        'line-opacity': 0.9,
        'line-gradient': ['interpolate', ['linear'], ['line-progress'], 0, '#5eead4', 1, '#2563eb'],
      },
    });
  }

  if (!map.getLayer(TRACK_SEGMENT_LAYER_ID)) {
    map.addLayer({
      id: TRACK_SEGMENT_LAYER_ID,
      type: 'line',
      source: TRACK_SEGMENT_SOURCE_ID,
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-width': 5,
        'line-color': '#f59e0b',
        'line-opacity': [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'repeat'], 1],
          1,
          0,
          2,
          0.22,
          3,
          0.34,
          4,
          0.46,
          6,
          0.58,
        ],
      },
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

function buildSegmentFeatures(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 2) return [];

  const countMap = new Map();
  for (let i = 0; i < coordinates.length - 1; i++) {
    const from = coordinates[i];
    const to = coordinates[i + 1];
    const key = normalizeSegmentKey(from, to);
    countMap.set(key, (countMap.get(key) || 0) + 1);
  }

  const features = [];
  for (let i = 0; i < coordinates.length - 1; i++) {
    const from = coordinates[i];
    const to = coordinates[i + 1];
    const key = normalizeSegmentKey(from, to);
    const repeat = countMap.get(key) || 1;
    if (repeat <= 1) continue;

    features.push({
      type: 'Feature',
      properties: { repeat },
      geometry: {
        type: 'LineString',
        coordinates: [from, to],
      },
    });
  }

  return features;
}

function updateTrackSource(coordinates) {
  const trackSource = map?.getSource(TRACK_SOURCE_ID);
  const segmentSource = map?.getSource(TRACK_SEGMENT_SOURCE_ID);
  if (!trackSource || !segmentSource) return;

  trackSource.setData({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates,
    },
  });

  segmentSource.setData({
    type: 'FeatureCollection',
    features: buildSegmentFeatures(coordinates),
  });
}

function createMarkerElement(label, className) {
  const el = document.createElement('div');
  el.className = `custom-map-marker ${className}`;
  el.textContent = label;
  return el;
}

function renderMarkers(coords) {
  clearMarkers();
  if (!map || coords.length < 2) return;

  startMarker = new maplibregl.Marker({
    element: createMarkerElement('起', 'marker-start'),
    offset: [0, -13],
  })
    .setLngLat(coords[0])
    .addTo(map);

  endMarker = new maplibregl.Marker({
    element: createMarkerElement('终', 'marker-end'),
    offset: [0, -13],
  })
    .setLngLat(coords[coords.length - 1])
    .addTo(map);
}

function fitToTrack(coords) {
  if (!map || coords.length < 2) return;

  const bounds = coords.reduce(
    (acc, point) => acc.extend(point),
    new maplibregl.LngLatBounds(coords[0], coords[0]),
  );

  map.fitBounds(bounds, {
    padding: 60,
    duration: 600,
    maxZoom: 18,
  });
}

function animateTrack(coords) {
  stopTrackAnimation();

  if (!map || coords.length < 2) {
    updateTrackSource([]);
    return Promise.resolve();
  }

  const total = coords.length;
  const step = Math.max(1, Math.ceil((total - 1) / 60));
  let visible = 2;
  updateTrackSource(coords.slice(0, visible));

  return new Promise((resolve) => {
    trackTimer = setInterval(() => {
      visible = Math.min(total, visible + step);
      updateTrackSource(coords.slice(0, visible));

      if (visible >= total) {
        stopTrackAnimation();
        resolve();
      }
    }, 30);
  });
}

async function redrawTrack() {
  if (!map || !map.isStyleLoaded()) return;

  const currentVersion = ++drawVersion;
  ensureTrackLayer();

  if (!props.ready || trackPoints.length < 2) {
    stopTrackAnimation();
    updateTrackSource([]);
    clearMarkers();
    return;
  }

  renderMarkers(trackPoints);
  fitToTrack(trackPoints);
  await animateTrack(trackPoints);

  if (currentVersion !== drawVersion) {
    stopTrackAnimation();
  }
}

async function initMap() {
  if (map || !mapContainer.value) return;

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: resolveBasemapStyle(props.mapStyle),
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    attributionControl: false,
    renderWorldCopies: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

  map.addControl(
    new maplibregl.NavigationControl({
      showCompass: true,
      visualizePitch: true,
    }),
    'bottom-right',
  );

  await new Promise((resolve) => map.once('load', resolve));
}

watch(
  () => [props.track, props.ready],
  async ([track]) => {
    trackPoints = parseTrack(track);
    if (!map) return;
    await redrawTrack();
  },
  { immediate: true },
);

watch(
  () => props.mapStyle,
  async (nextStyle, prevStyle) => {
    if (!map || nextStyle === prevStyle) return;

    stopTrackAnimation();
    map.setStyle(resolveBasemapStyle(nextStyle));
    await new Promise((resolve) => map.once('style.load', resolve));
    await redrawTrack();
  },
);

onMounted(async () => {
  await initMap();
  await redrawTrack();
});

onBeforeUnmount(() => {
  stopTrackAnimation();
  clearMarkers();

  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
.map-preview-root {
  width: 100%;
}

.map-container {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  background: #1a2230;
  border: 1px solid #1a2235;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
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
  border: 2px solid #0b1020;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
  line-height: 1;
  text-align: center;
}

:deep(.marker-start) {
  background: #10b981;
}

:deep(.marker-end) {
  background: #f97316;
}

:deep(.maplibregl-ctrl-group) {
  background: #121826;
  border: 1px solid #1f2937;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
}

:deep(.maplibregl-ctrl button) {
  background-color: transparent;
}

:deep(.maplibregl-ctrl button .maplibregl-ctrl-icon) {
  filter: invert(92%) sepia(9%) saturate(282%) hue-rotate(185deg) brightness(106%) contrast(96%);
}

:deep(.maplibregl-ctrl-attrib) {
  background: rgba(10, 16, 30, 0.75);
  color: #94a3b8;
}

:deep(.maplibregl-ctrl-attrib a) {
  color: #cbd5e1;
}
</style>
