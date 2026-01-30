import { ref, watch } from 'vue';
import { loadMapFiles, getMapNames } from '@/utils/map';
import { genTrackPoints } from '@/utils/track';

export function useRouteGenerator(distanceRef, routeRef) {
  const mapsLoaded = ref(false);
  const routeOptions = ref({});
  const mapDisplayNames = ref({});
  const selectedRoute = ref('');

  const generatedTrack = ref(null);
  const mapReady = ref(false);
  let regenTimer = null;

  async function load() {
    try {
      const mapIds = await loadMapFiles();
      mapDisplayNames.value = getMapNames();
      const opts = {};
      for (const id of mapIds) opts[id] = mapDisplayNames.value[id];
      routeOptions.value = opts;

      // 先设置好初始路线，再标记加载完成，减少触发次数
      if (routeRef && routeRef.value && opts[routeRef.value]) {
        selectedRoute.value = routeRef.value;
      } else if (Object.keys(opts).length) {
        selectedRoute.value = Object.keys(opts)[0];
      }

      mapsLoaded.value = true;
    } catch (error) {
      console.error('加载地图失败:', error);
      routeOptions.value = { cdutcm_wj: '成都中医药大学（温江校区）' };
      mapsLoaded.value = true;
    }
  }

  function selectRoute(route) {
    if (!routeOptions.value[route]) return;
    selectedRoute.value = route;
  }

  function getRouteName(v) {
    return routeOptions.value[v] || '选择路线';
  }

  function regenerate() {
    if (!mapsLoaded.value) return;
    
    // 使用 timer 防抖，避免初始化时多个响应式变量同时变化导致多次计算
    if (regenTimer) clearTimeout(regenTimer);
    regenTimer = setTimeout(() => {
      try {
        const d = Number(distanceRef?.value);
        const route = routeRef?.value ?? selectedRoute.value;
        if (Number.isFinite(d) && d > 100 && route) {
          const track = genTrackPoints(d, route);
          if (track && track !== '[]') {
            generatedTrack.value = track;
            mapReady.value = true;
            return;
          }
        }
        generatedTrack.value = null;
        mapReady.value = false;
      } catch (e) {
        generatedTrack.value = null;
        mapReady.value = false;
      } finally {
        regenTimer = null;
      }
    }, 50);
  }

  const watchTargets = [mapsLoaded, selectedRoute];
  if (distanceRef) watchTargets.push(distanceRef);
  if (routeRef) watchTargets.push(routeRef);

  watch(watchTargets, regenerate, { immediate: true });

  return {
    mapsLoaded,
    routeOptions,
    mapDisplayNames,
    selectedRoute,
    load,
    selectRoute,
    getRouteName,
    generatedTrack,
    mapReady,
    regenerate,
  };
}
