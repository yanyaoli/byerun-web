import MessageClient from '@/composables/messageClient';
import { STORAGE_KEYS, readStorageValue } from '@/utils/storageKeys';

const CHAT_API_BASE = (import.meta.env.VITE_CHAT_SERVER_BASE_URL || '').replace(/\/$/, '');
const messageClient = new MessageClient({ baseUrl: CHAT_API_BASE });

const parseTimestamp = (value) => {
  const timestamp = Date.parse(value || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const getLatestMessageTimestamp = (messages = []) =>
  messages.reduce((maxTimestamp, message) => {
    const timestamp = parseTimestamp(message?.created_at);
    return Math.max(maxTimestamp, timestamp);
  }, 0);

const getCachedLastSeenAt = () => {
  const raw = readStorageValue('local', STORAGE_KEYS.LOCAL.APP_STATE);
  if (!raw) return '';
  try {
    return JSON.parse(raw)?.chatUser?.last_seen_at || '';
  } catch (error) {
    return '';
  }
};

export const checkHasUnreadMessages = async (token) => {
  if (!token || !CHAT_API_BASE) return false;

  try {
    messageClient.setToken(token, { reconnect: false });
    const data = await messageClient.listMessages(1, 20);
    const latestMessageAt = getLatestMessageTimestamp(data?.messages || []);
    const lastSeenAt = parseTimestamp(getCachedLastSeenAt());
    return latestMessageAt > lastSeenAt;
  } catch (error) {
    console.error('Failed to check unread messages:', error);
    return false;
  }
};
