export type MessageType = 'info' | 'success' | 'warning' | 'error';

export interface MessageOptions {
  duration?: number;
  onClose?: () => void;
}

export type MessageHandler = (message: string, type: MessageType, options?: MessageOptions) => void;

interface PendingMessage {
  message: string;
  type: MessageType;
  options?: MessageOptions;
}

let messageHandler: MessageHandler | null = null;
const pendingMessages: PendingMessage[] = [];

/**
 * 设置全局 Message 处理句柄
 */
export const setMessageHandler = (handler: MessageHandler): void => {
  messageHandler = handler;
  if (messageHandler && pendingMessages.length > 0) {
    while (pendingMessages.length > 0) {
      const item = pendingMessages.shift();
      if (item) {
        try {
          messageHandler(item.message, item.type, item.options);
        } catch (err) {
          console.error('Failed to dispatch pending message:', err);
        }
      }
    }
  }
};

/**
 * 全局统一 showMessage 方法
 */
export const showMessage = (message: string, type: MessageType = 'info', options: MessageOptions = {}): void => {
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
  (window as any).showMessage = showMessage;
}
