import { ref } from 'vue';
import { AutorunClient } from '@/composables/autorun-sdk';
import { scheduledTaskConfig } from '@/utils/config';

const API_BASE = (scheduledTaskConfig.apiBaseUrl || '').replace(/\/$/, '');
const autorunClient = API_BASE ? new AutorunClient({ baseURL: API_BASE }) : null;

const pingMeta = ref(null);
const pingReady = ref(!autorunClient);

const pingReadyWaiters = new Set();
let pingRequestPromise = null;

const resolvePingReadyWaiters = () => {
  pingReadyWaiters.forEach((resolve) => resolve(pingMeta.value));
  pingReadyWaiters.clear();
};

const markPingReady = () => {
  pingReady.value = true;
  resolvePingReadyWaiters();
};

const requestPingMeta = async () => {
  if (!autorunClient) {
    markPingReady();
    return pingMeta.value;
  }

  try {
    const envelope = await autorunClient.ping();
    pingMeta.value = envelope?.data || null;
  } catch (error) {
    console.error('Failed to preload /ping metadata:', error);
    pingMeta.value = null;
  } finally {
    markPingReady();
    pingRequestPromise = null;
  }

  return pingMeta.value;
};

export const preloadAutorunPingMeta = async () => {
  if (pingReady.value) return pingMeta.value;
  if (!pingRequestPromise) {
    pingRequestPromise = requestPingMeta();
  }
  return pingRequestPromise;
};

export const waitForAutorunPingReady = () => {
  if (pingReady.value) return Promise.resolve(pingMeta.value);
  return new Promise((resolve) => {
    pingReadyWaiters.add(resolve);
  });
};

export const useAutorunPingMeta = () => ({
  pingMeta,
  pingReady,
  preloadAutorunPingMeta,
  waitForAutorunPingReady,
});
