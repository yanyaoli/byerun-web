<template>
  <div class="app">
    <!-- astro-air 磨砂噪点颗粒背景层 -->
    <div class="app-noise-bg" aria-hidden="true"></div>
    <div
      v-if="isBannerVisible"
      ref="bannerContainerRef"
      class="fixed left-0 right-0 z-[999] w-full pointer-events-auto"
      :style="{ top: 'calc(var(--sat, env(safe-area-inset-top, 0px)) + 44px)' }"
    >
      <div class="max-w-[600px] mx-auto px-3 pt-1">
        <Alert
          :status="alertStatus"
          class="shadow-md rounded-xl border border-[var(--border)] items-start"
        >
          <AlertIndicator class="mt-0.5 shrink-0" />
          <AlertContent class="flex-1 min-w-0 py-0.5">
            <AlertDescription class="text-xs font-medium leading-relaxed break-words whitespace-pre-line select-text block">
              {{ currentNotice?.content }}
            </AlertDescription>
          </AlertContent>
          <CloseButton class="shrink-0 cursor-pointer" @click="dismissNotice" />
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
  </div>
</template>

<script setup>
import { ref, computed, provide, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Alert, AlertIndicator, AlertContent, AlertDescription, CloseButton } from 'heroui-vue';
import { Message } from '@/components/ui';
import { showMessage, setMessageHandler } from '@/composables/useMessage';
import { currentNotice, dismissNotice, startNotificationWatcher } from '@/composables/useNotification';
import { useAppUpdate } from '@/composables/useAppUpdate';
import { useDataStore } from '@/composables/useDataStore';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

const router = useRouter();
const route = useRoute();
const { activeTab } = useDataStore();
const bannerContainerRef = ref(null);
const messageRef = ref(null);

const isBannerVisible = computed(
  () =>
    Boolean(currentNotice.value) &&
    !['map-drawer', 'settings', 'appearance-settings', 'server-settings', 'proxy-settings'].includes(route.name)
);

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

let bannerObserver = null;

const updateBannerHeight = () => {
  nextTick(() => {
    if (isBannerVisible.value && bannerContainerRef.value) {
      setBannerHeight(bannerContainerRef.value.offsetHeight);
    } else {
      setBannerHeight(0);
    }
  });
};

watch([isBannerVisible, () => currentNotice.value?.content], () => {
  updateBannerHeight();
});

watch(
  bannerContainerRef,
  (el) => {
    bannerObserver?.disconnect();
    if (el && typeof ResizeObserver !== 'undefined') {
      bannerObserver = new ResizeObserver(() => {
        if (isBannerVisible.value && bannerContainerRef.value) {
          setBannerHeight(bannerContainerRef.value.offsetHeight);
        }
      });
      bannerObserver.observe(el);
    }
  },
  { flush: 'post' }
);

const setViewportHeightVar = () => {
  const height = window.innerHeight || document.documentElement?.clientHeight || 0;
  document.documentElement.style.setProperty('--app-vh', `${Math.max(0, Math.round(height))}px`);
};

let stopNotificationWatcher = null;
const { checkUpdate } = useAppUpdate();

// Capacitor 原生返回键与全面屏侧滑手势支持 (Android / iOS)
let lastBackPressTime = 0;
let backButtonListener = null;

const initNativeBackButton = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    backButtonListener = await CapApp.addListener('backButton', () => {
      // 1. 若当前存在打开中的抽屉面板，优先关闭抽屉
      const closeBtn = document.querySelector('.drawer-close-btn, .drawer-back-btn');
      if (closeBtn && closeBtn instanceof HTMLElement) {
        closeBtn.click();
        return;
      }

      // 2. 若当前不是主页，返回上一路由
      if (route.name && route.name !== 'home' && route.path !== '/') {
        router.back();
        return;
      }

      // 3. 若在主页且不在校园跑首页 Tab，切回首页
      const currentTab = activeTab.value || 'submit';
      if (currentTab !== 'submit') {
        window.dispatchEvent(new CustomEvent('app:edge-swipe-back'));
        return;
      }

      // 4. 若已在首页校园跑顶层，连续按两次退出应用
      const now = Date.now();
      if (now - lastBackPressTime < 2000) {
        CapApp.exitApp();
      } else {
        lastBackPressTime = now;
        showMessage('再按一次退出应用', 'info');
      }
    });
  } catch (err) {
    console.debug('Failed to register Capacitor backButton listener:', err);
  }
};

// 全局移动端手势：从左边缘向右滑返回
let globalTouchStartX = 0;
let globalTouchStartY = 0;
let globalTouchStartTime = 0;
let isGlobalEdgeTouch = false;

function handleGlobalTouchStart(e) {
  if (!e.touches || e.touches.length !== 1) return;
  const t = e.touches[0];
  if (t.clientX <= 36) {
    globalTouchStartX = t.clientX;
    globalTouchStartY = t.clientY;
    globalTouchStartTime = Date.now();
    isGlobalEdgeTouch = true;
  } else {
    isGlobalEdgeTouch = false;
  }
}

function handleGlobalTouchEnd(e) {
  if (!isGlobalEdgeTouch || !e.changedTouches || e.changedTouches.length === 0) return;
  const t = e.changedTouches[0];
  const deltaX = t.clientX - globalTouchStartX;
  const deltaY = t.clientY - globalTouchStartY;
  const deltaTime = Date.now() - globalTouchStartTime;
  isGlobalEdgeTouch = false;

  if (deltaX > 60 && deltaX > Math.abs(deltaY) * 1.4 && deltaTime < 500) {
    // 1. 若当前存在打开中的抽屉面板，由 Drawer 组件自身手势优先处理
    if (document.querySelector('.drawer-panel')) {
      return;
    }

    // 2. 若当前不是主页，返回上一路由
    if (route.name && route.name !== 'home' && route.path !== '/') {
      router.back();
      return;
    }

    // 3. 若在主页且不在校园跑首页 Tab，分发事件切回首页
    window.dispatchEvent(new CustomEvent('app:edge-swipe-back'));
  }
}

onMounted(() => {
  setMessageHandler((message, type, options) => {
    messageRef.value?.show(message, type, options);
  });

  stopNotificationWatcher = startNotificationWatcher(router);
  setViewportHeightVar();
  window.addEventListener('resize', setViewportHeightVar);
  window.addEventListener('orientationchange', setViewportHeightVar);
  window.addEventListener('touchstart', handleGlobalTouchStart, { passive: true });
  window.addEventListener('touchend', handleGlobalTouchEnd, { passive: true });

  initNativeBackButton();

  // 进入 APP 自动获取更新
  checkUpdate();
});

onUnmounted(() => {
  bannerObserver?.disconnect();
  stopNotificationWatcher?.();
  setBannerHeight(0);
  window.removeEventListener('resize', setViewportHeightVar);
  window.removeEventListener('orientationchange', setViewportHeightVar);
  window.removeEventListener('touchstart', handleGlobalTouchStart);
  window.removeEventListener('touchend', handleGlobalTouchEnd);
  backButtonListener?.remove?.();
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
