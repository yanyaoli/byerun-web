<template>
  <transition name="message-fade">
    <div v-if="visible" :class="['message', type]">
      {{ content }}
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Props {
  duration?: number;
  type?: "success" | "error" | "info" | "warning";
}

const props = withDefaults(defineProps<Props>(), {
  duration: 3000,
  type: "info",
});

const visible = ref(false);
const content = ref("");

// 显示消息
const show = (message: string) => {
  content.value = message;
  visible.value = true;
  setTimeout(() => {
    visible.value = false;
  }, props.duration);
};

// 暴露方法给外部使用
defineExpose({
  show,
});
</script>

<script lang="ts">
export default {
  name: "Message",
};
</script>

<style scoped>
.message {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0) + 70px);
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  max-width: 80vw;
  min-width: 200px;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 10000;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  color: #fff;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08);
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: auto;
}

.message.success {
  background-color: #52c41a;
}

.message.error {
  background-color: #ff4d4f;
}

.message.warning {
  background-color: #faad14;
}

.message.info {
  background-color: #1890ff;
}

.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
</style>
