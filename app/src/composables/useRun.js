import { ref, reactive, watch } from 'vue';
import { api } from '@/sdk/app';
import { useDataStore } from '@/composables/useDataStore';
import {
  genTrackPoints,
  getMapNames,
  getAllMapIds,
  loadMapFiles,
  loadCustomMaps,
  isCustomMap,
  getCustomMapData,
} from '@/utils/map';
import {
  computeDurationFromDistance,
  normalizeRandomRunPayload,
  normalizeRoundedRunTime,
  resolveRunBoundsFromStandard,
  calculatePaceMinutesPerKm,
} from '@/utils/run';

export function useRunRecords({ pageSize = 15, onMessage } = {}) {
  const records = ref([]);
  const loading = ref(false);
  const pagination = reactive({ current: 1, pageSize, total: 0 });
  const isLoading = ref(false);

  function formatCreateTime(createTime) {
    if (!createTime) return '';
    return createTime.slice(0, 16);
  }

  function formatPaceDetail(time, distance) {
    const d = Number(distance);
    const t = Number(time);
    if (!d || !t || d <= 0 || t <= 0 || !Number.isFinite(d) || !Number.isFinite(t)) return "0'00''";
    const pace = calculatePaceMinutesPerKm(d, t);
    if (pace <= 0) return "0'00''";
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    const normalizedMinutes = minutes + Math.floor(seconds / 60);
    const normalizedSeconds = seconds % 60;
    return `${normalizedMinutes}'${String(normalizedSeconds).padStart(2, '0')}''`;
  }

  const fetchRecords = async () => {
    loading.value = true;
    pagination.current = 1;

    try {
      const { data } = await api.getRunRecords(pagination.current, pagination.pageSize);

      if (Number(data?.code) !== 10000) {
        records.value = [];
        pagination.total = 0;
        if (typeof onMessage === 'function') {
          onMessage(data?.msg || '获取跑步记录失败', 'error');
        }
        return;
      }

      const recordsList = Array.isArray(data.response)
        ? data.response
        : data.response?.records || [];

      records.value = recordsList.map((record) => ({
        ...record,
        key: record.recordId,
        runDistance: Number(record.runDistance),
        runTime: Number(record.runTime),
        runSpeed: record.runStatus === '1' ? Number(record.runSpeed) : 0,
      }));

      pagination.total = data.response?.total || records.value.length || 0;
    } catch (error) {
      console.error('获取跑步记录失败:', error);
      records.value = [];
      pagination.total = 0;
      if (typeof onMessage === 'function') onMessage('获取跑步记录失败', 'error');
    } finally {
      loading.value = false;
    }
  };

  const loadMoreRecords = async () => {
    if (isLoading.value) return;
    isLoading.value = true;

    try {
      const nextPage = pagination.current + 1;
      const { data } = await api.getRunRecords(nextPage, pagination.pageSize);

      if (Number(data?.code) !== 10000) {
        if (typeof onMessage === 'function') {
          onMessage(data?.msg || '加载更多记录失败', 'error');
        }
        return;
      }

      const recordsList = Array.isArray(data.response)
        ? data.response
        : data.response?.records || [];

      if (recordsList.length > 0) {
        records.value = [
          ...records.value,
          ...recordsList.map((record) => ({
            ...record,
            key: record.recordId,
            runDistance: Number(record.runDistance),
            runTime: Number(record.runTime),
            runSpeed: record.runStatus === '1' ? Number(record.runSpeed) : 0,
          })),
        ];
        pagination.current = nextPage;
      } else if (typeof onMessage === 'function') {
        onMessage('没有更多数据了', 'info');
      }
    } catch (error) {
      if (typeof onMessage === 'function') onMessage('加载更多记录失败', 'error');
    } finally {
      isLoading.value = false;
    }
  };

  return {
    records,
    loading,
    pagination,
    isLoading,
    fetchRecords,
    loadMoreRecords,
    formatCreateTime,
    formatPaceDetail,
  };
}

