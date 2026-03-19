import MessageClient from './client';
import { messageSdkConfig } from './config';

const unreadStateClient = new MessageClient({ baseUrl: messageSdkConfig.apiBaseUrl });

const resolveUnreadState = (payload) => {
  if (!payload || typeof payload !== 'object') return false;
  if (payload.has_unread === true) return true;
  if (payload.has_unread === false) return false;
  return payload.hasUnread === true;
};

export const checkHasUnreadMessages = async (token) => {
  if (!token || !messageSdkConfig.apiBaseUrl) return false;

  try {
    unreadStateClient.setToken(token, { reconnect: false });
    const data = await unreadStateClient.getUnreadState();
    return resolveUnreadState(data);
  } catch (error) {
    console.error('Failed to fetch unread message state:', error);
    return false;
  }
};

export { MessageClient, messageSdkConfig };
export { formatTime, getEmojiUrl, normalizeAvatarUrl, renderContent } from './render';
