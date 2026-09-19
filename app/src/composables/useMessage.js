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
      const { message, type, options } = pendingMessages.shift();
      try {
        messageHandler(message, type, options);
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
 * @param {Object} [options] { duration: 展示毫秒数(0=常驻), onClose: 手动关闭回调 }
 */
export const showMessage = (message, type = 'info', options = {}) => {
  if (typeof messageHandler === 'function') {
    messageHandler(message, type, options);
  } else {
    pendingMessages.push({ message, type, options });
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
