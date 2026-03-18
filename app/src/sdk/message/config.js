export const messageSdkConfig = {
  apiBaseUrl: (import.meta.env.VITE_CHAT_SERVER_BASE_URL || '').replace(/\/$/, ''),
};
