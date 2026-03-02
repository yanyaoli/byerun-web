const APP_STORAGE_PREFIX = 'unirun';

export const STORAGE_KEYS = Object.freeze({
  LOCAL: Object.freeze({
    APP_STATE: `${APP_STORAGE_PREFIX}.app_state`,
  }),
});

const getStorage = (type) => {
  if (typeof window === 'undefined') return null;
  if (type === 'local') return window.localStorage;
  return null;
};

export const readStorageValue = (type, key) => {
  const storage = getStorage(type);
  if (!storage) return null;
  return storage.getItem(key);
};

export const writeStorageValue = (type, key, value) => {
  const storage = getStorage(type);
  if (!storage) return;
  storage.setItem(key, value);
};
