const MIGRATION_VERSION = 2;
const MIGRATION_VERSION_KEY = 'byerun.migration_version';
const APP_STATE_STORAGE_KEY = 'byerun.app_state';

const LEGACY_KEYS = {
  'unirun.app_state': 'byerun.app_state',
  'unirun.chat_state': 'byerun.chat_state',
  'unirun.autorun_state': 'byerun.autorun_state',
  'byerun_custom_maps': 'byerun.custom_maps',
};

const LEGACY_DISMISSED_KEY = 'unirun.dismissed_notifications';

function getMigrationVersion() {
  try {
    return Number(localStorage.getItem(MIGRATION_VERSION_KEY)) || 0;
  } catch {
    return 0;
  }
}

function setMigrationVersion(v) {
  try {
    localStorage.setItem(MIGRATION_VERSION_KEY, String(v));
  } catch {}
}

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

function mergeDismissedIDs(target, source) {
  if (!Array.isArray(source) || source.length === 0) return;
  if (!Array.isArray(target)) return;
  const set = new Set([...target, ...source]);
  target.length = 0;
  target.push(...set);
}

function removeSavedPassword() {
  try {
    const raw = localStorage.getItem(APP_STATE_STORAGE_KEY);
    if (!raw) return;

    const state = JSON.parse(raw);
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      removeKey(APP_STATE_STORAGE_KEY);
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(state, 'savedPassword')) return;

    delete state.savedPassword;
    localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 无法解析的应用状态无法安全地保留，清除它以避免遗留明文密码。
    removeKey(APP_STATE_STORAGE_KEY);
  }
}

export function runStorageMigration() {
  if (typeof window === 'undefined') return;
  if (typeof localStorage === 'undefined') return;

  const currentVersion = getMigrationVersion();
  if (currentVersion >= MIGRATION_VERSION) return;

  // Step 1: Migrate standard key pairs
  for (const [oldKey, newKey] of Object.entries(LEGACY_KEYS)) {
    const oldData = readJSON(oldKey);
    if (oldData === null) continue;

    const existingNew = readJSON(newKey);
    const merged = existingNew !== null && typeof existingNew === 'object' && typeof oldData === 'object'
      ? { ...oldData, ...existingNew }
      : oldData;

    writeJSON(newKey, merged);
    removeKey(oldKey);
  }

  // Step 2: Merge legacy dismissed notifications into autorun_state
  const autorunState = readJSON('byerun.autorun_state');
  const legacyDismissed = readJSON(LEGACY_DISMISSED_KEY);

  if (Array.isArray(legacyDismissed) && legacyDismissed.length > 0) {
    const target = Array.isArray(autorunState?.dismissedNotifications)
      ? autorunState.dismissedNotifications
      : [];
    mergeDismissedIDs(target, legacyDismissed);

    const stateToWrite = autorunState && typeof autorunState === 'object'
      ? { ...autorunState, dismissedNotifications: target }
      : { dismissedNotifications: target };

    writeJSON('byerun.autorun_state', stateToWrite);
    removeKey(LEGACY_DISMISSED_KEY);
  }

  if (currentVersion < 2) {
    // Step 3: 清理旧版本持久化的明文密码。
    removeSavedPassword();
  }

  setMigrationVersion(MIGRATION_VERSION);
}
