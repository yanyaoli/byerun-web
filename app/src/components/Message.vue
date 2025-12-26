<template>
  <transition
    enter-active-class="transition duration-250 ease-out"
    enter-from-class="translate-y-[-8px] opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-[-8px] opacity-0"
  >
    <div v-if="visible" class="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 pointer-events-none">
      <div :class="['min-w-[200px] max-w-[360px] px-4 py-3 rounded-xl text-sm font-bold shadow-[0_8px_24px_rgba(0,0,0,0.45)] pointer-events-auto', messageClasses[messageType]]">
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
    default: 3000,
  },
});

const visible = ref(false);
const content = ref("");
const messageType = ref("info");

const messageClasses = {
  success: "bg-[#E6F9EC] text-[#06381e]",
  error: "bg-[#FFE9E9] text-[#6B0217]",
  info: "bg-[#E6F3FF] text-[#083358]",
  warning: "bg-[#FFF8E1] text-[#6B4500]",
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


