<template>
  <transition
    enter-active-class="transition-all duration-400 ease-out"
    enter-from-class="opacity-0 translate-y-[-16px] scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-[-8px] scale-98"
  >
    <div
      v-if="visible"
      class="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] pointer-events-none px-4"
    >
      <div
        :class="[
          'flex items-center gap-3 px-4 py-1 rounded-full pointer-events-auto',
          'shadow-lg backdrop-blur-md border',
          'min-w-[280px] max-w-md w-auto',
          'transition-all duration-500',
          styles[messageType].container,
        ]"
      >
        <!-- Icon with background -->
        <div
          :class="[
            'flex items-center justify-center w-5 h-5 rounded-full shrink-0',
            styles[messageType].iconBg,
          ]"
        >
          <i :class="['text-sm', styles[messageType].icon]"></i>
        </div>

        <!-- Content -->
        <span :class="['text-sm font-medium leading-relaxed flex-1', styles[messageType].text]">
          {{ content }}
        </span>

        <!-- Close Button -->
        <button
          type="button"
          @click="close"
          class="shrink-0 flex items-center justify-center w-5 h-5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
          title="关闭"
        >
          <i class="ri-close-line text-base"></i>
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
    container: 'bg-emerald-600 border-emerald-500',
    iconBg: 'message-icon-bg',
    icon: 'ri-checkbox-circle-fill text-white',
    text: 'text-white',
  },
  error: {
    container: 'bg-rose-600 border-rose-500',
    iconBg: 'message-icon-bg',
    icon: 'ri-error-warning-fill text-white',
    text: 'text-white',
  },
  info: {
    container: 'bg-blue-600 border-blue-500',
    iconBg: 'message-icon-bg',
    icon: 'ri-information-fill text-white',
    text: 'text-white',
  },
  warning: {
    container: 'bg-amber-600 border-amber-500',
    iconBg: 'message-icon-bg',
    icon: 'ri-alert-fill text-white',
    text: 'text-white',
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

<style scoped>
.message-icon-bg {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
