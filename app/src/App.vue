<template>
  <div class="app">
    <!-- astro-air 磨砂噪点颗粒背景层 -->
    <div class="app-noise-bg" aria-hidden="true"></div>
    <div
      v-if="isBannerVisible"
      ref="bannerContainerRef"
      class="fixed top-[44px] left-0 right-0 z-[999] w-full pointer-events-auto"
    >
      <div class="max-w-[600px] mx-auto px-3 pt-1">
        <Alert
          :status="alertStatus"
          class="shadow-md rounded-xl border border-[var(--border)]"
        >
          <AlertIndicator />
          <AlertContent class="flex-1 min-w-0">
            <AlertDescription class="truncate text-xs font-medium">{{ currentNotice?.content }}</AlertDescription>
          </AlertContent>
          <CloseButton @click="dismissNotice" />
        </Alert>
      </div>
    </div>
    <div class="app-content h-full w-full max-w-[600px] mx-auto overflow-hidden">
      <router-view v-slot="{ Component }">
        <keep-alive include="RootPage">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
    <Message ref="messageRef" />
    <SettingsModal />
  </div>
</template>

<script setup>
import { ref, computed, provide, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Alert, AlertIndicator, AlertContent, AlertDescription, CloseButton } from 'heroui-vue';
import { Message } from '@/components/ui';
import SettingsModal from '@/components/SettingsModal.vue';
import { showMessage, setMessageHandler } from '@/composables/useMessage';
import { currentNotice, dismissNotice, startNotificationWatcher } from '@/composables/useNotification';

const router = useRouter();
const route = useRoute();
const bannerContainerRef = ref(null);
const messageRef = ref(null);

const isBannerVisible = computed(() => Boolean(currentNotice.value) && route.name !== 'map-drawer');

const alertStatus = computed(() => {
  const t = currentNotice.value?.type;
  if (t === 'error' || t === 'danger') return 'danger';
  if (t === 'warning') return 'warning';
  if (t === 'success') return 'success';
  return 'accent';
});

provide('showMessage', showMessage);

const setBannerHeight = (h) => {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--notice-banner-height', `${Math.max(0, Math.round(h))}px`);
  }
};

const updateBannerHeight = () => {
  nextTick(() => {
    if (isBannerVisible.value && bannerContainerRef.value) {
      setBannerHeight(bannerContainerRef.value.offsetHeight);
    } else {
      setBannerHeight(0);
    }
  });
};

watch(isBannerVisible, () => {
  updateBannerHeight();
});

const setViewportHeightVar = () => {
  const height = window.innerHeight || document.documentElement?.clientHeight || 0;
  document.documentElement.style.setProperty('--app-vh', `${Math.max(0, Math.round(height))}px`);
};

let stopNotificationWatcher = null;

onMounted(() => {
  setMessageHandler((message, type, options) => {
    messageRef.value?.show(message, type, options);
  });

  stopNotificationWatcher = startNotificationWatcher(router);
  setViewportHeightVar();
  window.addEventListener('resize', setViewportHeightVar);
  window.addEventListener('orientationchange', setViewportHeightVar);
});

onUnmounted(() => {
  stopNotificationWatcher?.();
  setBannerHeight(0);
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
