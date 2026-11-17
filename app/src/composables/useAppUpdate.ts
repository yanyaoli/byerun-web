import { ref } from 'vue';
import localVersionData from '@/version.json';
import {
  checkForUpdate,
  formatFileSize,
  openDownloadUrl,
  type UpdateCheckResult,
} from '@/services/updateService';

// 全局单例状态：保证 App.vue、AppHeader.vue 与 SettingsPage.vue 共享同一份状态
const hasUpdate = ref(false);
const checkingUpdate = ref(false);
const updateResult = ref<UpdateCheckResult | null>(null);
const currentVersion = ref(localVersionData.version || '1.0.0');
let checkPromise: Promise<UpdateCheckResult> | null = null;

export function useAppUpdate() {
  const checkUpdate = async (force = false): Promise<UpdateCheckResult> => {
    if (checkPromise && !force) return checkPromise;
    checkingUpdate.value = true;
    checkPromise = checkForUpdate()
      .then((res) => {
        updateResult.value = res;
        hasUpdate.value = Boolean(res.hasUpdate);
        return res;
      })
      .catch((err) => {
        console.error('自动检查更新失败:', err);
        const fallback: UpdateCheckResult = {
          hasUpdate: false,
          currentVersion: currentVersion.value,
          latestVersion: currentVersion.value,
        };
        updateResult.value = fallback;
        hasUpdate.value = false;
        return fallback;
      })
      .finally(() => {
        checkingUpdate.value = false;
      });

    return checkPromise;
  };

  return {
    hasUpdate,
    checkingUpdate,
    updateResult,
    currentVersion,
    checkUpdate,
    formatFileSize,
    openDownloadUrl,
  };
}
