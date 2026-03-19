import { computed, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { api } from '@/sdk/app';
import { setRuntimeToken } from '@/sdk/app/session';

const APP_STATE_STORAGE_KEY = 'unirun.app_state';

const useAppStateStore = defineStore(
  'appState',
  () => {
    const userInfo = ref(null);
    const runInfo = ref(null);
    const runStandard = ref(null);
    const activityInfo = ref(null);
    const loading = ref(false);

    const submitRunDistance = ref(null);
    const submitRunRoute = ref(null);
    const activeTab = ref('submit');

    const rememberLogin = ref(false);
    const savedPhone = ref('');

    const token = computed(() => userInfo.value?.oauthToken?.token || null);
    const userId = computed(() => userInfo.value?.userId || null);
    const studentId = computed(() => userInfo.value?.studentId || null);
    const schoolId = computed(() => userInfo.value?.schoolId || null);

    const resolveFailureReason = (code, status) => {
      if (code === 10001 || status === 401 || status === 403) return 'auth_invalid';
      return 'request_failed';
    };

    const resolveErrorMessage = (error, fallback) => {
      const responseData = error?.response?.data;
      if (responseData?.msg) return String(responseData.msg);
      if (responseData?.message) return String(responseData.message);
      if (error?.message) return String(error.message);
      return fallback;
    };

    const fetchUserData = async (options = {}) => {
      const { background = false } = options;
      const useLoadingState = !(background && !!userInfo.value);
      if (useLoadingState) {
        loading.value = true;
      }
      try {
        const userRes = await api.getToken();
        if (userRes.data.code === 10000) {
          userInfo.value = userRes.data.response;

          const { schoolId: sId, userId: uId, studentId: stId } = userInfo.value;

          const [standardRes, activityRes] = await Promise.all([
            api.getRunStandard(sId).catch(() => null),
            api.getJoinNum(sId, stId).catch(() => null),
          ]);

          let runInfoRes = null;

          if (standardRes?.data?.code === 10000) {
            runStandard.value = standardRes.data.response;
            const semesterFromStandard = runStandard.value?.semesterYear;
            const now = new Date();
            const finalSemester =
              semesterFromStandard || `${now.getFullYear()}${now.getMonth() + 1 < 8 ? '1' : '2'}`;
            runInfoRes = await api.getRunInfo(Number(uId), finalSemester).catch(() => null);
          }

          if (runInfoRes?.data?.code === 10000) {
            runInfo.value = runInfoRes.data.response;
          }

          if (activityRes?.data?.code === 10000) {
            activityInfo.value = activityRes.data.response;
          }
          return { ok: true, reason: 'ok', message: '' };
        }
        return {
          ok: false,
          reason: resolveFailureReason(userRes?.data?.code, null),
          message: userRes?.data?.msg || '登录状态校验失败',
        };
      } catch (error) {
        console.error('Fetch data failed:', error);
        const status = Number(error?.response?.status || 0);
        const reason = resolveFailureReason(null, status);
        const fallbackMessage =
          reason === 'auth_invalid' ? '登录状态已失效，请重新登录' : '用户数据加载失败';
        return {
          ok: false,
          reason: reason === 'auth_invalid' ? 'auth_invalid' : 'network_error',
          message: resolveErrorMessage(error, fallbackMessage),
        };
      } finally {
        if (useLoadingState) {
          loading.value = false;
        }
      }
    };

    const clearAllData = () => {
      userInfo.value = null;
      runInfo.value = null;
      runStandard.value = null;
      activityInfo.value = null;
    };

    watch(
      token,
      (nextToken) => {
        setRuntimeToken(nextToken || '');
      },
      { immediate: true },
    );

    return {
      userInfo,
      runInfo,
      runStandard,
      activityInfo,
      loading,
      submitRunDistance,
      submitRunRoute,
      activeTab,
      rememberLogin,
      savedPhone,
      token,
      userId,
      studentId,
      schoolId,
      fetchUserData,
      clearAllData,
    };
  },
  {
    persist: {
      key: APP_STATE_STORAGE_KEY,
      storage: localStorage,
      pick: [
        'userInfo',
        'runInfo',
        'runStandard',
        'activityInfo',
        'submitRunDistance',
        'submitRunRoute',
        'activeTab',
        'rememberLogin',
        'savedPhone',
      ],
    },
  },
);

export const useDataStore = () => {
  const store = useAppStateStore();
  return {
    ...storeToRefs(store),
    fetchUserData: store.fetchUserData,
    clearAllData: store.clearAllData,
  };
};