export async function submitRun(payload = {}) {
  const dist = Number(payload?.distance);
  const { userId, studentId, schoolId, submitRunRoute, runStandard, userInfo } = useDataStore();
  const bounds = resolveRunBoundsFromStandard(userInfo.value || {}, runStandard.value || {});

  if (!Number.isInteger(dist) || dist <= 0) {
    return {
      ok: false,
      msg: 'distance_invalid',
      bounds: { min: 1, max: 0 },
    };
  }

  if (!userId.value || !studentId.value || !schoolId.value) {
    return { ok: false, msg: 'not_login' };
  }

  const route = String(payload?.route || submitRunRoute.value || 'default').trim() || 'default';
  const normalizedPresetRun = normalizeRandomRunPayload(payload?.presetRun, {
    minDistance: bounds.distanceMin,
    maxDistance: bounds.distanceMax,
    requireTrack: true,
  });

  const presetRun =
    normalizedPresetRun &&
    normalizedPresetRun.run_distance === dist &&
    (!String(normalizedPresetRun.map_id || '').trim() ||
      String(normalizedPresetRun.map_id || '').trim() === route)
      ? {
          runTime: normalizedPresetRun.run_time,
          trackPoints: normalizedPresetRun.track_points,
        }
      : null;

  const resolveRunTime = () => {
    const payloadRunTime = Number(payload?.runTime);
    if (payloadRunTime > 0) return payloadRunTime;
    if (Number(presetRun?.runTime) > 0) return Number(presetRun.runTime);

    const duration = computeDurationFromDistance(dist, {
      minMinutes: bounds.timeMin,
      maxMinutes: bounds.timeMax,
    });

    return normalizeRoundedRunTime(duration, dist, {
      minMinutes: bounds.timeMin,
      maxMinutes: bounds.timeMax,
    });
  };

  let runTime = resolveRunTime();
  let trackPoints = presetRun?.trackPoints || '';
  if (!trackPoints) {
    trackPoints = genTrackPoints(dist, route, runTime);
  }

  if (!trackPoints || trackPoints === '[]') {
    return { ok: false, msg: 'track_invalid' };
  }

  const now = new Date();
  const recordDate = now.toISOString().split('T')[0];
  const yearSemester = `${now.getFullYear()}${now.getMonth() + 1 < 8 ? '1' : '2'}`;

  try {
    const { data } = await api.saveNewRecord(
      trackPoints,
      dist,
      runTime,
      userId.value,
      recordDate,
      yearSemester,
    );

    if (data?.code === 10000) {
      return { ok: true, data };
    }

    return { ok: false, data };
  } catch (error) {
    console.error('submitRun api error:', error);
    return { ok: false, error };
  }
}

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
      await loadMapFiles();
      loadCustomMaps(true);
      const allMapIds = getAllMapIds();
      mapDisplayNames.value = getMapNames();

      const options = {};
      allMapIds.forEach((id) => {
        options[id] = mapDisplayNames.value[id];
      });
      routeOptions.value = options;

      if (routeRef?.value && options[routeRef.value]) {
        selectedRoute.value = routeRef.value;
      } else if (Object.keys(options).length > 0) {
        selectedRoute.value = Object.keys(options)[0];
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

  function getRouteName(value) {
    return routeOptions.value[value] || '选择路线';
  }

  function regenerate() {
    if (!mapsLoaded.value) return;

    if (regenTimer) clearTimeout(regenTimer);
    regenTimer = setTimeout(() => {
      try {
        const distance = Number(distanceRef?.value);
        const route = routeRef?.value ?? selectedRoute.value;

        if (Number.isFinite(distance) && distance > 100 && route) {
          const track = genTrackPoints(distance, route);
          if (track && track !== '[]') {
            generatedTrack.value = track;
            mapReady.value = true;
            return;
          }
        }

        generatedTrack.value = null;
        mapReady.value = false;
      } catch {
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
