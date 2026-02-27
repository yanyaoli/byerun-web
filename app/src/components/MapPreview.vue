<template>
  <div class="map-preview-root">
    <div v-if="!apiKey" class="map-missing">请在环境变量中配置 VITE_AMAP_KEY 以显示地图</div>
    <div v-else ref="mapContainer" class="map-container" />
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { amapConfig } from '@/utils/config';

const props = defineProps({
  track: {
    type: [String, Array, null],
    default: null,
  },
  ready: {
    type: Boolean,
    default: false,
  },
});

const API_KEY = amapConfig.jsApiKey;
const SECURITY = amapConfig.securityJsCode;
const apiKey = API_KEY || '';
const AMAP_SCRIPT_ID = 'byerun-amap-sdk';
const AMAP_SCRIPT_PROMISE_KEY = '__byerunAmapScriptPromise__';

const mapContainer = ref(null);
let map = null;
let mapInitPromise = null;
let mapObjects = { polylines: [], markers: [], timer: null, animationResolve: null };

// 加载高德地图脚本
async function loadAmapScript() {
  if (window.AMap) return;

  const existingPromise = window[AMAP_SCRIPT_PROMISE_KEY];
  if (existingPromise) {
    await existingPromise;
    return;
  }

  const src = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}&plugin=AMap.ToolBar`;
  const promise = new Promise((resolve, reject) => {
    const cleanupOnError = (error) => {
      window[AMAP_SCRIPT_PROMISE_KEY] = null;
      reject(error);
    };

    const resolveIfReady = () => {
      if (window.AMap) {
        resolve();
      } else {
        cleanupOnError(new Error('AMap SDK load failed'));
      }
    };

    const existingScript =
      document.getElementById(AMAP_SCRIPT_ID) ||
      document.querySelector('script[src*="webapi.amap.com/maps?v=2.0"]');
    if (existingScript) {
      if (window.AMap) {
        resolve();
        return;
      }
      existingScript.addEventListener('load', resolveIfReady, { once: true });
      existingScript.addEventListener(
        'error',
        () => cleanupOnError(new Error('AMap SDK load failed')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.id = AMAP_SCRIPT_ID;
    script.src = src;
    script.async = true;
    script.onload = resolveIfReady;
    script.onerror = () => cleanupOnError(new Error('AMap SDK load failed'));
    document.head.appendChild(script);
  });

  window[AMAP_SCRIPT_PROMISE_KEY] = promise;
  await promise;
}

// 解析轨迹坐标
function parseTrack(trackStr) {
  if (!trackStr || !window.AMap) return [];

  try {
    const rawArr = typeof trackStr === 'string' ? JSON.parse(trackStr) : trackStr;
    if (!Array.isArray(rawArr)) return [];

    return rawArr
      .map((item) => {
        const [lng, lat] = String(item || '').split('-');
        const lngNum = parseFloat(lng);
        const latNum = parseFloat(lat);
        return isFinite(lngNum) && isFinite(latNum) ? new window.AMap.LngLat(lngNum, latNum) : null;
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

// 计算颜色（从浅到深）
function getProgressColor(index, total) {
  const progress = Math.min(index / Math.max(total - 1, 1), 1);
  // 从 #90caf9（浅蓝） 到 #1565c0（深蓝）
  const startColor = { r: 144, g: 202, b: 249 };
  const endColor = { r: 21, g: 101, b: 192 };

  const r = Math.round(startColor.r + (endColor.r - startColor.r) * progress);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * progress);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * progress);

  return `rgb(${r},${g},${b})`;
}

// 检测重复区域，返回经过次数热力图
function calculateHeatmap(coords) {
  const heat = new Map();
  coords.forEach((coord) => {
    const key = `${coord.lng.toFixed(5)},${coord.lat.toFixed(5)}`;
    heat.set(key, (heat.get(key) || 0) + 1);
  });
  return heat;
}

// 清理地图对象
function clearMapObjects() {
  if (mapObjects.timer) clearInterval(mapObjects.timer);
  // 如果动画仍在进行，触发其 resolve，避免挂起的 Promise
  if (mapObjects.animationResolve) {
    try {
      mapObjects.animationResolve();
    } catch (e) {}
  }
  mapObjects.polylines.forEach((poly) => map && map.remove(poly));
  mapObjects.markers.forEach((marker) => map && map.remove(marker));
  mapObjects = { polylines: [], markers: [], timer: null, animationResolve: null };
}

// 初始化地图
async function initMap() {
  if (map || !apiKey) return;
  if (mapInitPromise) {
    await mapInitPromise;
    return;
  }

  mapInitPromise = (async () => {
    if (SECURITY) {
      window._AMapSecurityConfig = { securityJsCode: SECURITY };
    }

    await loadAmapScript();
    if (!mapContainer.value || map) return;

    const AMap = window.AMap;
    map = new AMap.Map(mapContainer.value, {
      zoom: 12,
      viewMode: '2D',
      center: [104.066541, 30.572269],
    });

    await new Promise((resolve) => map.on('complete', resolve));
  })().finally(() => {
    mapInitPromise = null;
  });

  await mapInitPromise;
}

// 绘制轨迹
async function drawTrack(trackStr) {
  if (!map || !props.ready || !window.AMap) return;

  const coords = parseTrack(trackStr);
  if (coords.length < 2) return;

  clearMapObjects();
  const AMap = window.AMap;
  const heat = calculateHeatmap(coords);

  // 用分段线条绘制，每段都有渐进颜色，重复区域更深
  for (let i = 0; i < coords.length - 1; i++) {
    const key = `${coords[i].lng.toFixed(5)},${coords[i].lat.toFixed(5)}`;
    const repeatCount = heat.get(key) || 1;
    const baseOpacity = 0.6;
    const opacity = Math.min(baseOpacity + (repeatCount - 1) * 0.2, 1);

    const polyline = new AMap.Polyline({
      path: [coords[i], coords[i + 1]],
      strokeColor: getProgressColor(i, coords.length),
      strokeWeight: 5,
      strokeOpacity: opacity,
      lineJoin: 'round',
      lineCap: 'round',
    });
    map.add(polyline);
    mapObjects.polylines.push(polyline);
  }

  // 添加起点标记
  const startMarker = new AMap.Marker({
    position: coords[0],
    zIndex: 101,
    offset: new AMap.Pixel(-13, -30),
    content: '<div class="custom-map-marker marker-start">起</div>',
  });
  map.add(startMarker);
  mapObjects.markers.push(startMarker);

  // 动画完成后再显示终点标记
  await animateTrack(coords);
  const endMarker = new AMap.Marker({
    position: coords[coords.length - 1],
    zIndex: 100,
    offset: new AMap.Pixel(-13, -30),
    content: '<div class="custom-map-marker marker-end">终</div>',
  });
  map.add(endMarker);
  mapObjects.markers.push(endMarker);

  // 适配视图
  if (mapObjects.polylines.length > 0) {
    map.setFitView(mapObjects.polylines, false, [60, 60, 60, 60]);
  }

  // 简化的动画：只显示部分线条，逐步显示全部
  // animateTrack 返回 Promise，已在 drawTrack 中 await
}

// 轨迹动画展示
function animateTrack(coords) {
  return new Promise((resolve) => {
    let visibleCount = 1;
    const totalSegments = coords.length - 1;
    const step = Math.ceil(totalSegments / 60) || 1;

    mapObjects.polylines.forEach((poly) => poly.hide());

    // 保存 resolve，以便在 clearMapObjects 中取消时调用
    mapObjects.animationResolve = () => {
      mapObjects.animationResolve = null;
      resolve();
    };

    mapObjects.timer = setInterval(() => {
      if (visibleCount <= totalSegments) {
        for (let i = 0; i < Math.min(visibleCount, mapObjects.polylines.length); i++) {
          mapObjects.polylines[i].show();
        }
        visibleCount += step;
      } else {
        clearInterval(mapObjects.timer);
        mapObjects.timer = null;
        if (mapObjects.animationResolve) {
          mapObjects.animationResolve();
        } else {
          resolve();
        }
      }
    }, 30);
  });
}

watch(
  () => [props.track, props.ready],
  async ([track, ready]) => {
    if (!apiKey || !ready) return;

    if (!map) {
      await initMap();
    }
    await drawTrack(track);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearMapObjects();
  mapInitPromise = null;
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
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f2f5;
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

:deep(.custom-map-marker) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  border-radius: 4px;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  line-height: 22px;
  text-align: center;
}

:deep(.marker-start) {
  background: #28c76f;
}

:deep(.marker-end) {
  background: #ff6b6b;
}
</style>
