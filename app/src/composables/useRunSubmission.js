import { api } from '@/composables/useApi';
import { computeDurationFromDistance } from '@/utils/distance';
import { genTrackPoints } from '@/utils/track';
import { useDataStore } from '@/composables/useDataStore';

/**
 * 提交跑步记录：传入 { distance }
 * 返回：{ ok: true, data } | { ok: false, data } | { ok: false, error }
 */
export async function submitRun({ distance }) {
  const dist = Number(distance);
  if (!Number.isInteger(dist) || dist < 1000) {
    return { ok: false, msg: 'distance_invalid' };
  }

  // 登录检查
  const { userId, studentId, schoolId, submitRunRoute } = useDataStore();
  if (!userId.value || !studentId.value || !schoolId.value) {
    return { ok: false, msg: 'not_login' };
  }

  const duration = computeDurationFromDistance(dist);

  // 尝试从本地已保存的路线选择生成轨迹（否则用默认地图）
  const route = submitRunRoute.value || 'default';
  const trackPoints = genTrackPoints(dist, route, duration);

  const date = new Date().toISOString().split('T')[0];
  const now = new Date();
  const year = now.getFullYear();
  const semester = now.getMonth() + 1 < 8 ? '1' : '2';
  const yearSemester = `${year}${semester}`;

  try {
    const { data } = await api.saveNewRecord(
      trackPoints,
      dist,
      duration,
      userId.value,
      date,
      yearSemester
    );
    if (data && data.code === 10000) {
      return { ok: true, data };
    }
    return { ok: false, data };
  } catch (error) {
    console.error('submitRun api error:', error);
    return { ok: false, error };
  }
}
