export const DEFAULT_GITHUB_PROXIES = [
  'https://ghproxy.net/',
  'https://github.akams.cn/',
  'https://proxy.pipers.cn/',
  'https://gitclone.com/',
  'https://gh-proxy.com/',
];

const STORAGE_PROXIES_KEY = 'byerun:github_proxies';
const STORAGE_ACTIVE_KEY = 'byerun:github_active_proxy';
const STORAGE_AUTO_PROBE_KEY = 'byerun:github_proxy_auto_probe';

export interface ProxyProbeResult {
  url: string;
  latency: number; // 毫秒，-1 表示超时或不可达
  ok: boolean;
}

/**
 * 规范化代理地址（补充协议与末尾斜杠）
 */
export function normalizeProxyUrl(rawUrl: string): string {
  let url = (rawUrl || '').trim();
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  if (!url.endsWith('/')) {
    url = `${url}/`;
  }
  return url;
}

/**
 * 广播代理配置变更通知
 */
export function notifyProxyChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('byerun:proxy-updated'));
  }
}

/**
 * 获取代理列表（优先读取 localStorage，未配置则读取默认值）
 */
export function getProxyList(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROXIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeProxyUrl).filter(Boolean);
      }
    }
  } catch {}
  return [...DEFAULT_GITHUB_PROXIES];
}

/**
 * 保存代理列表
 */
export function saveProxyList(list: string[]): void {
  try {
    const cleaned = list.map(normalizeProxyUrl).filter(Boolean);
    const unique = Array.from(new Set(cleaned));
    localStorage.setItem(STORAGE_PROXIES_KEY, JSON.stringify(unique));
    notifyProxyChange();
  } catch {}
}

/**
 * 恢复默认代理列表
 */
export function resetProxyList(): string[] {
  const defaults = [...DEFAULT_GITHUB_PROXIES];
  saveProxyList(defaults);
  setActiveProxy(defaults[0]);
  return defaults;
}

/**
 * 获取当前选中的加速代理节点
 */
export function getActiveProxy(): string {
  try {
    const active = localStorage.getItem(STORAGE_ACTIVE_KEY);
    if (active) return normalizeProxyUrl(active);
  } catch {}
  const list = getProxyList();
  return list[0] || 'https://ghproxy.net/';
}

/**
 * 设置当前选中的加速代理节点
 */
export function setActiveProxy(proxyUrl: string): void {
  try {
    const clean = normalizeProxyUrl(proxyUrl);
    const prev = localStorage.getItem(STORAGE_ACTIVE_KEY);
    if (prev === clean) return;
    localStorage.setItem(STORAGE_ACTIVE_KEY, clean);
    notifyProxyChange();
  } catch {}
}

/**
 * 获取是否开启智能自动测速选优
 */
export function isAutoProbeEnabled(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_AUTO_PROBE_KEY);
    if (raw !== null) {
      return raw === 'true';
    }
  } catch {}
  return true;
}

/**
 * 设置是否开启智能自动测速选优
 */
export function setAutoProbeEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_AUTO_PROBE_KEY, enabled ? 'true' : 'false');
    notifyProxyChange();
  } catch {}
}

/**
 * 将原始 GitHub 链接拼接为加速代理链接
 */
export function getProxiedUrl(targetUrl: string, proxyUrl?: string): string {
  if (!targetUrl) return '';
  const proxy = proxyUrl || getActiveProxy();
  const cleanProxy = proxy.endsWith('/') ? proxy : `${proxy}/`;

  // gitclone.com 特殊处理
  if (cleanProxy.includes('gitclone.com')) {
    if (targetUrl.startsWith('https://github.com/')) {
      return `${cleanProxy}github.com/${targetUrl.replace('https://github.com/', '')}`;
    }
    return `${cleanProxy}${targetUrl}`;
  }

  // 标准 ghproxy 格式: https://proxy/https://github.com/...
  return `${cleanProxy}${targetUrl}`;
}

/**
 * 单个代理测速探测
 */
export async function probeProxy(proxyUrl: string, timeoutMs: number = 3500): Promise<ProxyProbeResult> {
  const cleanProxy = normalizeProxyUrl(proxyUrl);
  const probeTarget = 'https://raw.githubusercontent.com/yanyaoli/byerun-web/main/version.json';
  const fullUrl = getProxiedUrl(probeTarget, cleanProxy);

  const start = performance.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(fullUrl, {
      method: 'GET',
      headers: { Range: 'bytes=0-64' },
      signal: controller.signal,
    });
    clearTimeout(timer);

    const latency = Math.round(performance.now() - start);
    if (res.ok || res.status === 206 || res.status === 200 || res.status === 302 || res.status === 304) {
      return { url: cleanProxy, latency, ok: true };
    }
    return { url: cleanProxy, latency: -1, ok: false };
  } catch {
    return { url: cleanProxy, latency: -1, ok: false };
  }
}

/**
 * 探测所有节点
 */
export async function probeAllProxies(list?: string[]): Promise<Record<string, ProxyProbeResult>> {
  const targetList = list || getProxyList();
  const results: Record<string, ProxyProbeResult> = {};

  const promises = targetList.map(async (url) => {
    const r = await probeProxy(url);
    results[url] = r;
  });

  await Promise.all(promises);
  return results;
}
