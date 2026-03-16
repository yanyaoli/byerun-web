import { api } from '@/composables/useApi';
import { useDataStore } from '@/composables/useDataStore';
import { genTrackPoints } from '@/utils/track';
import {
  computeDurationFromDistance,
  normalizeRandomRunPayload,
  normalizeRoundedRunTime,
  resolveRunBoundsFromStandard,
} from '@/utils/run';

const buildYearSemester = (date) => {
  const year = date.getFullYear();
  const semester = date.getMonth() + 1 < 8 ? '1' : '2';
  return `${year}${semester}`;
};

const resolveSubmissionRoute = (route, fallbackRoute) => {
  const picked = String(route || fallbackRoute || 'default').trim();
  return picked || 'default';
};

const pickPresetRun = (presetRun, dist, route, bounds) => {
  const normalized = normalizeRandomRunPayload(presetRun, {
    minDistance: bounds.distanceMin,
    maxDistance: bounds.distanceMax,
    requireTrack: true,
  });
  if (!normalized) return null;
  if (normalized.run_distance !== dist) return null;

  const presetMapId = String(normalized.map_id || '').trim();
  if (presetMapId && presetMapId !== route) return null;

  return {
    runTime: normalized.run_time,
    trackPoints: normalized.track_points,
  };
};

/**
 * 提交跑步记录
 * @param {{ distance: number, route?: string, presetRun?: { map_id?: string, run_distance?: number, run_time?: number, track_points?: string } }} payload
 * @returns {Promise<{ok:true,data:any}|{ok:false,msg?:string,data?:any,error?:any,bounds?:{min:number,max:number}}>} 
 */
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

  const route = resolveSubmissionRoute(payload?.route, submitRunRoute.value);

  const presetRun = pickPresetRun(payload?.presetRun, dist, route, bounds);

  let runTime = presetRun?.runTime || 0;
  let trackPoints = presetRun?.trackPoints || '';

  if (!runTime || !trackPoints) {
    const duration = computeDurationFromDistance(dist, {
      minMinutes: bounds.timeMin,
      maxMinutes: bounds.timeMax,
    });

    runTime = normalizeRoundedRunTime(duration, dist, {
      minMinutes: bounds.timeMin,
      maxMinutes: bounds.timeMax,
    });

    trackPoints = genTrackPoints(dist, route, runTime);
  }

  if (!trackPoints || trackPoints === '[]') {
    return { ok: false, msg: 'track_invalid' };
  }

  const now = new Date();
  const recordDate = now.toISOString().split('T')[0];
  const yearSemester = buildYearSemester(now);

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
