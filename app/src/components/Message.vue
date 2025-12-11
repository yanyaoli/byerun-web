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
  success: "message-box message-success",
  error: "message-box message-error",
  warning: "message-box message-warning",
  info: "message-box message-info",
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

<style scoped>
.message-box {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: 25px;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.4;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  z-index: 1000;
}

.message-box::before {
  flex-shrink: 0;
  font-weight: 600;
  font-size: 1rem;
  margin-right: 0.25rem;
}

.message-success {
  color: #166534;
}

.message-success::before {
  content: "✓";
  color: #22c55e;
}

.message-error {
  color: #991b1b;
}

.message-error::before {
  content: "✕";
  color: #ef4444;
}

.message-warning {
  color: #92400e;
}

.message-warning::before {
  content: "⚠";
  color: #eab308;
}

.message-info {
  color: #1e40af;
}

.message-info::before {
  content: "ℹ";
  color: #3b82f6;
}
</style>
