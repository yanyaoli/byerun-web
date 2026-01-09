import { reactive, toRefs, watch, computed } from 'vue';
import { api } from '@/composables/useApi';
import { encrypt, decrypt } from '@/utils/crypto';
import { getDeviceInfo } from '@/utils/device';

// 统一数据存储结构
const STORAGE_KEY = 'unirun_data';

// 解析 JSON
const tryParse = (key) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    return null;
  }
};

// 从聚合存储中加载原生数据
const getStoredNativeData = () => {
  const encrypted = localStorage.getItem(STORAGE_KEY);
  if (encrypted) {
    const data = decrypt(encrypted);
    if (data) return data;
    // 如果解密失败（可能是密钥更换或数据损坏），清理损坏的数据
    localStorage.removeItem(STORAGE_KEY);
  }

  // 迁移逻辑：如果还没聚合，尝试从旧的加密存储或遗留字段恢复
  const legacyData = {
    userInfo: tryParse('unirun_userInfo'),
    runInfo: tryParse('unirun_runInfo'),
    runStandard: tryParse('unirun_runStandard'),
    activityInfo: tryParse('unirun_activityInfo'),
  };
  return legacyData;
};

const state = reactive({
  userInfo: getStoredNativeData().userInfo || null,
  runInfo: getStoredNativeData().runInfo || null,
  runStandard: getStoredNativeData().runStandard || null,
  activityInfo: getStoredNativeData().activityInfo || null,
  loading: false,

  // 非原生数据
  submitRunDistance: localStorage.getItem('unirun_submitRunDistance') || null,
  submitRunRoute: localStorage.getItem('unirun_submitRunRoute') || null,
  deviceInfo: tryParse('unirun_device_info') || getDeviceInfo(),
  activeTab: localStorage.getItem('activeTab') || 'submit',
});

// 持久化敏感数据 (加密打包)
const syncNativeToStorage = () => {
  const nativeData = {
    userInfo: state.userInfo,
    runInfo: state.runInfo,
    runStandard: state.runStandard,
    activityInfo: state.activityInfo,
  };
  localStorage.setItem(STORAGE_KEY, encrypt(nativeData));
};

// 监听原生数据的变化
watch(
  () => [state.userInfo, state.runInfo, state.runStandard, state.activityInfo],
  syncNativeToStorage,
  { deep: true }
);

// 监听非原生核心状态的变化（独立存储）
watch(
  () => state.submitRunDistance,
  (v) => {
    if (v !== null && v !== undefined)
      localStorage.setItem('unirun_submitRunDistance', v);
  }
);
watch(
  () => state.submitRunRoute,
  (v) => {
    if (v) localStorage.setItem('unirun_submitRunRoute', v);
  }
);
watch(
  () => state.deviceInfo,
  (v) => {
    if (v) localStorage.setItem('unirun_device_info', JSON.stringify(v));
  },
  { deep: true }
);
watch(
  () => state.activeTab,
  (v) => {
    if (v) localStorage.setItem('activeTab', v);
  }
);

export const useDataStore = () => {
  // 派生字段：从 userInfo 获取，避免数据冗余
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

        // 并行获取跑步标准和活动信息
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

          // 获取跑步详情信息
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

    localStorage.removeItem(STORAGE_KEY);
    // 清理所有相关字段
    const keysToRemove = [
      'unirun_token',
      'unirun_userId',
      'unirun_studentId',
      'unirun_schoolId',
      'unirun_userInfo',
      'unirun_runInfo',
      'unirun_runStandard',
      'unirun_activityInfo',
      'unirun_submitRunDistance',
      'unirun_submitRunRoute',
      'unirun_device_info',
      'activeTab',
      'unorun_chat_userData',
      'unorun_chat_userId',
      'unorun_chat_token',
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
