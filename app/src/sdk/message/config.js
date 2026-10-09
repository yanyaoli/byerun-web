// 清理历史可能残留的自定义接口缓存
if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem('byerun.chat_api_base_url_override');
  } catch {}
}

export const getChatApiBaseUrlDefault = () =>
  String(import.meta.env.VITE_CHAT_SERVER_BASE_URL || '').trim().replace(/\/+$/, '');

export const messageSdkConfig = {
  apiBaseUrl: getChatApiBaseUrlDefault(),
};
