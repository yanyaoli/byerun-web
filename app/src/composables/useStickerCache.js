import { ref } from 'vue';
import stickerConfig from '@/assets/data/stickers.json';

const STICKER_VERSION = 'v1_20260331';
const LEGACY_STICKER_STORAGE_KEY = 'chat_stickers_cache';
const LEGACY_STICKER_HASH_KEYS = ['chat_stickers_hash', 'chat_sticker_version'];

function normalizeStickerCache(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const groups = raw.groups && typeof raw.groups === 'object' ? raw.groups : null;
  if (!groups || Object.keys(groups).length === 0) return null;

  return {
    version: String(raw.version || STICKER_VERSION),
    hash: String(raw.hash || ''),
    updatedAt: Number(raw.updatedAt || 0),
    groups,
  };
}

function readLegacyStickerCache() {
  try {
    const raw = localStorage.getItem(LEGACY_STICKER_STORAGE_KEY);
    if (!raw) return null;

    const groups = JSON.parse(raw);
    if (!groups || typeof groups !== 'object' || Object.keys(groups).length === 0) {
      return null;
    }

    const hash =
      LEGACY_STICKER_HASH_KEYS.map((key) => String(localStorage.getItem(key) || '').trim()).find(
        Boolean,
      ) || '';

    return {
      version: STICKER_VERSION,
      hash,
      updatedAt: Date.now(),
      groups,
    };
  } catch {
    return null;
  }
}

function clearLegacyStickerCache() {
  try {
    localStorage.removeItem(LEGACY_STICKER_STORAGE_KEY);
    LEGACY_STICKER_HASH_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (e) {
    console.warn('Failed to clear legacy sticker cache', e);
  }
}

async function computeConfigHash() {
  const configStr = JSON.stringify(stickerConfig);
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(configStr));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}

async function fetchStickerGroups() {
  const groups = {};

  const results = await Promise.allSettled(
    stickerConfig.map(async (url, index) => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      return [`sticker-${index}`, data];
    }),
  );

  results.forEach((item, index) => {
    if (item.status === 'fulfilled') {
      const [id, data] = item.value;
      groups[id] = data;
    } else {
      console.warn('Failed to load sticker group:', stickerConfig[index], item.reason);
    }
  });

  return groups;
}

export function useStickerCache(options = {}) {
  const { getChatStickerCache, setChatStickerCache } = options;

  const stickerGroups = ref({});
  const stickerLoading = ref(false);
  const stickerLoaded = ref(false);

  let loadTask = null;
  let silentRefreshTriggered = false;

  const getStoredCache = () => normalizeStickerCache(getChatStickerCache?.());

  const persistCache = (payload) => {
    const normalized = normalizeStickerCache(payload);
    if (!normalized) return;
    setChatStickerCache?.(normalized);
  };

  function hydrateStickerCache() {
    const stored = getStoredCache();
    if (stored) {
      stickerGroups.value = stored.groups;
      stickerLoaded.value = true;
      return stored;
    }

    const legacy = readLegacyStickerCache();
    if (!legacy) return null;

    stickerGroups.value = legacy.groups;
    stickerLoaded.value = true;
    persistCache(legacy);
    clearLegacyStickerCache();
    return legacy;
  }

  async function loadStickers(loadOptions = {}) {
    const { forceRefresh = false, silent = false } = loadOptions;

    if (loadTask) return loadTask;
    if (stickerLoaded.value && !forceRefresh) return;

    const cached = hydrateStickerCache();
    if (!silent) {
      stickerLoading.value = true;
    }

    loadTask = (async () => {
      try {
        const currentHash = await computeConfigHash();

        if (
          cached?.groups &&
          cached.version === STICKER_VERSION &&
          cached.hash === currentHash &&
          Object.keys(cached.groups).length > 0
        ) {
          stickerLoaded.value = true;
          return;
        }

        const groups = await fetchStickerGroups();
        if (Object.keys(groups).length === 0) {
          if (!cached?.groups) {
            stickerGroups.value = {};
          }
          return;
        }

        const payload = {
          version: STICKER_VERSION,
          hash: currentHash,
          updatedAt: Date.now(),
          groups,
        };

        stickerGroups.value = groups;
        stickerLoaded.value = true;
        persistCache(payload);
        clearLegacyStickerCache();
      } catch (e) {
        console.error('Failed to load stickers', e);
        if (!cached?.groups) {
          stickerGroups.value = {};
        }
      } finally {
        if (!silent) {
          stickerLoading.value = false;
        }
        loadTask = null;
      }
    })();

    return loadTask;
  }

  function triggerSilentStickerRefresh() {
    if (silentRefreshTriggered) return;
    silentRefreshTriggered = true;

    setTimeout(() => {
      loadStickers({ forceRefresh: true, silent: true }).catch((e) => {
        console.warn('Silent sticker refresh failed', e);
      });
    }, 0);
  }

  async function ensureStickerTabReady(tabId) {
    if (!tabId || tabId === 'emoji') return;
    if (stickerGroups.value[tabId]) return;
    await loadStickers();
  }

  return {
    stickerGroups,
    stickerLoading,
    hydrateStickerCache,
    loadStickers,
    ensureStickerTabReady,
    triggerSilentStickerRefresh,
  };
}
