import { clearAuthSessionStorage, getSessionToken } from './session';
import { AppApiClient } from './client';

const vBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

export const appConfig = {
  appVersion: '1.8.3',
  api: {
    baseUrl: vBaseUrl || '/devproxy',
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

export { AppApiClient };
