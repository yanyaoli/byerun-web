import { scheduledTaskConfig } from '@/sdk/autorun';
import { AutorunClient } from '@/sdk/autorun/client';
import { getDismissedAt, markNotificationDismissed } from '@/sdk/autorun/index';
import { showMessage } from '@/composables/useMessage';

let client = null;

const getClient = () => {
  const apiBase = (scheduledTaskConfig.apiBaseUrl || '').replace(/\/$/, '');
  if (!apiBase) return null;
  if (!client || client.baseURL !== apiBase) {
    client = new AutorunClient({ baseURL: apiBase });
  }
  return client;
};

const fetchNotification = async () => {
  const currentClient = getClient();
  if (!currentClient) return;
  try {
    const envelope = await currentClient.getNotification();
    let list = envelope?.data?.notifications;
    if (!Array.isArray(list)) {
      const single = envelope?.data?.notification;
      list = single ? [single] : [];
    }
    if (list.length === 0) return;

    const dismissedAt = getDismissedAt();
    const latest = list.find((n) => {
      const ts = Date.parse(n?.createdAt);
      return Number.isFinite(ts) && ts > dismissedAt;
    });
    if (!latest) return;

    const createdAt = latest.createdAt;
    showMessage(latest.content, latest.type || 'info', {
      duration: 0,
      onClose: () => markNotificationDismissed(createdAt),
    });
  } catch (error) {
    console.error('Failed to fetch notification:', error);
  }
};

/**
 * 启动服务端通知监听：立即拉取一次，并在每次路由切换后重新拉取，
 * 通过全局 Message 展示（常驻，关闭时持久化 dismiss 状态）。
 * @param {import('vue-router').Router} router
 * @returns {() => void} 停止监听
 */
export const startNotificationWatcher = (router) => {
  fetchNotification();
  const stopAfterEach = router.afterEach(() => {
    fetchNotification();
  });
  return () => stopAfterEach();
};

export const useNotification = () => {
  return { fetchNotification };
};
