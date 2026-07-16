import { ref } from 'vue';
import { ApiBusinessError, AutorunClient } from './client';

const AUTORUN_STATE_STORAGE_KEY = 'byerun.autorun_state';

export const scheduledTaskConfig = {
  apiBaseUrl: import.meta.env.DEV
    ? '/autorunserver'
    : import.meta.env.VITE_AUTORUN_SERVER_BASE || '',
};

const API_BASE = (scheduledTaskConfig.apiBaseUrl || '').replace(/\/$/, '');
const autorunClient = API_BASE ? new AutorunClient({ baseURL: API_BASE }) : null;

const getCachedPingMeta = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(AUTORUN_STATE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const value = parsed?.pingMeta ?? null;
    return value && typeof value === 'object' ? value : null;
  } catch {
    return null;
  }
};

const setCachedPingMeta = (value) => {
  if (typeof window === 'undefined') return;

  try {
    const raw = window.localStorage.getItem(AUTORUN_STATE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const state = parsed && typeof parsed === 'object' ? parsed : {};

    if (!value || typeof value !== 'object') {
      delete state.pingMeta;
      if (Object.keys(state).length === 0) {
        window.localStorage.removeItem(AUTORUN_STATE_STORAGE_KEY);
        return;
      }

      window.localStorage.setItem(AUTORUN_STATE_STORAGE_KEY, JSON.stringify(state));
      return;
    }

    window.localStorage.setItem(
      AUTORUN_STATE_STORAGE_KEY,
      JSON.stringify({
        ...state,
        pingMeta: value,
      }),
    );
  } catch {}
};

export const pingMeta = ref(getCachedPingMeta());
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
      setCachedPingMeta(pingMeta.value);
    } catch (error) {
      console.error('Failed to preload /ping metadata:', error);
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

const getAutorunState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTORUN_STATE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const setAutorunState = (patch) => {
  if (typeof window === 'undefined') return;
  try {
    const current = getAutorunState() || {};
    const next = { ...current, ...patch };
    if (Object.keys(next).length === 0) {
      window.localStorage.removeItem(AUTORUN_STATE_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(AUTORUN_STATE_STORAGE_KEY, JSON.stringify(next));
  } catch {}
};

export const getDismissedNotifications = () => {
  const state = getAutorunState();
  return Array.isArray(state?.dismissedNotifications) ? state.dismissedNotifications : [];
};

export const addDismissedNotification = (id) => {
  const current = getDismissedNotifications();
  if (current.includes(id)) return;
  setAutorunState({ dismissedNotifications: [...current, id] });
};

export { ApiBusinessError, AutorunClient };
