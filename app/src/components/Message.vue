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
      class="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none px-4"
    >
      <div
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-xl pointer-events-auto',
          'shadow-lg backdrop-blur-xl border',
          'min-w-[280px] max-w-md w-auto',
          'transition-all duration-200',
          styles[messageType].container,
        ]"
      >
        <!-- Icon with background -->
        <div
          :class="[
            'flex items-center justify-center w-5 h-5 rounded-full shrink-0',
            styles[messageType].iconBg
          ]"
        >
          <i :class="['text-sm', styles[messageType].icon]"></i>
        </div>

        <!-- Content -->
        <span
          :class="[
            'text-sm font-medium leading-relaxed flex-1',
            styles[messageType].text
          ]"
        >
          {{ content }}
        </span>
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
    container: 'bg-emerald-50/95 border-emerald-200/50',
    iconBg: 'bg-emerald-500/10',
    icon: 'ri-checkbox-circle-fill text-emerald-600',
    text: 'text-emerald-900',
  },
  error: {
    container: 'bg-rose-50/95 border-rose-200/50',
    iconBg: 'bg-rose-500/10',
    icon: 'ri-error-warning-fill text-rose-600',
    text: 'text-rose-900',
  },
  info: {
    container: 'bg-blue-50/95 border-blue-200/50',
    iconBg: 'bg-blue-500/10',
    icon: 'ri-information-fill text-blue-600',
    text: 'text-blue-900',
  },
  warning: {
    container: 'bg-amber-50/95 border-amber-200/50',
    iconBg: 'bg-amber-500/10',
    icon: 'ri-alert-fill text-amber-600',
    text: 'text-amber-900',
  },
};

let timer = null;

const show = (message, type = 'info') => {
  content.value = message;
  messageType.value = type;
  visible.value = true;

  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    visible.value = false;
  }, props.duration);
};

defineExpose({ show });
</script>
