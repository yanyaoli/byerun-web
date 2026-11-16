<template>
  <div class="app">
    <!-- astro-air 磨砂噪点颗粒背景层 -->
    <div class="app-noise-bg" aria-hidden="true"></div>
    <Banner
      :show="isBannerVisible"
      :type="currentNotice?.type || 'info'"
      :content="currentNotice?.content"
      @close="dismissNotice"
    />
    <div class="app-content h-full w-full max-w-[600px] mx-auto overflow-hidden">
      <router-view v-slot="{ Component }">
        <keep-alive include="RootPage">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, provide, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Banner, Toast } from '@/components/ui';
import { showMessage, setMessageHandler } from '@/composables/useMessage';
import { currentNotice, dismissNotice, startNotificationWatcher } from '@/composables/useNotification';

const router = useRouter();
const route = useRoute();
const toastRef = ref(null);

const isBannerVisible = computed(() => Boolean(currentNotice.value) && route.name !== 'map-drawer');

provide('showMessage', showMessage);

const setViewportHeightVar = () => {
  const height = window.innerHeight || document.documentElement?.clientHeight || 0;
  document.documentElement.style.setProperty('--app-vh', `${Math.max(0, Math.round(height))}px`);
};

let stopNotificationWatcher = null;

onMounted(() => {
  if (toastRef.value) {
    setMessageHandler((message, type, options) => {
      toastRef.value?.show(message, type, options);
    });
  }
  stopNotificationWatcher = startNotificationWatcher(router);
  setViewportHeightVar();
  window.addEventListener('resize', setViewportHeightVar);
  window.addEventListener('orientationchange', setViewportHeightVar);
});

onUnmounted(() => {
  stopNotificationWatcher?.();
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
  background-color: var(--canvas);
  transition: background-color var(--theme-transition-duration) var(--theme-transition-easing);
}

.app-noise-bg {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  background-image: url('/noise.png');
  background-size: 128px 128px;
  background-repeat: repeat;
  opacity: var(--noise-opacity, 0.06);
}

.app-content {
  height: 100%;
  min-height: 0;
  position: relative;
  z-index: 1;
}
</style>
