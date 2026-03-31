<template>
  <div class="app flex flex-col relative overflow-hidden bg-black/90">
    <div class="app-container">
      <router-view />
    </div>
    <Message ref="messageRef" />
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted } from 'vue';
import Message from './components/Message.vue';

const messageRef = ref(null);

// 全局消息方法
const showMessage = (message, type = 'info') => {
  messageRef.value?.show(message, type);
};

// 提供给子组件使用
provide('showMessage', showMessage);

const setViewportHeightVar = () => {
  const height = window.innerHeight || document.documentElement?.clientHeight || 0;
  document.documentElement.style.setProperty('--app-vh', `${Math.max(0, Math.round(height))}px`);
};

onMounted(() => {
  setViewportHeightVar();
  window.addEventListener('resize', setViewportHeightVar);
  window.addEventListener('orientationchange', setViewportHeightVar);
});

onUnmounted(() => {
  window.removeEventListener('resize', setViewportHeightVar);
  window.removeEventListener('orientationchange', setViewportHeightVar);
});
</script>

<style scoped>
.app {
  height: var(--app-vh, 100dvh);
  min-height: var(--app-vh, 100dvh);
  max-height: var(--app-vh, 100dvh);
  width: 100vw;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image:
    linear-gradient(rgba(120, 132, 152, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(120, 132, 152, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: 0 0;
}

.app-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0 auto;
  max-width: 600px;
  overflow: hidden;
}
</style>
