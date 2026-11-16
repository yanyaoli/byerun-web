import { ref, type Ref } from 'vue';
import stickerConfig from '@/assets/data/stickers.json';

const STICKER_VERSION = 'v1_20260331';

export interface StickerCachePayload {
  version: string;
  hash: string;
  updatedAt: number;
  groups: Record<string, any>;
}

function normalizeStickerCache(raw: any): StickerCachePayload | null {
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

async function computeConfigHash(): Promise<string> {
  const configStr = JSON.stringify(stickerConfig);

  // Non-secure contexts may not expose crypto.subtle; fallback keeps cache logic working.
  if (globalThis.crypto?.subtle && typeof TextEncoder !== 'undefined') {
    try {
      const encoder = new TextEncoder();
      const hashBuffer = await globalThis.crypto.subtle.digest(
        'SHA-256',
        encoder.encode(configStr),
      );
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 16);
    } catch (e) {
      console.warn('Failed to compute SHA-256 sticker hash, using fallback hash', e);
    }
  }

  let hash = 2166136261;
  for (let i = 0; i < configStr.length; i++) {
    hash ^= configStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

async function fetchStickerGroups(): Promise<Record<string, any>> {
  const groups: Record<string, any> = {};

  const results = await Promise.allSettled(
    stickerConfig.map(async (url: string, index: number) => {
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
      console.warn('Failed to load sticker group:', stickerConfig[index], (item as any).reason);
    }
  });

  return groups;
}

export interface UseStickerCacheOptions {
  getChatStickerCache?: () => any;
  setChatStickerCache?: (cache: any) => void;
}

export function useStickerCache(options: UseStickerCacheOptions = {}) {
  const { getChatStickerCache, setChatStickerCache } = options;

  const stickerGroups: Ref<Record<string, any>> = ref({});
  const stickerLoading: Ref<boolean> = ref(false);
  const stickerLoaded: Ref<boolean> = ref(false);

  let loadTask: Promise<any> | null = null;
  let silentRefreshTriggered = false;

  const getStoredCache = (): StickerCachePayload | null => {
    const raw = getChatStickerCache?.();
    return normalizeStickerCache(raw);
  };

  const persistCache = (payload: any): void => {
    const normalized = normalizeStickerCache(payload);
    if (!normalized) return;
    setChatStickerCache?.(normalized);
  };

  function hydrateStickerCache(): StickerCachePayload | null {
    const stored = getStoredCache();
    if (stored) {
      stickerGroups.value = stored.groups;
      stickerLoaded.value = true;
      return stored;
    }

    return null;
  }

  async function loadStickers(loadOptions: { forceRefresh?: boolean; silent?: boolean } = {}): Promise<any> {
    const { forceRefresh = false, silent = false } = loadOptions;

    if (loadTask) return loadTask;
    if (stickerLoaded.value && !forceRefresh && Object.keys(stickerGroups.value).length > 0) return;

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

        const payload: StickerCachePayload = {
          version: STICKER_VERSION,
          hash: currentHash,
          updatedAt: Date.now(),
          groups,
        };

        stickerGroups.value = groups;
        stickerLoaded.value = true;
        persistCache(payload);
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

  function triggerSilentStickerRefresh(): void {
    if (silentRefreshTriggered && Object.keys(stickerGroups.value).length > 0) return;
    silentRefreshTriggered = true;

    loadStickers({ forceRefresh: true, silent: true })
      .catch((e) => {
        console.warn('Silent sticker refresh failed', e);
      })
      .finally(() => {
        if (Object.keys(stickerGroups.value).length === 0) {
          silentRefreshTriggered = false;
        }
      });
  }

  async function ensureStickerTabReady(tabId?: string): Promise<void> {
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
