<template>
  <transition
    enter-active-class="transition-all duration-300 cubic-bezier(0.22, 1, 0.36, 1)"
    enter-from-class="opacity-0 -translate-y-2 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 -translate-y-2 scale-95"
  >
    <div
      v-if="visible"
      class="fixed top-2 left-0 right-0 z-[10002] flex justify-center pointer-events-none transition-all duration-300"
    >
      <div
        :class="[
          'flex items-center min-h-10 max-w-[380px] w-[calc(100%_-_32px)] px-3.5 py-2 gap-2.5 rounded-full border shadow-xl pointer-events-auto transition-all duration-300 overflow-hidden',
          themeClasses.container,
        ]"
      >
        <!-- Status Icon -->
        <i :class="['text-[17px] shrink-0', themeClasses.icon]"></i>

        <!-- Message Content -->
        <span
          :class="[
            'flex-1 min-w-0 text-[13px] leading-tight font-medium text-left select-text',
            themeClasses.text,
          ]"
        >
          {{ content }}
        </span>

        <!-- Close Button -->
        <button
          type="button"
          @click="close"
          class="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full transition-colors opacity-75 hover:opacity-100 cursor-pointer border-none bg-transparent"
          :class="themeClasses.closeBtn"
          title="关闭通知"
        >
          <i class="ri-close-line text-[15px]"></i>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

export type MessageType = 'info' | 'success' | 'warning' | 'error';

export interface MessageOptions {
  duration?: number;
  onClose?: () => void;
}

interface MessageItem {
  content: string;
  type: MessageType;
  duration: number;
  onClose?: () => void;
}

const props = withDefaults(
  defineProps<{
    duration?: number;
  }>(),
  {
    duration: 3000,
  },
);

const visible = ref(false);
const content = ref('');
const messageType = ref<MessageType>('info');

const themes: Record<MessageType, { container: string; icon: string; text: string; closeBtn: string }> = {
  success: {
    container: 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-950/30',
    icon: 'ri-checkbox-circle-fill text-white',
    text: 'text-white',
    closeBtn: 'text-white/80 hover:bg-white/20',
  },
  error: {
    container: 'bg-rose-600 border-rose-500 text-white shadow-rose-950/30',
    icon: 'ri-error-warning-fill text-white',
    text: 'text-white',
    closeBtn: 'text-white/80 hover:bg-white/20',
  },
  info: {
    container: 'bg-blue-600 border-blue-500 text-white shadow-blue-950/30',
    icon: 'ri-information-fill text-white',
    text: 'text-white',
    closeBtn: 'text-white/80 hover:bg-white/20',
  },
  warning: {
    container: 'bg-amber-600 border-amber-500 text-white shadow-amber-950/30',
    icon: 'ri-alert-fill text-white',
    text: 'text-white',
    closeBtn: 'text-white/80 hover:bg-white/20',
  },
};

const themeClasses = computed(() => {
  return themes[messageType.value] || themes.info;
});

let timer: ReturnType<typeof setTimeout> | null = null;
let current: MessageItem | null = null;
let pinned: MessageItem | null = null;

const clearTimer = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};

const autoHide = () => {
  clearTimer();
  if (pinned && current !== pinned) {
    render(pinned);
    return;
  }
  visible.value = false;
  current = null;
};

const render = (item: MessageItem) => {
  current = item;
  content.value = item.content;
  messageType.value = item.type;
  visible.value = true;
  clearTimer();
  if (item.duration > 0) {
    timer = setTimeout(autoHide, item.duration);
  }
};

const close = () => {
  clearTimer();
  const item = current;
  if (item === pinned) pinned = null;
  visible.value = false;
  current = null;
  item?.onClose?.();
};

const resolveContent = (val: any, type: MessageType): string => {
  if (typeof val === 'string' && val.trim()) return val;
  if (!val) {
    if (type === 'success') return '操作成功';
    if (type === 'error') return '操作失败';
    if (type === 'warning') return '请注意';
    return '提示';
  }
  if (typeof val.message === 'string' && val.message.trim()) return val.message;
  if (typeof val.msg === 'string' && val.msg.trim()) return val.msg;
  if (typeof val.resultDesc === 'string' && val.resultDesc.trim()) return val.resultDesc;
  if (typeof val.error === 'string' && val.error.trim()) return val.error;
  if (typeof val.reason === 'string' && val.reason.trim()) return val.reason;
  try {
    const s = JSON.stringify(val);
    return s === '{}' ? (type === 'success' ? '操作成功' : '操作完成') : s;
  } catch {
    return String(val);
  }
};

const show = (msg: any, type: MessageType = 'info', options: MessageOptions = {}) => {
  const text = resolveContent(msg, type);
  const duration = options.duration ?? (type === 'error' ? 0 : props.duration);
  const item: MessageItem = {
    content: text,
    type,
    duration: duration > 0 ? duration : 0,
    onClose: options.onClose,
  };
  if (item.duration === 0) pinned = item;
  render(item);
};

defineExpose({
  show,
  close,
});
</script>
