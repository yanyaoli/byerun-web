<template>
  <transition
    enter-active-class="animate-in fade-in slide-in-from-top-2 duration-300"
    leave-active-class="animate-out fade-out slide-out-to-top-2 duration-200"
  >
    <div v-if="visible" class="fixed left-1/2 -translate-x-1/2 top-4 z-[99999] pointer-events-auto">
      <div :class="messageClasses[messageType]">
        {{ content }}
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  duration: {
    type: Number,
    default: 2000,
  },
});

const visible = ref(false);
const content = ref("");
const messageType = ref("info");

const messageClasses = {
  success: "inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium leading-relaxed backdrop-blur text-gray-50 bg-green-800 shadow-2xl whitespace-nowrap z-[99999]",
  error: "inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium leading-relaxed backdrop-blur text-gray-50 bg-red-800 shadow-2xl whitespace-nowrap z-[99999]",
  warning: "inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium leading-relaxed backdrop-blur text-gray-50 bg-yellow-800 shadow-2xl whitespace-nowrap z-[99999]",
  info: "inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium leading-relaxed backdrop-blur text-gray-50 bg-blue-800 shadow-2xl whitespace-nowrap z-[99999]",
};

const show = (message, type = "info") => {
  content.value = message;
  messageType.value = type;
  visible.value = true;
  setTimeout(() => {
    visible.value = false;
  }, props.duration);
};

defineExpose({
  show,
});
</script>


