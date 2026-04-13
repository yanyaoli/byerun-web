<template>
  <div :class="['app relative overflow-hidden', isDark ? 'bg-[#050505]' : 'bg-[#f5f5f7]']">
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <template v-if="isDark">
        <div
          class="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-white/[0.03] rounded-full blur-[120px]"
        ></div>
        <div
          class="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/[0.05] rounded-full blur-[100px]"
        ></div>
      </template>
      <template v-else>
        <div
          class="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-blue-100/60 rounded-full blur-[100px]"
        ></div>
        <div
          class="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-purple-100/60 rounded-full blur-[100px]"
        ></div>
      </template>
    </div>
    <div class="app-content h-full w-full max-w-[600px] mx-auto overflow-hidden relative z-10">
      <router-view />
    </div>
    <Message ref="messageRef" />
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted, computed } from 'vue';
import Message from './components/Message.vue';
import { useThemeStore } from './composables/useTheme';

const themeStore = useThemeStore();

const messageRef = ref(null);

const showMessage = (message, type = 'info') => {
  messageRef.value?.show(message, type);
};

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

const isDark = computed(() => themeStore.isDark);
</script>

<style scoped>
.app {
  height: var(--app-vh, 100dvh);
  min-height: var(--app-vh, 100dvh);
  max-height: var(--app-vh, 100dvh);
  width: 100%;
  margin: 0 auto;
}

.app-content {
  height: 100%;
  min-height: 0;
}
</style>
