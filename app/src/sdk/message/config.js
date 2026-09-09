export const CHAT_API_BASE_URL_OVERRIDE_KEY = 'byerun.chat_api_base_url_override';

const getStoredChatApiBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  try {
    return String(window.localStorage.getItem(CHAT_API_BASE_URL_OVERRIDE_KEY) || '').trim();
  } catch {
    return '';
  }
};

export const getChatApiBaseUrlDefault = () =>
  String(import.meta.env.VITE_CHAT_SERVER_BASE_URL || '').trim().replace(/\/+$/, '');

export const messageSdkConfig = {
  apiBaseUrl: getStoredChatApiBaseUrl() || getChatApiBaseUrlDefault(),
};

export const getChatApiBaseUrlOverride = getStoredChatApiBaseUrl;

export const setChatApiBaseUrlOverride = (value) => {
  const override = String(value || '').trim().replace(/\/+$/, '');
  try {
    if (typeof window !== 'undefined') {
      if (override) window.localStorage.setItem(CHAT_API_BASE_URL_OVERRIDE_KEY, override);
      else window.localStorage.removeItem(CHAT_API_BASE_URL_OVERRIDE_KEY);
    }
  } catch {}

  messageSdkConfig.apiBaseUrl = override || getChatApiBaseUrlDefault();
  return messageSdkConfig.apiBaseUrl;
};
