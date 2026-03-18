import { ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

const CHAT_STATE_STORAGE_KEY = 'unirun.chat_state';

const useChatStateStore = defineStore(
  'chatState',
  () => {
    const chatUser = ref(null);
    const chatUserId = ref(null);
    const chatUnread = ref(false);
    const chatLastSeenAt = ref('');

    const setCachedChatUser = (user) => {
      if (!user || typeof user !== 'object') {
        chatUser.value = null;
        chatUserId.value = null;
        chatLastSeenAt.value = '';
        return;
      }

      chatUser.value = user;
      chatUserId.value =
        user.user_id !== undefined && user.user_id !== null ? String(user.user_id) : null;

      const userSeenAt = String(user.last_seen_at || '').trim();
      if (!userSeenAt) return;

      const nextSeenAt = Date.parse(userSeenAt);
      const currentSeenAt = Date.parse(chatLastSeenAt.value || '');
      if (Number.isFinite(nextSeenAt) && nextSeenAt > (Number.isFinite(currentSeenAt) ? currentSeenAt : 0)) {
        chatLastSeenAt.value = userSeenAt;
      }
    };

    const getCachedChatUserId = () => {
      if (chatUserId.value) return chatUserId.value;
      if (chatUser.value?.user_id !== undefined && chatUser.value?.user_id !== null) {
        chatUserId.value = String(chatUser.value.user_id);
        return chatUserId.value;
      }
      return null;
    };

    const setChatUnread = (value) => {
      chatUnread.value = value === true;
    };

    const markChatSeen = (seenAt = new Date().toISOString()) => {
      const nextSeenAt = String(seenAt || '').trim() || new Date().toISOString();
      const nextSeenAtValue = Date.parse(nextSeenAt);
      const currentSeenAtValue = Date.parse(chatLastSeenAt.value || '');
      const finalSeenAt =
        Number.isFinite(nextSeenAtValue) &&
        nextSeenAtValue >= (Number.isFinite(currentSeenAtValue) ? currentSeenAtValue : 0)
          ? nextSeenAt
          : chatLastSeenAt.value;

      chatUnread.value = false;
      chatLastSeenAt.value = finalSeenAt;

      if (!chatUser.value || typeof chatUser.value !== 'object') return;
      chatUser.value = {
        ...chatUser.value,
        last_seen_at: finalSeenAt,
      };
    };

    const clearChatData = () => {
      chatUser.value = null;
      chatUserId.value = null;
      chatUnread.value = false;
      chatLastSeenAt.value = '';
    };

    return {
      chatUser,
      chatUserId,
      chatUnread,
      chatLastSeenAt,
      setCachedChatUser,
      getCachedChatUserId,
      setChatUnread,
      markChatSeen,
      clearChatData,
    };
  },
  {
    persist: {
      key: CHAT_STATE_STORAGE_KEY,
      storage: localStorage,
      pick: ['chatUser', 'chatUserId', 'chatLastSeenAt'],
    },
  },
);

export const useChatStore = () => {
  const store = useChatStateStore();
  return {
    ...storeToRefs(store),
    setCachedChatUser: store.setCachedChatUser,
    getCachedChatUserId: store.getCachedChatUserId,
    setChatUnread: store.setChatUnread,
    markChatSeen: store.markChatSeen,
    clearChatData: store.clearChatData,
  };
};
