const APP_STATE_STORAGE_KEY = 'byerun.app_state';
const CHAT_STATE_STORAGE_KEY = 'byerun.chat_state';
const RUNTIME_TOKEN_KEY = '__unirun_runtime_token__';

export const setRuntimeToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  (window as any)[RUNTIME_TOKEN_KEY] = token || '';
};

export const getSessionToken = (): string => {
  if (typeof window !== 'undefined' && (window as any)[RUNTIME_TOKEN_KEY]) {
    return (window as any)[RUNTIME_TOKEN_KEY];
  }
  if (typeof window === 'undefined') return '';

  try {
    const raw = window.localStorage.getItem(APP_STATE_STORAGE_KEY);
    const appState = raw ? JSON.parse(raw) : null;
    return appState?.userInfo?.oauthToken?.token || '';
  } catch {
    return '';
  }
};

export const clearAuthSessionStorage = (): void => {
  if (typeof window === 'undefined') return;
  (window as any)[RUNTIME_TOKEN_KEY] = '';

  let appState: Record<string, any> = {};
  try {
    const raw = window.localStorage.getItem(APP_STATE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === 'object') {
      appState = parsed;
    }
  } catch {}

  window.localStorage.setItem(
    APP_STATE_STORAGE_KEY,
    JSON.stringify({
      ...appState,
      userInfo: null,
      runInfo: null,
      runStandard: null,
      activityInfo: null,
      chatUser: null,
      chatUserId: null,
    }),
  );
  window.localStorage.removeItem(CHAT_STATE_STORAGE_KEY);
};
