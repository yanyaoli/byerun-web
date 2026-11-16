import { ref, type Ref } from 'vue';
import type { Router } from 'vue-router';
import { api, getDismissedAt, markNotificationDismissed } from '@/sdk/app';
import type { ServerNotification } from '@/types/domain';

let lastFetchTime = 0;
const NOTIFICATION_FETCH_COOLDOWN = 60000; // 60秒内不重复请求通知接口

export const currentNotice: Ref<ServerNotification | null> = ref(null);

export const dismissNotice = (): void => {
  if (currentNotice.value?.createdAt) {
    markNotificationDismissed(currentNotice.value.createdAt);
  }
  currentNotice.value = null;
};

export const fetchNotification = async (force = false): Promise<void> => {
  const now = Date.now();
  if (!force && now - lastFetchTime < NOTIFICATION_FETCH_COOLDOWN) {
    return;
  }
  lastFetchTime = now;

  try {
    const envelope = await api.getNotification();
    let list = envelope?.data?.notifications;
    if (!Array.isArray(list)) {
      const single = envelope?.data?.notification;
      list = single ? [single] : [];
    }
    if (list.length === 0) {
      currentNotice.value = null;
      return;
    }

    const dismissedAt = getDismissedAt();
    const latest = list.find((n: any) => {
      const ts = Date.parse(n?.createdAt);
      return Number.isFinite(ts) && ts > dismissedAt;
    });

    if (!latest) {
      currentNotice.value = null;
      return;
    }

    currentNotice.value = latest;
  } catch (error) {
    console.error('Failed to fetch notification:', error);
  }
};

/**
 * 启动服务端通知监听：立即拉取一次，并在每次路由切换后重新拉取
 */
export const startNotificationWatcher = (router: Router): (() => void) => {
  fetchNotification();
  const stopAfterEach = router.afterEach((to) => {
    if (to.name === 'map-drawer') return;
    fetchNotification();
  });
  return () => stopAfterEach();
};

export const useNotification = () => {
  return {
    currentNotice,
    fetchNotification,
    dismissNotice,
  };
};
