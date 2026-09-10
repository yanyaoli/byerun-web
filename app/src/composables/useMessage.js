import { ref } from 'vue';

let messageHandler = null;
const pendingMessages = [];

/**
 * 设置全局 Message 处理句柄
 * @param {Function} handler
 */
export const setMessageHandler = (handler) => {
  messageHandler = handler;
  if (messageHandler && pendingMessages.length > 0) {
    while (pendingMessages.length > 0) {
      const { message, type } = pendingMessages.shift();
      try {
        messageHandler(message, type);
      } catch (err) {
        console.error('Failed to dispatch pending message:', err);
      }
    }
  }
};

/**
 * 全局统一 showMessage 方法
 * @param {string} message 消息内容
 * @param {string} type 消息类型 ('info' | 'success' | 'warning' | 'error')
 */
export const showMessage = (message, type = 'info') => {
  if (typeof messageHandler === 'function') {
    messageHandler(message, type);
  } else {
    pendingMessages.push({ message, type });
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
};

/**
 * useMessage Composable
 */
export const useMessage = () => {
  return {
    showMessage,
    setMessageHandler,
  };
};

if (typeof window !== 'undefined') {
  window.showMessage = showMessage;
}
