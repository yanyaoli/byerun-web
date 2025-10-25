<template>
  <div class="map-preview-root">
    <div v-if="!apiKey" class="map-missing">请在环境变量中配置 VITE_AMAP_KEY 以显示地图</div>
    <div v-else ref="mapContainer" class="map-container" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { config } from '../utils/config';

const props = defineProps({
  track: {
    type: [String, null],
    default: null
  }
});

// Read AMap key from Vite env, fall back to empty string
const API_KEY = config.key.amapKey;
const SECURITY = config.key.amapSecurity;

const apiKey = API_KEY || '';
const mapContainer = ref(null);
let map = null;
let polyline = null;
let startMarker = null;
let endMarker = null;

function loadAmapScript() {
  if (!window.AMap) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}&plugin=AMap.ToolBar&securityJsCode=${SECURITY}`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('AMap script load failed'));
      document.head.appendChild(script);
    });
  }
  return Promise.resolve();
}

function parseTrack(trackStr) {
  if (!trackStr) return [];
  let arr = [];
  try {
    const parsed = JSON.parse(trackStr);
    if (Array.isArray(parsed)) arr = parsed;
  } catch (e) {
    // try comma-separated
    return [];
  }
  const coords = arr
    .map((s) => {
      const parts = String(s).split('-');
      const lng = Number(parts[0]);
      const lat = Number(parts[1]);
      return [lng, lat];
    })
    .filter((p) => Array.isArray(p) && p.length >= 2 && !Number.isNaN(p[0]) && !Number.isNaN(p[1]));
  return coords;
}

async function ensureMap() {
  if (!apiKey) return;
  await loadAmapScript();
  const AMap = window.AMap;
  if (!map && mapContainer.value) {
    map = new AMap.Map(mapContainer.value, {
      zoom: 15,
      viewMode: '2D',
      pitch: 0,
      center: undefined,
    });
  }
}

function drawTrack(trackStr) {
  if (!map) return;
  const coords = parseTrack(trackStr);
  // clear previous
  if (polyline) {
    map.remove(polyline);
    polyline = null;
  }
  if (startMarker) {
    map.remove(startMarker);
    startMarker = null;
  }
  if (endMarker) {
    map.remove(endMarker);
    endMarker = null;
  }
  if (coords.length === 0) return;
  // AMap expects [lng, lat]
  polyline = new window.AMap.Polyline({
    path: coords,
    showDir: false,
    strokeColor: '#3b9eff',
    strokeWeight: 4,
    strokeOpacity: 0.9,
  });
  map.add(polyline);

  const start = coords[0];
  const end = coords[coords.length - 1];
  startMarker = new window.AMap.Marker({
    position: start,
    title: '起点',
    content: '<div class="amap-marker-start">起</div>',
  });
  endMarker = new window.AMap.Marker({
    position: end,
    title: '终点',
    content: '<div class="amap-marker-end">终</div>',
  });
  map.add(startMarker);
  map.add(endMarker);

  try {
    map.setFitView([polyline, startMarker, endMarker], true);
  } catch (e) {
    // ignore
  }
}

onMounted(async () => {
  if (!apiKey) return;
  try {
    await ensureMap();
    drawTrack(props.track);
  } catch (e) {
    // console.warn('Map load error', e);
  }
});

watch(() => props.track, (v) => {
  if (!apiKey) return;
  if (!map) {
    ensureMap().then(() => drawTrack(v));
  } else {
    drawTrack(v);
  }
});

onBeforeUnmount(() => {
  if (map) {
    map.destroy();
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
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
}
.map-missing {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7b8a8b;
  background: #f6f7f9;
  border-radius: 8px;
  border: 1px dashed #e3e6e8;
}
.amap-marker-start, .amap-marker-end {
  display: inline-block;
  padding: 6px 8px;
  color: #fff;
  font-weight: 600;
  border-radius: 12px;
}
.amap-marker-start { background: #28c76f; }
.amap-marker-end { background: #ff6b6b; }
</style>
