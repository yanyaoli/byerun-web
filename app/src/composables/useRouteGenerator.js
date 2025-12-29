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

  async function load() {
    try {
      const mapIds = await loadMapFiles();
      mapDisplayNames.value = getMapNames();
      const opts = {};
      for (const id of mapIds) opts[id] = mapDisplayNames.value[id];
      routeOptions.value = opts;
      mapsLoaded.value = true;

      try {
        const saved = localStorage.getItem('unirun_submitRunRoute');
        if (saved && opts[saved]) selectedRoute.value = saved;
        else if (Object.keys(opts).length) selectedRoute.value = Object.keys(opts)[0];
      } catch (e) {}
    } catch (error) {
      console.error('加载地图失败:', error);
      routeOptions.value = { cdutcm_wj: '成都中医药大学（温江校区）' };
      mapsLoaded.value = true;
    }
  }

  function selectRoute(route) {
    if (!routeOptions.value[route]) return;
    selectedRoute.value = route;
    try { localStorage.setItem(localKey, route); } catch (e) {}
  }

  function getRouteName(v) { return routeOptions.value[v] || '选择路线'; }

  function regenerate() {
    try {
      const d = Number(distanceRef?.value);
      const route = routeRef?.value ?? selectedRoute.value;
      if (Number.isFinite(d) && d > 0 && route) {
        generatedTrack.value = genTrackPoints(d, route);
        mapReady.value = true;
      } else {
        generatedTrack.value = null;
        mapReady.value = false;
      }
    } catch (e) {
      generatedTrack.value = null;
      mapReady.value = false;
    }
  }

  const watchTargets = [];
  if (distanceRef) watchTargets.push(distanceRef);
  if (routeRef) watchTargets.push(routeRef);
  else watchTargets.push(selectedRoute);

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
