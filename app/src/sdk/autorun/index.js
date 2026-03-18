import { ref } from 'vue';
import { ApiBusinessError, AutorunClient } from './client';

export const scheduledTaskConfig = {
  apiBaseUrl: import.meta.env.DEV
    ? '/autorunserver'
    : import.meta.env.VITE_AUTORUN_SERVER_BASE || '',
};

const API_BASE = (scheduledTaskConfig.apiBaseUrl || '').replace(/\/$/, '');
const autorunClient = API_BASE ? new AutorunClient({ baseURL: API_BASE }) : null;

export const pingMeta = ref(null);
export const pingReady = ref(!autorunClient);

const pingReadyWaiters = new Set();
let pingRequestPromise = null;

export const preloadAutorunPingMeta = async () => {
  if (pingReady.value) return pingMeta.value;
  if (pingRequestPromise) return pingRequestPromise;

  pingRequestPromise = (async () => {
    if (!autorunClient) {
      pingReady.value = true;
      return pingMeta.value;
    }

    try {
      const envelope = await autorunClient.ping();
      pingMeta.value = envelope?.data || null;
    } catch (error) {
      console.error('Failed to preload /ping metadata:', error);
      pingMeta.value = null;
    } finally {
      pingReady.value = true;
      pingRequestPromise = null;
      pingReadyWaiters.forEach((resolve) => resolve(pingMeta.value));
      pingReadyWaiters.clear();
    }

    return pingMeta.value;
  })();

  return pingRequestPromise;
};

export const waitForAutorunPingReady = () => {
  if (pingReady.value) return Promise.resolve(pingMeta.value);
  return new Promise((resolve) => {
    pingReadyWaiters.add(resolve);
  });
};

export { ApiBusinessError, AutorunClient };
