import { clearAuthSessionStorage, getSessionToken } from './session';
import { AppApiClient } from './client';

export const API_BASE_URL_OVERRIDE_KEY = 'byerun.api_base_url_override';

const getStoredApiBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  try {
    return String(window.localStorage.getItem(API_BASE_URL_OVERRIDE_KEY) || '').trim();
  } catch {
    return '';
  }
};

const getDefaultApiBaseUrl = () => import.meta.env.VITE_API_BASE_URL || '';
const normalizeApiBaseUrl = (value) => String(value || '').trim().replace(/\/+$/, '');
const resolveApiBaseUrl = () =>
  normalizeApiBaseUrl(getStoredApiBaseUrl() || getDefaultApiBaseUrl()) || '/devproxy';

export const appConfig = {
  appVersion: '1.8.5',
  api: {
    baseUrl: resolveApiBaseUrl(),
  },
  auth: {
    appKey: import.meta.env.VITE_APP_KEY || '389885588s0648fa',
    appSecret: import.meta.env.VITE_APP_SECRET || '56E39A1658455588885690425C0FD16055A21676',
  },
};

export const urls = {
  github: 'https://github.com/yanyaoli/byerun-web',
};

function handleAuthFailure() {
  clearAuthSessionStorage();

  if (typeof window === 'undefined') return;
  if (window.location.pathname !== '/') {
    window.location.replace('/');
  }
}

export const api = new AppApiClient({
  baseURL: appConfig.api.baseUrl,
  appVersion: appConfig.appVersion,
  appKey: appConfig.auth.appKey,
  appSecret: appConfig.auth.appSecret,
  tokenProvider: getSessionToken,
  onAuthFailure: handleAuthFailure,
});

export const getApiBaseUrlOverride = getStoredApiBaseUrl;
export const getApiBaseUrlDefault = () =>
  normalizeApiBaseUrl(getDefaultApiBaseUrl()) || '/devproxy';

export const setApiBaseUrlOverride = (value) => {
  const override = normalizeApiBaseUrl(value);

  try {
    if (typeof window !== 'undefined') {
      if (override) {
        window.localStorage.setItem(API_BASE_URL_OVERRIDE_KEY, override);
      } else {
        window.localStorage.removeItem(API_BASE_URL_OVERRIDE_KEY);
      }
    }
  } catch {}

  const baseUrl = override || getApiBaseUrlDefault();
  appConfig.api.baseUrl = baseUrl;
  api.http.defaults.baseURL = baseUrl;
  return baseUrl;
};

export { AppApiClient };
