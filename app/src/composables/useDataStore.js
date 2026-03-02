import { reactive, toRefs, watch, computed } from 'vue';
import { api } from '@/composables/useApi';
import { getDeviceInfo } from '@/utils/device';
import {
  readSessionAuthData,
  writeSessionAuthData,
  clearAuthSessionStorage,
} from '@/utils/authStorage';

const tryParse = (key) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    return null;
  }
};

const initialAuthData = readSessionAuthData();

const state = reactive({
  userInfo: initialAuthData.userInfo || null,
  runInfo: initialAuthData.runInfo || null,
  runStandard: initialAuthData.runStandard || null,
  activityInfo: initialAuthData.activityInfo || null,
  loading: false,

  submitRunDistance: localStorage.getItem('unirun_submitRunDistance') || null,
  submitRunRoute: localStorage.getItem('unirun_submitRunRoute') || null,
  deviceInfo: tryParse('unirun_device_info') || getDeviceInfo(),
  activeTab: localStorage.getItem('activeTab') || 'submit',
});

const syncNativeToStorage = () => {
  writeSessionAuthData({
    userInfo: state.userInfo,
    runInfo: state.runInfo,
    runStandard: state.runStandard,
    activityInfo: state.activityInfo,
  });
};

watch(
  () => [state.userInfo, state.runInfo, state.runStandard, state.activityInfo],
  syncNativeToStorage,
  { deep: true },
);

watch(
  () => state.submitRunDistance,
  (v) => {
    if (v !== null && v !== undefined) {
      localStorage.setItem('unirun_submitRunDistance', v);
    }
  },
);

watch(
  () => state.submitRunRoute,
  (v) => {
    if (v) localStorage.setItem('unirun_submitRunRoute', v);
  },
);

watch(
  () => state.deviceInfo,
  (v) => {
    if (v) localStorage.setItem('unirun_device_info', JSON.stringify(v));
  },
  { deep: true },
);

watch(
  () => state.activeTab,
  (v) => {
    if (v) localStorage.setItem('activeTab', v);
  },
);

export const useDataStore = () => {
  const token = computed(() => state.userInfo?.oauthToken?.token || null);
  const userId = computed(() => state.userInfo?.userId || null);
  const studentId = computed(() => state.userInfo?.studentId || null);
  const schoolId = computed(() => state.userInfo?.schoolId || null);

  const fetchUserData = async () => {
    state.loading = true;
    try {
      const userRes = await api.getToken();
      if (userRes.data.code === 10000) {
        state.userInfo = userRes.data.response;

        const { schoolId: sId, userId: uId, studentId: stId } = state.userInfo;

        const [standardRes, activityRes] = await Promise.all([
          api.getRunStandard(sId).catch(() => null),
          api.getJoinNum(sId, stId).catch(() => null),
        ]);

        if (standardRes?.data?.code === 10000) {
          state.runStandard = standardRes.data.response;
          const semesterFromStandard = state.runStandard?.semesterYear;
          const now = new Date();
          const finalSemester =
            semesterFromStandard ||
            `${now.getFullYear()}${now.getMonth() + 1 < 8 ? '1' : '2'}`;

          api
            .getRunInfo(Number(uId), finalSemester)
            .then((runRes) => {
              if (runRes.data.code === 10000) {
                state.runInfo = runRes.data.response;
              }
            })
            .catch(() => {});
        }

        if (activityRes?.data?.code === 10000) {
          state.activityInfo = activityRes.data.response;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Fetch data failed:', error);
      return false;
    } finally {
      state.loading = false;
    }
  };

  const clearAllData = () => {
    state.userInfo = null;
    state.runInfo = null;
    state.runStandard = null;
    state.activityInfo = null;
    state.submitRunDistance = null;
    state.submitRunRoute = null;

    clearAuthSessionStorage();

    const keysToRemove = [
      'unirun_submitRunDistance',
      'unirun_submitRunRoute',
      'unirun_device_info',
      'activeTab',
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  };

  return {
    ...toRefs(state),
    token,
    userId,
    studentId,
    schoolId,
    fetchUserData,
    clearAllData,
  };
};
