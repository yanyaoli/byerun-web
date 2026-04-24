<template>
  <div ref="drawerContainer" class="map-drawer">
    <!-- 搜索栏 -->
    <div class="search-box">
      <div class="search-input-wrapper">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索位置..."
          @input="onSearchInput"
          @focus="showSearchResults = true"
          @blur="onSearchBlur"
        />
        <i class="ri-search-line search-icon"></i>
      </div>
      <transition name="dropdown">
        <div v-show="showSearchResults && searchResults.length" class="search-results-dropdown">
          <div
            v-for="(result, idx) in searchResults"
            :key="idx"
            class="search-result-item"
            @click="selectSearchResult(result)"
          >
            <div class="result-name">{{ result.name }}</div>
            <div class="result-detail">{{ result.detail }}</div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <button
        type="button"
        class="tool-btn"
        :class="{ active: currentTool === 'draw' }"
        @click="setTool('draw')"
        title="画笔绘制"
      >
        <i class="ri-brush-line"></i>
        画笔
      </button>
      <button
        type="button"
        class="tool-btn"
        :class="{ active: currentTool === 'pan' }"
        @click="setTool('pan')"
        title="拖动地图"
      >
        <i class="ri-hand-line"></i>
        拖动
      </button>
      <button
        type="button"
        class="tool-btn"
        @click="locateUser"
        :disabled="locatingUser"
        title="定位到当前位置"
      >
        <i :class="locatingUser ? 'ri-loader-4-line spin' : 'ri-navigation-line'"></i>
        {{ locatingUser ? '定位中' : '定位' }}
      </button>
      <div class="tool-divider"></div>
      <button
        type="button"
        class="tool-btn"
        @click="undoLastPoint"
        :disabled="points.length === 0"
        title="撤销最后一个点"
      >
        <i class="ri-arrow-go-back-line"></i>
        撤销
      </button>
      <button
        type="button"
        class="tool-btn"
        @click="clearAllPoints"
        :disabled="points.length === 0"
        title="清除所有点"
      >
        <i class="ri-delete-bin-line"></i>
        清除
      </button>
      <div class="tool-divider"></div>
      <button type="button" class="tool-btn" @click="exportTrack" :disabled="points.length < 2">
        <i class="ri-download-line"></i>
        导出
      </button>
      <button type="button" class="tool-btn" @click="showImportDialog = true">
        <i class="ri-upload-line"></i>
        导入
      </button>
    </div>

    <!-- 地图容器 -->
    <div class="map-wrapper" :class="{ 'drawing-mode': currentTool === 'draw' }">
      <div ref="mapContainer" class="map-container"></div>
      <div class="map-stats">
        <div class="stat-item">
          <div class="stat-value">{{ points.length }}</div>
          <div class="stat-label">个点位</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ totalDistance }}</div>
          <div class="stat-label">km</div>
        </div>
      </div>
      <div v-if="hint" class="map-hint">{{ hint }}</div>
    </div>

    <!-- 导入对话框 -->
    <Teleport v-if="showImportDialog" to="body">
      <div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div
          class="bg-slate-900 rounded-2xl p-6 w-11/12 max-w-md max-h-[80vh] overflow-auto shadow-xl border border-slate-700"
        >
          <h3 class="text-lg font-semibold text-slate-100 mb-4">导入轨迹数据</h3>
          <div class="import-form">
            <div class="form-group">
              <label class="form-label">选择 JSON 文件</label>
              <input
                type="file"
                class="form-file"
                accept=".json,application/json"
                @change="onImportFileSelected"
              />
              <div v-if="importFileName" class="form-tip">已选择: {{ importFileName }}</div>
              <div v-if="importError" class="form-error">{{ importError }}</div>
            </div>
            <div class="form-group" v-if="importPreviewData.length">
              <label class="form-label">地图名称（保存到本地）</label>
              <input
                v-model.trim="importMapName"
                type="text"
                class="form-input"
                placeholder="例如：自定义路线 1"
              />
              <div class="form-tip">
                已核验并显示 {{ importPreviewData.length }} 个点，请确认导入到本地地图
              </div>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button
              type="button"
              class="flex-1 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-slate-100 font-medium"
              @click="closeImportDialog"
            >
              取消
            </button>
            <button
              type="button"
              class="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-white font-medium disabled:opacity-50"
              @click="confirmImport"
              :disabled="importLoading || importPreviewData.length < 2"
            >
              {{ importLoading ? '处理中...' : '确认导入到本地' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue';
import L from 'leaflet';
import { saveCustomMap, validateMapData } from '@/utils/map';

const GAODE_TILE_URL =
  'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style={style}&x={x}&y={y}&z={z}';

const props = defineProps({
  initialTrack: {
    type: Array,
    default: () => [],
  },
  center: {
    type: Array,
    default: () => [30.572269, 104.066541],
  },
  zoom: {
    type: Number,
    default: 13,
  },
});

const emit = defineEmits(['track-changed', 'track-saved']);
const showMessage = inject('showMessage', null);

// 状态
const drawerContainer = ref(null);
const mapContainer = ref(null);
let map = null;
let polyline = null;
let markersGroup = null;
let userLocationMarker = null;
let clickSuppressUntil = 0;

const currentTool = ref('pan');
const points = ref([]);
const isDrawing = ref(false);
const lastDrawPoint = ref(null);
const drawThrottleTime = ref(0);

const searchQuery = ref('');
const searchResults = ref([]);
const showSearchResults = ref(false);
const searchTimer = ref(null);

const showImportDialog = ref(false);
const importMapName = ref('');
const importFileName = ref('');
const importPreviewData = ref([]);
const importError = ref('');
const importLoading = ref(false);
const locatingUser = ref(false);

// 计算属性
const totalDistance = computed(() => {
  if (points.value.length < 2) return '0.0';
  let distance = 0;
  for (let i = 0; i < points.value.length - 1; i++) {
    distance += getDistanceBetween(points.value[i], points.value[i + 1]);
  }
  return (distance / 1000).toFixed(1);
});

const hint = computed(() => {
  if (currentTool.value === 'draw') {
    return '单指滑动绘制，双指可缩放地图';
  }
  return '切换到画笔后单指绘制，当前可拖动浏览地图';
});

// 工具函数
function getDistanceBetween(p1, p2) {
  // Haversine距离计算 (单位: 米)
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6378137; // 地球半径
  const dLat = toRad(p2[0] - p1[0]);
  const dLng = toRad(p2[1] - p1[1]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1[0])) * Math.cos(toRad(p2[0])) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function setTool(tool) {
  currentTool.value = tool;
  if (tool === 'pan' && map) {
    map.dragging.enable();
  } else if (map) {
    map.dragging.disable();
  }
}

function addPoint(latlng) {
  const point = [latlng.lat, latlng.lng];
  // 检查最小距离，避免重复点
  if (points.value.length > 0) {
    const lastPoint = points.value[points.value.length - 1];
    const distance = getDistanceBetween(lastPoint, point);
    if (distance < 2) return; // 小于2米不添加
  }

  points.value.push(point);
  updatePolyline();
  emit('track-changed', [...points.value]);
}

function undoLastPoint() {
  if (points.value.length > 0) {
    points.value.pop();
    updatePolyline();
    emit('track-changed', [...points.value]);
  }
}

function clearAllPoints() {
  points.value = [];
  updatePolyline();
  emit('track-changed', []);
}

function updatePolyline() {
  if (!map || !markersGroup) return;

  // 更新标记
  markersGroup.clearLayers();
  points.value.forEach((point) => {
    const marker = L.circleMarker([point[0], point[1]], {
      radius: 4,
      fillColor: '#3b82f6',
      color: '#fff',
      weight: 1.5,
      opacity: 1,
      fillOpacity: 0.8,
    }).addTo(markersGroup);
  });

  // 更新折线
  if (polyline) {
    map.removeLayer(polyline);
  }
  if (points.value.length >= 2) {
    polyline = L.polyline(points.value, {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
  }
}

function focusToTrack(trackPoints) {
  if (!map || !Array.isArray(trackPoints) || trackPoints.length === 0) return;

  if (trackPoints.length === 1) {
    map.setView(trackPoints[0], Math.max(map.getZoom(), 17), {
      animate: false,
    });
    return;
  }

  const bounds = L.latLngBounds(trackPoints);
  if (bounds.isValid()) {
    map.fitBounds(bounds, {
      padding: [24, 24],
      maxZoom: 18,
      animate: false,
    });
  }
}

function onMapClick(e) {
  if (Date.now() < clickSuppressUntil) return;
  if (currentTool.value === 'draw') {
    addPoint(e.latlng);
  }
}

function onMapMouseDown(e) {
  if (currentTool.value === 'draw') {
    isDrawing.value = true;
    drawThrottleTime.value = 0;
    lastDrawPoint.value = null;
    addPoint(e.latlng);
  }
}

function onMapMouseMove(e) {
  if (!isDrawing.value || currentTool.value !== 'draw') return;
  const now = Date.now();
  if (now - drawThrottleTime.value < 16) return; // 限制帧率
  drawThrottleTime.value = now;

  // 检查最小距离
  if (lastDrawPoint.value) {
    const distance = getDistanceBetween(lastDrawPoint.value, [e.latlng.lat, e.latlng.lng]);
    if (distance < 3) return; // 小于3米不添加
  }

  lastDrawPoint.value = [e.latlng.lat, e.latlng.lng];
  addPoint(e.latlng);
}

function onMapMouseUp() {
  isDrawing.value = false;
}

function onMapTouchStart(event) {
  if (currentTool.value !== 'draw' || !map) return;
  if (event.touches.length !== 1) {
    isDrawing.value = false;
    return;
  }

  event.preventDefault();
  clickSuppressUntil = Date.now() + 400;

  const touch = event.touches[0];
  const latlng = map.mouseEventToLatLng(touch);
  isDrawing.value = true;
  drawThrottleTime.value = 0;
  lastDrawPoint.value = null;
  addPoint(latlng);
}

function onMapTouchMove(event) {
  if (!isDrawing.value || currentTool.value !== 'draw' || !map) return;
  if (event.touches.length !== 1) {
    isDrawing.value = false;
    return;
  }

  event.preventDefault();

  const now = Date.now();
  if (now - drawThrottleTime.value < 16) return;
  drawThrottleTime.value = now;

  const touch = event.touches[0];
  const latlng = map.mouseEventToLatLng(touch);

  if (lastDrawPoint.value) {
    const distance = getDistanceBetween(lastDrawPoint.value, [latlng.lat, latlng.lng]);
    if (distance < 3) return;
  }

  lastDrawPoint.value = [latlng.lat, latlng.lng];
  addPoint(latlng);
}

function onMapTouchEnd() {
  isDrawing.value = false;
}

function updateViewportHeight() {
  if (!drawerContainer.value) return;
  const vh = window.innerHeight * 0.01;
  drawerContainer.value.style.setProperty('--drawer-vh', `${vh}px`);

  if (map) {
    requestAnimationFrame(() => {
      map.invalidateSize(false);
    });
  }
}

function bindTouchEvents() {
  if (!mapContainer.value) return;
  mapContainer.value.addEventListener('touchstart', onMapTouchStart, { passive: false });
  mapContainer.value.addEventListener('touchmove', onMapTouchMove, { passive: false });
  mapContainer.value.addEventListener('touchend', onMapTouchEnd, { passive: true });
  mapContainer.value.addEventListener('touchcancel', onMapTouchEnd, { passive: true });
}

function unbindTouchEvents() {
  if (!mapContainer.value) return;
  mapContainer.value.removeEventListener('touchstart', onMapTouchStart);
  mapContainer.value.removeEventListener('touchmove', onMapTouchMove);
  mapContainer.value.removeEventListener('touchend', onMapTouchEnd);
  mapContainer.value.removeEventListener('touchcancel', onMapTouchEnd);
}

// 搜索功能
async function onSearchInput() {
  if (searchTimer.value) clearTimeout(searchTimer.value);

  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  searchTimer.value = setTimeout(() => {
    performSearch();
  }, 300);
}

async function performSearch() {
  const query = searchQuery.value.trim();
  if (!query) return;

  try {
    // 使用Nominatim (OpenStreetMap) 免费地理编码API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10`,
      {
        headers: {
          Accept: 'application/json',
          // Nominatim 要求提供User-Agent
          'User-Agent': 'ByerunMapDrawer/1.0',
        },
      },
    );
    const results = await response.json();

    searchResults.value = results.map((result) => ({
      name: result.name,
      detail: result.address || '',
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    }));
  } catch (error) {
    console.error('Search error:', error);
    searchResults.value = [];
  }
}

function selectSearchResult(result) {
  if (map) {
    map.setView([result.lat, result.lng], 17);
  }
  showSearchResults.value = false;
  searchQuery.value = '';
  searchResults.value = [];
}

function onSearchBlur() {
  setTimeout(() => {
    showSearchResults.value = false;
  }, 200);
}

// 导入导出
function exportTrack() {
  const data = points.value.map((p) => `${p[1].toFixed(6)},${p[0].toFixed(6)}`);
  const json = JSON.stringify(data, null, 2);

  // 下载文件
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `track-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  emit('track-saved', data);
}

function showToast(message, type = 'info') {
  if (typeof showMessage === 'function') {
    showMessage(message, type);
  }
}

function closeImportDialog() {
  showImportDialog.value = false;
  importMapName.value = '';
  importFileName.value = '';
  importPreviewData.value = [];
  importError.value = '';
  importLoading.value = false;
}

function getFileBaseName(fileName) {
  if (!fileName) return '';
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
}

async function onImportFileSelected(event) {
  importError.value = '';
  const file = event?.target?.files?.[0];
  if (!file) {
    importPreviewData.value = [];
    return;
  }

  importLoading.value = true;
  try {
    const text = await file.text();
    const result = validateMapData(text);
    if (!result.valid) {
      importPreviewData.value = [];
      importError.value = result.error || '导入数据无效';
      return;
    }

    importFileName.value = file.name;
    importMapName.value = importMapName.value || getFileBaseName(file.name);
    importPreviewData.value = result.points.map(([lng, lat]) => `${lng},${lat}`);

    points.value = result.points.map(([lng, lat]) => [lat, lng]);
    updatePolyline();
    emit('track-changed', [...points.value]);
    showToast('导入数据已核验并显示，请确认是否保存到本地地图', 'info');
  } catch (error) {
    importPreviewData.value = [];
    importError.value = `读取文件失败：${error.message}`;
  } finally {
    importLoading.value = false;
    if (event?.target) {
      event.target.value = '';
    }
  }
}

function confirmImport() {
  importError.value = '';
  importLoading.value = true;

  try {
    if (importPreviewData.value.length < 2) {
      importError.value = '请先选择并核验 JSON 文件';
      return;
    }
    const mapName = importMapName.value || `导入路线-${Date.now()}`;
    saveCustomMap('', mapName, importPreviewData.value);
    showToast('导入成功，已保存到本地地图', 'success');
    closeImportDialog();
  } catch (error) {
    importError.value = '保存失败：' + error.message;
  } finally {
    importLoading.value = false;
  }
}

function locateUser() {
  if (!map || locatingUser.value) return;
  if (!navigator.geolocation) {
    showToast('当前浏览器不支持定位功能', 'error');
    return;
  }

  locatingUser.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      map.setView([lat, lng], Math.max(map.getZoom(), 17), {
        animate: true,
      });

      if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
      }

      userLocationMarker = L.circleMarker([lat, lng], {
        radius: 7,
        fillColor: '#22d3ee',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.95,
      }).addTo(map);

      showToast('已定位到当前位置', 'success');
      locatingUser.value = false;
    },
    (error) => {
      const message =
        error.code === 1
          ? '定位权限被拒绝，请在浏览器中允许定位'
          : error.code === 2
            ? '无法获取当前位置，请检查定位服务'
            : '定位超时，请稍后重试';
      showToast(message, 'error');
      locatingUser.value = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    },
  );
}

// 初始化地图
function initMap() {
  if (!mapContainer.value || map) return;

  map = L.map(mapContainer.value, {
    center: props.center,
    zoom: props.zoom,
    zoomControl: false,
    attributionControl: false,
  });

  L.tileLayer(GAODE_TILE_URL, {
    subdomains: '1234',
    style: 8,
    minZoom: 3,
    maxZoom: 19,
    keepBuffer: 2,
    updateWhenIdle: true,
    updateWhenZooming: false,
  }).addTo(map);

  markersGroup = L.layerGroup().addTo(map);

  // 绑定事件
  map.on('click', onMapClick);
  map.on('mousedown', onMapMouseDown);
  map.on('mousemove', onMapMouseMove);
  map.on('mouseup', onMapMouseUp);
  map.on('mouseout', onMapMouseUp);
  bindTouchEvents();

  // 加载初始轨迹
  if (props.initialTrack && props.initialTrack.length > 0) {
    points.value = props.initialTrack.map((p) => {
      if (typeof p === 'string') {
        const [lng, lat] = p.split(',').map(parseFloat);
        return [lat, lng];
      }
      return p;
    });
    updatePolyline();
    focusToTrack(points.value);
  }
}

onMounted(() => {
  updateViewportHeight();
  window.addEventListener('resize', updateViewportHeight);
  window.addEventListener('orientationchange', updateViewportHeight);
  window.addEventListener('pageshow', updateViewportHeight);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateViewportHeight);
  }
  initMap();
});

onUnmounted(() => {
  unbindTouchEvents();
  window.removeEventListener('resize', updateViewportHeight);
  window.removeEventListener('orientationchange', updateViewportHeight);
  window.removeEventListener('pageshow', updateViewportHeight);
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', updateViewportHeight);
  }
  if (map) {
    map.remove();
    map = null;
  }
  userLocationMarker = null;
  if (searchTimer.value) {
    clearTimeout(searchTimer.value);
  }
});
</script>

<style scoped>
.map-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0f172a;
  color: #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .map-drawer {
    height: calc(var(--drawer-vh, 1vh) * 100);
    min-height: -webkit-fill-available;
  }
}

@supports (height: 100dvh) {
  @media (max-width: 768px) {
    .map-drawer {
      height: 100dvh;
    }
  }
}

.search-box {
  padding: 12px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  position: relative;
  z-index: 1200;
  overflow: visible;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  overflow: visible;
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 36px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f1f5f9;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3b82f6;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #64748b;
  pointer-events: none;
}

.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 12px;
  right: 12px;
  max-height: 420px;
  overflow-y: auto;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  z-index: 1300;
  margin-top: 4px;
}

.search-result-item {
  padding: 10px 12px;
  border-bottom: 1px solid #334155;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: #334155;
}

.result-name {
  font-size: 14px;
  color: #f1f5f9;
  font-weight: 500;
}

.result-detail {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 8px 12px;
  flex-wrap: wrap;
  position: relative;
  z-index: 10;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #334155;
  color: #cbd5e1;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tool-btn:hover:not(:disabled) {
  background: #475569;
  color: #f1f5f9;
}

.tool-btn.active {
  background: #f59e0b;
  color: #000;
}

.tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tool-btn i {
  font-size: 16px;
}

.spin {
  animation: spin 1s linear infinite;
}

.tool-divider {
  width: 1px;
  height: 20px;
  background: #334155;
  margin: 0 4px;
}

.map-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.map-wrapper.drawing-mode {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.map-container {
  width: 100%;
  height: 100%;
}

:deep(.leaflet-container) {
  background: #020617;
  font-family: inherit;
}

:deep(.leaflet-control-attribution) {
  background: transparent !important;
  color: #64748b;
  font-size: 11px;
}

.map-stats {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(30, 41, 59, 0.9);
  border-radius: 10px;
  backdrop-filter: blur(8px);
  border: 1px solid #334155;
  z-index: 400;
}

.stat-item {
  text-align: center;
  min-width: 46px;
}

.stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #38bdf8;
  line-height: 1.2;
}

.stat-label {
  font-size: 10px;
  color: #64748b;
  margin-top: 1px;
}

.map-hint {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 14px;
  background: rgba(30, 41, 59, 0.9);
  border-radius: 16px;
  font-size: 12px;
  color: #cbd5e1;
  backdrop-filter: blur(8px);
  z-index: 400;
  border: 1px solid #334155;
  max-width: calc(100% - 20px);
  text-align: center;
}

.import-form {
  padding: 16px 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-file,
.form-input {
  width: 100%;
  padding: 10px 12px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f1f5f9;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}

.form-file:focus,
.form-input:focus {
  border-color: #3b82f6;
}

.form-tip {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 8px;
}

.form-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f1f5f9;
  font-size: 13px;
  font-family: 'Monaco', 'Menlo', monospace;
  outline: none;
  resize: vertical;
}

.form-textarea:focus {
  border-color: #3b82f6;
}

.form-error {
  color: #ef4444;
  font-size: 12px;
  margin-top: 8px;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
