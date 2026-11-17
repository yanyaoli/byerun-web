import { ref, type Ref } from 'vue';
import { clearAuthSessionStorage, getSessionToken } from './session';
import { AppApiClient, ApiBusinessError } from './client';
import {
  getActiveApiBaseUrl,
  onServerChange,
  OFFICIAL_SERVER_URL,
  useServerConfig,
} from '@/composables/useServerConfig';
import { showMessage } from '@/composables/useMessage';

const getDefaultApiBaseUrl = (): string => getActiveApiBaseUrl();

export const appConfig = {
  appVersion: '1.8.5',
  api: {
    baseUrl: getDefaultApiBaseUrl(),
  },
  auth: {
    appKey: import.meta.env.VITE_APP_KEY || '389885588s0648fa',
    appSecret: import.meta.env.VITE_APP_SECRET || '56E39A1658455588885690425C0FD16055A21676',
  },
};

export const scheduledTaskConfig = {
  apiBaseUrl: appConfig.api.baseUrl,
};

export const urls = {
  github: 'https://github.com/yanyaoli/byerun-web',
};

function handleAuthFailure(): void {
  clearAuthSessionStorage();

  if (typeof window === 'undefined') return;
  if (window.location.pathname !== '/') {
    window.location.replace('/');
  }
}

export const api: AppApiClient = new AppApiClient({
  baseURL: appConfig.api.baseUrl,
  appVersion: appConfig.appVersion,
  appKey: appConfig.auth.appKey,
  appSecret: appConfig.auth.appSecret,
  tokenProvider: getSessionToken,
  onAuthFailure: handleAuthFailure,
});

api.officialURL = OFFICIAL_SERVER_URL;
api.onFallback = () => {
  useServerConfig().setFallbackActive(true);
  showMessage('服务器连接异常，已自动回退至官方源', 'warning');
};

onServerChange((newUrl) => {
  appConfig.api.baseUrl = newUrl;
  scheduledTaskConfig.apiBaseUrl = newUrl;
  api.setBaseURL(newUrl);
});

export const getApiBaseUrlDefault = getDefaultApiBaseUrl;
export const getAutorunApiBaseUrlDefault = getDefaultApiBaseUrl;

// Unified client provider: app and autorun share the exact same client and base URL
export const getAutorunClient = (): AppApiClient => api;
export const AutorunClient = AppApiClient;

// --- Autorun State & Ping Management ---
const AUTORUN_STATE_STORAGE_KEY = 'byerun.autorun_state';

const getCachedPingMeta = (): any => {
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

const setCachedPingMeta = (value: any): void => {
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

export const pingMeta: Ref<any> = ref(getCachedPingMeta());
export const pingReady: Ref<boolean> = ref(!api);

const pingReadyWaiters = new Set<(value: any) => void>();
let pingRequestPromise: Promise<any> | null = null;

export const preloadAutorunPingMeta = async (): Promise<any> => {
  if (pingReady.value) return pingMeta.value;
  if (pingRequestPromise) return pingRequestPromise;

  pingRequestPromise = (async () => {
    try {
      const envelope = await api.ping();
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

export const waitForAutorunPingReady = (): Promise<any> => {
  if (pingReady.value) return Promise.resolve(pingMeta.value);
  return new Promise((resolve) => {
    pingReadyWaiters.add(resolve);
  });
};

const getAutorunState = (): any => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTORUN_STATE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const setAutorunState = (patch: Record<string, any>): void => {
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

export const getDismissedAt = (): number => {
  const state = getAutorunState();
  const value = Number(state?.dismissedAt);
  return Number.isFinite(value) && value > 0 ? value : 0;
};

export const markNotificationDismissed = (createdAt: string): void => {
  const ts = Date.parse(createdAt);
  if (!Number.isFinite(ts)) return;
  if (ts <= getDismissedAt()) return;
  setAutorunState({ dismissedAt: ts });
};

export { AppApiClient, ApiBusinessError };
