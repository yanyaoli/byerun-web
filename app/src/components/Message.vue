<template>
  <transition name="message-fade">
    <div v-if="visible" :class="['message', type]">
      <div class="message-content">
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
  type: {
    type: String,
    default: "info",
  },
});

const visible = ref(false);
const content = ref("");

// 显示消息
const show = (message) => {
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

<style scoped>
.message {
  position: fixed;
  left: 50%;
  top: 12px;
  transform: translateX(-50%);
  width: auto;
  min-width: 120px;
  max-width: 200px;
  height: 32px;
  z-index: 10001; /* 确保在 header 之上 */
  pointer-events: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  padding: 0 16px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.2px;
}

/* 根据类型设置不同的文字颜色 */
.message.success .message-content {
  color: #10b981;
}

.message.error .message-content {
  color: #ef4444;
}

.message.warning .message-content {
  color: #f59e0b;
}

.message.info .message-content {
  color: #3b82f6;
}

/* 移动端适配 */
@media (max-width: 375px) {
  .message {
    top: 10px;
    min-width: 100px;
    max-width: 160px;
  }

  .message-content {
    padding: 0 12px;
    font-size: 14px;
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .message-content {
    background: rgba(30, 30, 32, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
}

/* 安全区域适配 */
@supports (padding-top: env(safe-area-inset-top)) {
  .message {
    top: calc(12px + env(safe-area-inset-top));
  }
}

/* 过渡动画 */
.message-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

.message-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.message-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .message,
  .message-fade-enter-active,
  .message-fade-leave-active {
    transition: opacity 0.3s ease;
  }
}
</style>