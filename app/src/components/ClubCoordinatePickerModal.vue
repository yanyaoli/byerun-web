<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <div
          class="theme-card w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-[var(--card-border)]"
          style="background: var(--card-bg-strong, var(--card-bg));"
        >
          <!-- 弹窗头部 -->
          <div class="px-5 py-4 flex items-center justify-between border-b border-[var(--card-border)]">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <i class="ri-map-pin-user-line text-lg"></i>
              </div>
              <div class="min-w-0">
                <h3 class="text-base font-bold theme-text-primary leading-tight">选择活动签到坐标</h3>
                <p class="text-xs theme-text-tertiary truncate mt-0.5">{{ activityTitle }}</p>
              </div>
            </div>
            <button
              type="button"
              class="w-7 h-7 rounded-lg flex items-center justify-center theme-text-tertiary hover:theme-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              @click="handleClose"
              title="关闭"
            >
              <i class="ri-close-line text-lg"></i>
            </button>
          </div>

          <!-- 内容主体 -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
            <!-- 提示信息 -->
            <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2">
              <i class="ri-information-line text-sm mt-0.5 shrink-0"></i>
              <div>
                <p class="font-medium">该俱乐部活动上游未配置签到坐标</p>
                <p class="mt-0.5 opacity-90 leading-relaxed">
                  俱乐部自动与手动签到均依赖经纬度坐标。请在地图上点击选点，或使用当前定位/手动输入坐标后提交。
                </p>
              </div>
            </div>

            <!-- 地图上方快捷栏：搜索与当前定位 -->
            <div class="flex items-center gap-2">
              <div class="relative flex-1">
                <input
                  v-model="searchKeyword"
                  type="text"
                  placeholder="搜索地点/学校/体育馆..."
                  class="w-full px-3 py-1.5 pl-8 text-xs rounded-lg border border-[var(--card-border)] bg-[var(--input-bg,transparent)] theme-text-primary focus:outline-none focus:border-blue-500"
                  @keydown.enter.prevent="handleSearch"
                />
                <i class="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-xs theme-text-tertiary"></i>
              </div>
              <button
                type="button"
                class="px-2.5 py-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--action-hover-bg)] hover:bg-blue-500/10 hover:text-blue-500 text-xs theme-text-secondary flex items-center gap-1 shrink-0 transition-colors"
                :disabled="searching"
                @click="handleSearch"
              >
                <i class="ri-search-2-line text-xs" :class="{ 'animate-spin': searching }"></i>
                <span>搜索</span>
              </button>
              <button
                type="button"
                class="px-2.5 py-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--action-hover-bg)] hover:bg-blue-500/10 hover:text-blue-500 text-xs theme-text-secondary flex items-center gap-1 shrink-0 transition-colors"
                :disabled="locating"
                @click="handleLocateMe"
                title="定位到我的当前位置"
              >
                <i class="ri-crosshair-2-line text-xs" :class="{ 'animate-spin': locating }"></i>
                <span>当前定位</span>
              </button>
            </div>

            <!-- 搜索结果下拉 -->
            <div
              v-if="searchResults.length > 0"
              class="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] max-h-36 overflow-y-auto divide-y divide-[var(--card-border)] text-xs shadow-lg"
            >
              <div
                v-for="(item, idx) in searchResults"
                :key="idx"
                class="p-2 cursor-pointer hover:bg-blue-500/10 flex items-start justify-between gap-2 transition-colors"
                @click="selectSearchResult(item)"
              >
                <div class="min-w-0">
                  <div class="font-medium theme-text-primary truncate">{{ item.name }}</div>
                  <div class="text-[11px] theme-text-tertiary truncate">{{ item.detail }}</div>
                </div>
                <span class="text-[10px] text-blue-500 shrink-0 font-medium">选定</span>
              </div>
            </div>

            <!-- Leaflet 地图容器 -->
            <div class="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-[var(--card-border)] bg-slate-100 dark:bg-slate-900">
              <div ref="mapContainer" class="w-full h-full z-0"></div>
              <div class="absolute bottom-2 left-2 z-[400] bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white/90 pointer-events-none">
                点击地图选点或拖动图钉
              </div>
            </div>

            <!-- 坐标输入区域 -->
            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="block text-[11px] theme-text-tertiary mb-1">纬度 (Latitude)</label>
                <input
                  v-model="inputLatitude"
                  type="number"
                  step="0.000001"
                  placeholder="例如 30.572269"
                  class="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--card-border)] bg-[var(--input-bg,transparent)] theme-text-primary focus:outline-none focus:border-blue-500 font-mono"
                  @input="onCoordinateInputChange"
                />
              </div>
              <div>
                <label class="block text-[11px] theme-text-tertiary mb-1">经度 (Longitude)</label>
                <input
                  v-model="inputLongitude"
                  type="number"
                  step="0.000001"
                  placeholder="例如 104.066541"
                  class="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--card-border)] bg-[var(--input-bg,transparent)] theme-text-primary focus:outline-none focus:border-blue-500 font-mono"
                  @input="onCoordinateInputChange"
                />
              </div>
            </div>
          </div>

          <!-- 底部操作按钮 -->
          <div class="px-5 py-3.5 border-t border-[var(--card-border)] bg-[var(--bg-soft,rgba(0,0,0,0.02))] flex items-center justify-end gap-2.5">
            <button
              type="button"
              class="px-4 py-2 text-xs font-medium rounded-lg border border-[var(--card-border)] theme-text-secondary hover:theme-text-primary transition-colors"
              :disabled="submitting"
              @click="handleClose"
            >
              取消
            </button>
            <button
              type="button"
              class="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5"
              :disabled="!isCoordinatesValid || submitting"
              @click="handleConfirm"
            >
              <i v-if="submitting" class="ri-loader-4-line animate-spin"></i>
              <span>{{ submitButtonText }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import L from 'leaflet';
import { showMessage } from '@/composables/useMessage';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  activity: {
    type: Object,
    default: () => ({}),
  },
  initialCoordinates: {
    type: Object,
    default: null,
  },
  submitting: {
    type: Boolean,
    default: false,
  },
  actionText: {
    type: String,
    default: '报名',
  },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const GAODE_TILE_URL =
  'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}';
const DEFAULT_CENTER = [30.572269, 104.066541];

const mapContainer = ref(null);
let map = null;
let marker = null;

const inputLatitude = ref('');
const inputLongitude = ref('');
const searchKeyword = ref('');
const searchResults = ref([]);
const searching = ref(false);
const locating = ref(false);

const activityTitle = computed(() => {
  const item = props.activity || {};
  const name = item.activityName || item.itemName || '俱乐部活动';
  const time = item.startTime && item.endTime ? ` (${item.startTime} - ${item.endTime})` : '';
  return name + time;
});

const submitButtonText = computed(() => {
  if (props.submitting) return '提交中...';
  if (!props.actionText || props.actionText === '提交' || props.actionText === '提交坐标') {
    return '提交坐标';
  }
  return `确认坐标并${props.actionText}`;
});

const isCoordinatesValid = computed(() => {
  const lat = Number(inputLatitude.value);
  const lng = Number(inputLongitude.value);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  if (Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001) return false;
  return true;
});

function createPinIcon() {
  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -100%);">
        <div style="width: 30px; height: 30px; background: #2563eb; color: #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.35); border: 2.5px solid #ffffff;">
          <div style="transform: rotate(45deg); font-size: 15px; display: flex; align-items: center; justify-content: center;">
            <i class="ri-map-pin-2-fill"></i>
          </div>
        </div>
        <div style="position: absolute; bottom: -3px; left: 50%; transform: translateX(-50%); width: 8px; height: 3px; background: rgba(0,0,0,0.35); border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function setCoordinates(lat, lng, moveMarker = true) {
  const nLat = Number(Number(lat).toFixed(6));
  const nLng = Number(Number(lng).toFixed(6));
  inputLatitude.value = String(nLat);
  inputLongitude.value = String(nLng);

  if (marker && moveMarker) {
    marker.setLatLng([nLat, nLng]);
  } else if (!marker && map) {
    createOrUpdateMarker([nLat, nLng]);
  }
}

