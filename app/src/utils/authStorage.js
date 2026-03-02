import { STORAGE_KEYS, readStorageValue, writeStorageValue } from '@/utils/storageKeys';

const RUNTIME_TOKEN_KEY = '__unirun_runtime_token__';

const safeParseJson = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

const readAppState = () => {
  const parsed = safeParseJson(readStorageValue('local', STORAGE_KEYS.LOCAL.APP_STATE));
  return parsed && typeof parsed === 'object' ? parsed : {};
};

const writeAppState = (state) => {
  writeStorageValue('local', STORAGE_KEYS.LOCAL.APP_STATE, JSON.stringify(state));
};

const patchAppState = (patcher) => {
  const current = readAppState();
  const next = patcher({ ...current }) || current;
  writeAppState(next);
};

export const setRuntimeToken = (token) => {
  if (typeof window === 'undefined') return;
  window[RUNTIME_TOKEN_KEY] = token || '';
};

export const getSessionToken = () => {
  if (typeof window !== 'undefined' && window[RUNTIME_TOKEN_KEY]) {
    return window[RUNTIME_TOKEN_KEY];
  }
  return readAppState().userInfo?.oauthToken?.token || '';
};

export const clearAuthSessionStorage = () => {
  setRuntimeToken('');
  patchAppState((state) => ({
    ...state,
    userInfo: null,
    runInfo: null,
    runStandard: null,
    activityInfo: null,
    chatUser: null,
    chatUserId: null,
  }));
};
