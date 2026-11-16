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
      class="fixed top-1.5 left-0 right-0 z-[10002] flex justify-center pointer-events-none transition-all duration-300"
    >
      <div
        :class="[
          'flex items-center min-h-9 h-9 max-w-[360px] w-[calc(100%_-_48px)] px-3.5 gap-2 rounded-full border shadow-lg pointer-events-auto transition-all duration-300 overflow-hidden backdrop-blur-2xl',
          themeClasses.container,
        ]"
      >
        <!-- Indicator Icon -->
        <i :class="['text-[15px] shrink-0', themeClasses.icon]"></i>

        <!-- Message Content -->
        <span
          :class="[
            'flex-1 min-w-0 text-[12.5px] leading-tight font-medium truncate text-left',
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
          <i class="ri-close-line text-[14px]"></i>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  duration?: number;
  onClose?: () => void;
}

interface ToastItem {
  content: string;
  type: ToastType;
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
const toastType = ref<ToastType>('info');

const themes: Record<ToastType, { container: string; icon: string; text: string; closeBtn: string }> = {
  success: {
    container: 'bg-emerald-600/95 border-emerald-500/80 text-white shadow-emerald-950/20',
    icon: 'ri-checkbox-circle-fill text-white',
    text: 'text-white',
    closeBtn: 'text-white/80 hover:bg-white/20',
  },
  error: {
    container: 'bg-rose-600/95 border-rose-500/80 text-white shadow-rose-950/20',
    icon: 'ri-error-warning-fill text-white',
    text: 'text-white',
    closeBtn: 'text-white/80 hover:bg-white/20',
  },
  info: {
    container: 'bg-blue-600/95 border-blue-500/80 text-white shadow-blue-950/20',
    icon: 'ri-information-fill text-white',
    text: 'text-white',
    closeBtn: 'text-white/80 hover:bg-white/20',
  },
  warning: {
    container: 'bg-amber-600/95 border-amber-500/80 text-white shadow-amber-950/20',
    icon: 'ri-alert-fill text-white',
    text: 'text-white',
    closeBtn: 'text-white/80 hover:bg-white/20',
  },
};

const themeClasses = computed(() => {
  return themes[toastType.value] || themes.info;
});

let timer: ReturnType<typeof setTimeout> | null = null;
let current: ToastItem | null = null;
let pinned: ToastItem | null = null;

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

const render = (item: ToastItem) => {
  current = item;
  content.value = item.content;
  toastType.value = item.type;
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

const show = (message: string, type: ToastType = 'info', options: ToastOptions = {}) => {
  // error 级别默认不自动隐藏，需用户手动关闭
  const duration = options.duration ?? (type === 'error' ? 0 : props.duration);
  const item: ToastItem = {
    content: message,
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