function createOrUpdateMarker(latlng) {
  if (!map) return;
  if (marker) {
    marker.setLatLng(latlng);
  } else {
    marker = L.marker(latlng, {
      icon: createPinIcon(),
      draggable: true,
    }).addTo(map);

    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      setCoordinates(pos.lat, pos.lng, false);
    });
  }
}

function onCoordinateInputChange() {
  const lat = Number(inputLatitude.value);
  const lng = Number(inputLongitude.value);
  if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else if (map) {
      createOrUpdateMarker([lat, lng]);
    }
    if (map) {
      map.panTo([lat, lng]);
    }
  }
}

function handleLocateMe() {
  if (!navigator?.geolocation) {
    showMessage('当前浏览器不支持定位功能', 'warning');
    return;
  }
  locating.value = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      locating.value = false;
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setCoordinates(lat, lng, true);
      if (map) {
        map.setView([lat, lng], 16);
      }
      showMessage('已定位到当前位置', 'success');
    },
    (err) => {
      locating.value = false;
      console.warn('geolocation failed:', err);
      showMessage('获取当前定位失败，请在地图上手动点击选点', 'warning');
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
  );
}

async function handleSearch() {
  const query = searchKeyword.value.trim();
  if (!query) return;
  searching.value = true;
  searchResults.value = [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'ByerunMapDrawer/1.0',
        },
      },
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      searchResults.value = data.map((item) => ({
        name: item.display_name?.split(',')[0] || item.name || query,
        detail: item.display_name || '',
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }));
    } else {
      showMessage('未找到匹配地点，请直接在地图上选点', 'info');
    }
  } catch (e) {
    console.warn('location search failed:', e);
    showMessage('搜索地点失败，请直接在地图上选点', 'warning');
  } finally {
    searching.value = false;
  }
}

