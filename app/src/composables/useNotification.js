import { ref, computed } from 'vue';
import { scheduledTaskConfig } from '@/sdk/autorun';
import { AutorunClient } from '@/sdk/autorun/client';
import { getDismissedNotifications, addDismissedNotification } from '@/sdk/autorun/index';

const API_BASE = (scheduledTaskConfig.apiBaseUrl || '').replace(/\/$/, '');
const client = API_BASE ? new AutorunClient({ baseURL: API_BASE }) : null;

const notifications = ref([]);
const currentNotification = ref(null);
const notificationVisible = ref(false);
const loaded = ref(false);

const fetchNotification = async () => {
  if (!client) return;
  try {
    const envelope = await client.getNotification();
    let list = envelope?.data?.notifications;
    if (!Array.isArray(list)) {
      const single = envelope?.data?.notification;
      list = single ? [single] : [];
    }
    if (list.length === 0) {
      notifications.value = [];
      currentNotification.value = null;
      notificationVisible.value = false;
      loaded.value = true;
      return;
    }

    notifications.value = list;
    const dismissed = getDismissedNotifications();
    const latest = list.find((n) => n.id && !dismissed.includes(n.id)) || null;
    currentNotification.value = latest;
    notificationVisible.value = !!latest;
  } catch (error) {
    console.error('Failed to fetch notification:', error);
  } finally {
    loaded.value = true;
  }
};

const dismissNotification = () => {
  if (!currentNotification.value?.id) return;
  addDismissedNotification(currentNotification.value.id);
  notificationVisible.value = false;
  currentNotification.value = null;
};

export const useNotification = () => {
  return {
    notifications,
    currentNotification,
    notificationVisible,
    notificationLoaded: computed(() => loaded.value),
    fetchNotification,
    dismissNotification,
  };
};
