import { ref, computed } from 'vue';
import axios from 'axios';
import { Capacitor } from '@capacitor/core';

export const OFFICIAL_SERVER_URL = 'https://run-lb.tanmasports.com/v1';
export const PROXY_SERVER_URL = 'https://api.byerun.top';
export const MESSAGE_SERVER_URL = 'https://chatserver.byerun.top';

export type ServerSourceType = 'proxy' | 'official' | 'custom';

export const isOfficialSourceSupported = (): boolean => Capacitor.isNativePlatform();

const SOURCE_STORAGE_KEY = 'byerun.server_source_type';
const CUSTOM_URL_STORAGE_KEY = 'byerun.server_custom_url';

function getInitialSourceType(): ServerSourceType {
  if (typeof window === 'undefined') return 'proxy';
  try {
    const val = localStorage.getItem(SOURCE_STORAGE_KEY);
    if (val === 'official' && !isOfficialSourceSupported()) {
      return 'proxy';
    }
    if (val === 'proxy' || val === 'official' || val === 'custom') return val;
  } catch {}
  return 'proxy';
}

function getInitialCustomUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(CUSTOM_URL_STORAGE_KEY) || '';
  } catch {}
  return '';
}

const sourceType = ref<ServerSourceType>(getInitialSourceType());
const customUrl = ref<string>(getInitialCustomUrl());
const isFallbackActive = ref<boolean>(false);

// 监听变更回调列表
type ServerChangeCallback = (newBaseUrl: string) => void;
const serverChangeListeners: Set<ServerChangeCallback> = new Set();

export const onServerChange = (cb: ServerChangeCallback) => {
  serverChangeListeners.add(cb);
  return () => serverChangeListeners.delete(cb);
};

export const getActiveApiBaseUrl = (): string => {
  if (isFallbackActive.value && isOfficialSourceSupported()) return OFFICIAL_SERVER_URL;
  if (sourceType.value === 'official') {
    return isOfficialSourceSupported() ? OFFICIAL_SERVER_URL : PROXY_SERVER_URL;
  }
  if (sourceType.value === 'custom') {
    const clean = customUrl.value.trim().replace(/\/+$/, '');
    return clean || PROXY_SERVER_URL;
  }
  return PROXY_SERVER_URL;
};

export const useServerConfig = () => {
  const activeBaseUrl = computed(() => getActiveApiBaseUrl());
  const isOfficialSupported = isOfficialSourceSupported();

  const notifyChange = () => {
    const current = getActiveApiBaseUrl();
    serverChangeListeners.forEach((listener) => {
      try {
        listener(current);
      } catch (e) {
        console.error('Server change listener error:', e);
      }
    });
  };

  const setSourceType = (type: ServerSourceType): boolean => {
    if (type === 'official' && !isOfficialSourceSupported()) {
      return false;
    }
    sourceType.value = type;
    isFallbackActive.value = false;
    try {
      localStorage.setItem(SOURCE_STORAGE_KEY, type);
    } catch {}
    notifyChange();
    return true;
  };

  const setCustomUrl = (url: string) => {
    customUrl.value = url;
    try {
      localStorage.setItem(CUSTOM_URL_STORAGE_KEY, url);
    } catch {}
    if (sourceType.value === 'custom') {
      isFallbackActive.value = false;
      notifyChange();
    }
  };

  const setFallbackActive = (active: boolean) => {
    if (active && !isOfficialSourceSupported()) return;
    isFallbackActive.value = active;
    notifyChange();
  };

  const resetToDefault = () => {
    sourceType.value = 'proxy';
    customUrl.value = '';
    isFallbackActive.value = false;
    try {
      localStorage.removeItem(SOURCE_STORAGE_KEY);
      localStorage.removeItem(CUSTOM_URL_STORAGE_KEY);
    } catch {}
    notifyChange();
  };

  const testConnection = async (targetUrl: string): Promise<{ ok: boolean; latency: number; message: string }> => {
    const url = targetUrl.trim().replace(/\/+$/, '');
    if (!url) return { ok: false, latency: -1, message: '请输入有效的服务地址' };
    const start = Date.now();
    try {
      await axios.get(`${url}/auth/query/token`, { timeout: 6000 });
      const latency = Date.now() - start;
      return { ok: true, latency, message: '服务连接正常' };
    } catch (e: any) {
      const latency = Date.now() - start;
      // 401/403 或 code 10001/40010 表示服务连通且网关正常响应拦截
      if (e.response && (e.response.status === 401 || e.response.status === 403 || e.response.data?.code === 10001 || e.response.data?.code === 40010)) {
        return { ok: true, latency, message: '服务连接成功（网关正常）' };
      }
      const msg = e.response?.data?.msg || e.message || '连接失败';
      return { ok: false, latency: -1, message: msg };
    }
  };

  const testMessageServerConnection = async (targetUrl: string = MESSAGE_SERVER_URL): Promise<{ ok: boolean; latency: number; message: string }> => {
    const url = (targetUrl || MESSAGE_SERVER_URL).trim().replace(/\/+$/, '');
    const start = Date.now();
    try {
      await axios.get(`${url}/health`, { timeout: 6000 });
      const latency = Date.now() - start;
      return { ok: true, latency, message: '消息服务连接正常' };
    } catch (e: any) {
      const latency = Date.now() - start;
      if (e.response && (e.response.status === 200 || e.response.data?.code === '20000')) {
        return { ok: true, latency, message: '消息服务连接正常' };
      }
      const msg = e.response?.data?.message || e.message || '连接失败';
      return { ok: false, latency: -1, message: msg };
    }
  };

  return {
    sourceType,
    customUrl,
    activeBaseUrl,
    isFallbackActive,
    isOfficialSupported,
    OFFICIAL_SERVER_URL,
    PROXY_SERVER_URL,
    MESSAGE_SERVER_URL,
    setSourceType,
    setCustomUrl,
    setFallbackActive,
    resetToDefault,
    testConnection,
    testMessageServerConnection,
  };
};
