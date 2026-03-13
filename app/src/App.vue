<template>
  <div class="app flex flex-col relative overflow-hidden bg-stone-950">
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
}

.app-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0 auto;
  max-width: 480px;
  overflow: hidden;
}
</style>
