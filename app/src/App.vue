<template>
  <div class="app">
    <div class="app-bg">
      <div
        v-for="i in 5"
        :key="i"
        class="app-blob"
        :class="'app-blob-' + i"
        :style="{ background: 'var(--blob-' + i + ')' }"
      ></div>
    </div>
    <div class="app-content h-full w-full max-w-[600px] mx-auto overflow-hidden">
      <router-view />
    </div>
    <Message ref="messageRef" />
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted } from 'vue';
import Message from './components/Message.vue';
import { showMessage, setMessageHandler } from '@/composables/useMessage';

const messageRef = ref(null);

provide('showMessage', showMessage);

const setViewportHeightVar = () => {
  const height = window.innerHeight || document.documentElement?.clientHeight || 0;
  document.documentElement.style.setProperty('--app-vh', `${Math.max(0, Math.round(height))}px`);
};

onMounted(() => {
  if (messageRef.value) {
    setMessageHandler((message, type) => {
      messageRef.value?.show(message, type);
    });
  }
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
  width: 100%;
  margin: 0 auto;
  position: relative;
  background: var(--bg-primary);
  transition: background var(--theme-transition-duration) var(--theme-transition-easing);
}

.app-content {
  height: 100%;
  min-height: 0;
  position: relative;
  z-index: 1;
}

.app-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.app-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: var(--blob-opacity);
  will-change: transform;
}

.app-blob-1 {
  width: 480px;
  height: 480px;
  top: -140px;
  left: -120px;
  animation: drift-1 13s ease-in-out -3s infinite alternate;
}

.app-blob-2 {
  width: 400px;
  height: 400px;
  top: 10%;
  right: -160px;
  animation: drift-2 10s ease-in -7s infinite alternate;
}

.app-blob-3 {
  width: 450px;
  height: 450px;
  bottom: 5%;
  left: -140px;
  animation: drift-3 17s ease-out -11s infinite alternate;
}

.app-blob-4 {
  width: 360px;
  height: 360px;
  top: 35%;
  right: -100px;
  animation: drift-4 11s ease-in-out -5s infinite alternate;
}

.app-blob-5 {
  width: 420px;
  height: 420px;
  bottom: -120px;
  right: -80px;
  animation: drift-5 15s ease-in -9s infinite alternate;
}

@keyframes drift-1 {
  0% { transform: translate(0, 0) scale(1); }
  20% { transform: translate(80px, -100px) scale(1.15); }
  40% { transform: translate(150px, 50px) scale(0.85); }
  60% { transform: translate(40px, 120px) scale(1.1); }
  80% { transform: translate(110px, -30px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
}

@keyframes drift-2 {
  0% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(-100px, 80px) scale(0.85); }
  50% { transform: translate(-50px, -100px) scale(1.2); }
  75% { transform: translate(-120px, 30px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
}

@keyframes drift-3 {
  0% { transform: translate(0, 0) scale(1); }
  15% { transform: translate(80px, 50px) scale(0.9); }
  30% { transform: translate(130px, -70px) scale(1.15); }
  45% { transform: translate(40px, -110px) scale(0.85); }
  60% { transform: translate(100px, 40px) scale(1.08); }
  75% { transform: translate(150px, -40px) scale(0.88); }
  100% { transform: translate(0, 0) scale(1); }
}

@keyframes drift-4 {
  0% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(-70px, -80px) scale(1.15); }
  50% { transform: translate(40px, 70px) scale(0.85); }
  75% { transform: translate(-90px, 30px) scale(1.1); }
  100% { transform: translate(0, 0) scale(1); }
}

@keyframes drift-5 {
  0% { transform: translate(0, 0) scale(1); }
  20% { transform: translate(-80px, 100px) scale(1.12); }
  40% { transform: translate(30px, -60px) scale(0.88); }
  60% { transform: translate(-100px, -40px) scale(1.15); }
  80% { transform: translate(-40px, 80px) scale(0.85); }
  100% { transform: translate(0, 0) scale(1); }
}
</style>