function selectSearchResult(item) {
  searchResults.value = [];
  searchKeyword.value = item.name;
  setCoordinates(item.lat, item.lng, true);
  if (map) {
    map.setView([item.lat, item.lng], 16);
  }
}

async function initOrUpdateMap() {
  await nextTick();
  if (!mapContainer.value) return;

  let center = DEFAULT_CENTER;
  let zoom = 13;

  // 1. 若有初始坐标
  const initLat = Number(props.initialCoordinates?.latitude || props.activity?.latitude);
  const initLng = Number(props.initialCoordinates?.longitude || props.activity?.longitude);
  const hasValidInit =
    Number.isFinite(initLat) &&
    Number.isFinite(initLng) &&
    initLat >= -90 &&
    initLat <= 90 &&
    initLng >= -180 &&
    initLng <= 180 &&
    (Math.abs(initLat) > 0.0001 || Math.abs(initLng) > 0.0001);

  if (hasValidInit) {
    center = [initLat, initLng];
    zoom = 16;
    inputLatitude.value = String(Number(initLat.toFixed(6)));
    inputLongitude.value = String(Number(initLng.toFixed(6)));
  } else {
    // 默认空，等待用户点选
    inputLatitude.value = '';
    inputLongitude.value = '';
  }

  if (!map) {
    map = L.map(mapContainer.value, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
    });

    L.tileLayer(GAODE_TILE_URL, {
      subdomains: '1234',
      maxZoom: 19,
      minZoom: 3,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    map.on('click', (e) => {
      setCoordinates(e.latlng.lat, e.latlng.lng, true);
    });
  }

  map.setView(center, zoom);

  if (hasValidInit) {
    createOrUpdateMarker(center);
  } else if (marker) {
    marker.remove();
    marker = null;
  }

  // 确保尺寸刷新
  scheduleInvalidate();
}

function scheduleInvalidate() {
  if (!map) return;
  map.invalidateSize();
  setTimeout(() => map?.invalidateSize(), 80);
  setTimeout(() => map?.invalidateSize(), 250);
}

function cleanupMap() {
  if (marker) {
    marker.remove();
    marker = null;
  }
  if (map) {
    map.remove();
    map = null;
  }
  searchResults.value = [];
  searchKeyword.value = '';
  inputLatitude.value = '';
  inputLongitude.value = '';
}

function handleClose() {
  if (props.submitting) return;
  emit('cancel');
  emit('update:modelValue', false);
}

function handleConfirm() {
  if (!isCoordinatesValid.value || props.submitting) return;
  emit('confirm', {
    latitude: String(Number(inputLatitude.value).toFixed(6)),
    longitude: String(Number(inputLongitude.value).toFixed(6)),
  });
}

watch(
  () => props.modelValue,
  async (visible) => {
    if (visible) {
      await initOrUpdateMap();
    } else {
      cleanupMap();
    }
  },
);

onBeforeUnmount(() => {
  cleanupMap();
});
</script>

<style scoped>
:deep(.custom-pin-marker) {
  background: transparent !important;
  border: none !important;
}
</style>
