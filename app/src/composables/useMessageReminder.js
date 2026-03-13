import MessageClient from '@/composables/messageClient';

const CHAT_API_BASE = (import.meta.env.VITE_CHAT_SERVER_BASE_URL || '').replace(/\/$/, '');
const messageClient = new MessageClient({ baseUrl: CHAT_API_BASE });

const resolveUnreadState = (payload) => {
  if (!payload || typeof payload !== 'object') return false;
  if (payload.has_unread === true) return true;
  if (payload.has_unread === false) return false;
  return payload.hasUnread === true;
};

export const checkHasUnreadMessages = async (token) => {
  if (!token || !CHAT_API_BASE) return false;

  try {
    messageClient.setToken(token, { reconnect: false });
    const data = await messageClient.getUnreadState();
    return resolveUnreadState(data);
  } catch (error) {
    console.error('获取未读消息失败:', error);
    return false;
  }
};
