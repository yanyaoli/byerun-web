<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-[-8px] scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-[-8px] scale-95"
  >
    <div
      v-if="visible"
      class="fixed top-1 left-0 right-0 z-[10000] flex justify-center pointer-events-none transition-all duration-300"
    >
      <div
        :class="[
          'flex items-center min-h-9 py-1.5 max-w-[360px] w-[calc(100%_-_24px)] px-3 gap-2 rounded-full border shadow-lg pointer-events-auto transition-all duration-300 overflow-hidden backdrop-blur-2xl',
          styles[messageType].container,
        ]"
      >
        <!-- Icon -->
        <i :class="['text-[14px] shrink-0', styles[messageType].icon]"></i>

        <!-- Content -->
        <span :class="['flex-1 min-w-0 text-[13px] leading-5 font-medium whitespace-normal break-words text-left', styles[messageType].text]">
          {{ content }}
        </span>

        <!-- Close Button -->
        <button
          type="button"
          @click="close"
          class="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full transition-colors opacity-75 hover:opacity-100 cursor-pointer border-none bg-transparent"
          :class="styles[messageType].closeBtn"
          title="关闭"
        >
          <i class="ri-close-line text-[14px]"></i>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  duration: { type: Number, default: 3000 },
});

const visible = ref(false);
const content = ref('');
const messageType = ref('info');

const styles = {
  success: {
    container: 'bg-emerald-600/90 border-emerald-500/80 text-white shadow-emerald-950/20',
    icon: 'ri-checkbox-circle-fill text-white',
    text: 'text-white',
    closeBtn: 'text-white/80 hover:bg-white/20',
  },
  error: {
    container: 'bg-rose-600/90 border-rose-500/80 text-white shadow-rose-950/20',
    icon: 'ri-error-warning-fill text-white',
    text: 'text-white',
    closeBtn: 'text-white/80 hover:bg-white/20',
  },
  info: {
    container: 'bg-blue-600/90 border-blue-500/80 text-white shadow-blue-950/20',
    icon: 'ri-information-fill text-white',
    text: 'text-white',
    closeBtn: 'text-white/80 hover:bg-white/20',
  },
  warning: {
    container: 'bg-amber-600/90 border-amber-500/80 text-white shadow-amber-950/20',
    icon: 'ri-alert-fill text-white',
    text: 'text-white',
    closeBtn: 'text-white/80 hover:bg-white/20',
  },
};

let timer = null;
let current = null;
// 常驻消息（duration<=0，如服务端通知）：覆盖它的临时 toast 结束后自动恢复
let pinned = null;

const clearTimer = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};

const render = (item) => {
  current = item;
  content.value = item.content;
  messageType.value = item.type;
  visible.value = true;
  clearTimer();
  if (item.duration > 0) {
    timer = setTimeout(autoHide, item.duration);
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

const close = () => {
  clearTimer();
  const item = current;
  if (item === pinned) pinned = null;
  visible.value = false;
  current = null;
  item?.onClose?.();
};

const show = (message, type = 'info', options = {}) => {
  // error 级别默认不自动隐藏，需用户手动关闭
  const duration = options.duration ?? (type === 'error' ? 0 : props.duration);
  const item = {
    content: message,
    type,
    duration: duration > 0 ? duration : 0,
    onClose: options.onClose,
  };
  if (item.duration === 0) pinned = item;
  render(item);
};

defineExpose({ show, close });
</script>
