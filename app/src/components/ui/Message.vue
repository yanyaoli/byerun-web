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
          'flex items-center h-9 max-w-[360px] w-[calc(100%_-_24px)] px-3 gap-2 rounded-full border shadow-lg pointer-events-auto transition-all duration-300 overflow-hidden backdrop-blur-2xl',
          styles[messageType].container,
        ]"
      >
        <!-- Icon -->
        <i :class="['text-[14px] shrink-0', styles[messageType].icon]"></i>

        <!-- Content -->
        <span :class="['flex-1 text-[13px] leading-5 truncate font-medium', styles[messageType].text]">
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

const close = () => {
  visible.value = false;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};

const show = (message, type = 'info') => {
  content.value = message;
  messageType.value = type;
  visible.value = true;

  if (timer) clearTimeout(timer);
  timer = null;

  // error 级别的消息不自动隐藏，需要用户手动关闭
  if (type !== 'error') {
    timer = setTimeout(() => {
      visible.value = false;
    }, props.duration);
  }
};

defineExpose({ show, close });
</script>
