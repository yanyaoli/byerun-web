<template>
  <div class="app flex flex-col relative overflow-hidden bg-stone-950">
    <div class="app-container">
      <router-view />
    </div>
    <Message ref="messageRef" />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue';
import Message from './components/Message.vue';

const messageRef = ref(null);

// 全局消息方法
const showMessage = (message, type = 'info') => {
  messageRef.value?.show(message, type);
};

// 提供给子组件使用
provide('showMessage', showMessage);

const normalizePx = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.round(parsed));
};

const applyBottomOverlay = ({ height = 0, gap = 0 } = {}) => {
  document.documentElement.style.setProperty('--bottom-overlay-height', `${normalizePx(height)}px`);
  document.documentElement.style.setProperty('--bottom-overlay-gap', `${normalizePx(gap)}px`);
};

const setBottomOverlay = (options = 0) => {
  if (typeof options === 'number') {
    applyBottomOverlay({ height: options, gap: 0 });
    return;
  }

  if (!options || typeof options !== 'object') {
    applyBottomOverlay({ height: 0, gap: 0 });
    return;
  }

  applyBottomOverlay({
    height: options.height ?? 0,
    gap: options.gap ?? 0,
  });
};

const setBottomOverlayHeight = (height = 0) => {
  setBottomOverlay({ height, gap: 0 });
};

provide('setBottomOverlay', setBottomOverlay);
provide('setBottomOverlayHeight', setBottomOverlayHeight);

const setViewportHeightVar = () => {
  const height = window.innerHeight || document.documentElement?.clientHeight || 0;
  document.documentElement.style.setProperty('--app-vh', `${Math.max(0, Math.round(height))}px`);
};

onMounted(() => {
  setViewportHeightVar();
  setBottomOverlay(0);
  window.addEventListener('resize', setViewportHeightVar);
  window.addEventListener('orientationchange', setViewportHeightVar);
});

onUnmounted(() => {
  setBottomOverlay(0);
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
