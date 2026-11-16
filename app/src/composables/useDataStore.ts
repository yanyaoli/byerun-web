import { computed, ref, watch, type Ref, type ComputedRef } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { api } from '@/sdk/app';
import { setRuntimeToken } from '@/sdk/app/session';
import type { UserInfo } from '@/types/auth';
import type { RunInfo, RunStandard } from '@/types/domain';

const APP_STATE_STORAGE_KEY = 'byerun.app_state';

export interface FetchUserDataResult {
  ok: boolean;
  reason: string;
  message: string;
}

export const useAppStateStore = defineStore(
  'appState',
  () => {
    const userInfo: Ref<UserInfo | null> = ref(null);
    const runInfo: Ref<RunInfo | null> = ref(null);
    const runStandard: Ref<RunStandard | null> = ref(null);
    const activityInfo: Ref<any> = ref(null);
    const loading: Ref<boolean> = ref(false);

    const submitRunDistance: Ref<number | null> = ref(null);
    const submitRunRoute: Ref<string | null> = ref(null);
    const activeTab: Ref<string> = ref('submit');

    const rememberLogin: Ref<boolean> = ref(false);
    const savedPhone: Ref<string> = ref('');

    const token: ComputedRef<string | null> = computed(() => userInfo.value?.oauthToken?.token || null);
    const userId: ComputedRef<string | number | null> = computed(() => userInfo.value?.userId || null);
    const studentId: ComputedRef<string | number | null> = computed(() => userInfo.value?.studentId || null);
    const schoolId: ComputedRef<string | number | null> = computed(() => userInfo.value?.schoolId || null);

    const resolveFailureReason = (code: any, status: any): string => {
      if (code === 10001 || code === 30005 || status === 401 || status === 403) return 'auth_invalid';
      return 'request_failed';
    };

    const resolveErrorMessage = (error: any, fallback: string): string => {
      const responseData = error?.response?.data;
      if (responseData?.msg) return String(responseData.msg);
      if (responseData?.message) return String(responseData.message);
      if (error?.message) return String(error.message);
      return fallback;
    };

    const doFetchUserData = async (options: { background?: boolean } = {}): Promise<FetchUserDataResult> => {
      const { background = false } = options;
      const useLoadingState = !(background && !!userInfo.value);
      if (useLoadingState) {
        loading.value = true;
      }
      try {
        const userRes = await api.getToken();
        if (userRes.data.code === 10000) {
          userInfo.value = userRes.data.response;

          const { schoolId: sId, userId: uId, studentId: stId } = (userInfo.value as UserInfo);

          const [standardRes, activityRes] = await Promise.all([
            api.getRunStandard(sId).catch(() => null),
            api.getJoinNum(sId, stId).catch(() => null),
          ]);

          let runInfoRes: any = null;

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
      } catch (error: any) {
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

    let fetchUserDataPromise: Promise<FetchUserDataResult> | null = null;
    const fetchUserData = (options: { background?: boolean } = {}): Promise<FetchUserDataResult> => {
      if (fetchUserDataPromise) return fetchUserDataPromise;
      fetchUserDataPromise = doFetchUserData(options).finally(() => {
        fetchUserDataPromise = null;
      });
      return fetchUserDataPromise;
    };

    const clearAllData = (): void => {
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
