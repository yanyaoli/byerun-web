<template>
  <div class="h-full min-h-0 flex flex-col overflow-hidden">
    <AppHeader v-show="activeKey !== 'chat'" :scrolled="headerCompact" />

    <div
      class="flex-1 flex flex-col min-h-0 w-full mx-auto p-0 relative"
      @touchstart.passive="handleSwipeStart"
      @touchend.passive="handleSwipeEnd"
    >
      <main
        v-show="activeKey !== 'chat'"
        ref="mainScrollRef"
        class="relative overflow-y-auto w-full box-border px-4 transition-[padding] duration-300"
        :style="{
          paddingTop: `calc(var(--sat, env(safe-area-inset-top, 0px)) + ${headerHeight}px + var(--notice-banner-height, 0px))`,
          paddingBottom: `${bottomBarOverlayHeight + BOTTOM_BAR_CLEARANCE_GAP}px`,
        }"
        @scroll.passive="handleMainScroll"
      >
        <keep-alive>
          <RunRecords v-if="activeKey === 'records'" :key="'records'" />
          <Club v-else-if="activeKey === 'club'" :key="'club'" />
          <SubmitRun
            v-else-if="activeKey === 'submit'"
            :key="'submit'"
            @submitted="handleRunSubmitted"
          />
          <MyPage v-else-if="activeKey === 'my'" :key="'my'" />
        </keep-alive>
      </main>

      <div v-show="activeKey === 'chat'" class="flex-1 min-h-0">
        <keep-alive>
          <ChatPage v-if="chatMounted" />
        </keep-alive>
      </div>
    </div>

    <BottomTabBar
      v-show="activeKey !== 'chat'"
      ref="bottomBarRef"
      :active="activeKey"
      :chat-unread="chatUnread"
      :is-dark-mode="isDark"
      @update:active="setActiveKey"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch, provide, inject } from 'vue';
import RunRecords from '@/components/RunRecords.vue';
import Club from '@/components/Club.vue';
import SubmitRun from '@/components/SubmitRun.vue';
import ChatPage from '@/views/ChatPage.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import BottomTabBar from '@/components/layout/BottomTabBar.vue';
import MyPage from '@/views/MyPage.vue';
import { useDataStore } from '@/composables/useDataStore';
import { useChatStore } from '@/composables/useChatStore';
import { useThemeStore } from '@/composables/useTheme';
import { showMessage } from '@/composables/useMessage';
import { preloadAutorunPingMeta } from '@/sdk/app';
import { checkHasUnreadMessages } from '@/sdk/message';
import { getViewportMetrics } from '@/utils/viewport';

const { fetchUserData, activeTab, userInfo, token } = useDataStore();
const { chatUnread, setChatUnread, markChatSeen } = useChatStore();
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);

const bottomBarRef = ref(null);
const mainScrollRef = ref(null);
const HEADER_RESERVED_SPACE = 54;
const DEFAULT_BOTTOM_BAR_OVERLAY_HEIGHT = 70;
const BOTTOM_BAR_CLEARANCE_GAP = 8;
const headerHeight = ref(HEADER_RESERVED_SPACE);
const bottomBarOverlayHeight = ref(DEFAULT_BOTTOM_BAR_OVERLAY_HEIGHT);
const headerCompact = ref(false);
const activeKey = ref(activeTab.value || 'submit');
const chatMounted = ref(activeKey.value === 'chat');
let homeMeasureFrame = 0;

function updateHeaderCompact(top) {
  const next = Number(top) > 6;
  if (next === headerCompact.value) return false;
  headerCompact.value = next;
  return true;
}

function handleMainScroll(event) {
  const top = event?.target?.scrollTop || 0;
  updateHeaderCompact(top);
}

function setActiveKey(key) {
  if (!key || key === activeKey.value) return;
  activeKey.value = key;
  activeTab.value = key;
}

function measureHeights() {
  const bottomEl = bottomBarRef.value && (bottomBarRef.value.$el || bottomBarRef.value);
  headerHeight.value = HEADER_RESERVED_SPACE;

  if (bottomEl?.getBoundingClientRect) {
    const rect = bottomEl.getBoundingClientRect();
    const { visibleBottom } = getViewportMetrics();
    const overlayHeight = Math.max(0, Math.ceil(visibleBottom - rect.top));
    bottomBarOverlayHeight.value = overlayHeight || DEFAULT_BOTTOM_BAR_OVERLAY_HEIGHT;
  }
}

function scheduleMeasureHeights() {
  if (homeMeasureFrame) cancelAnimationFrame(homeMeasureFrame);
  homeMeasureFrame = requestAnimationFrame(() => {
    measureHeights();
    homeMeasureFrame = 0;
  });
}

async function refreshUserData(options = { background: true }) {
  if (!userInfo.value) return true;

  const result = await fetchUserData(options);
  if (result?.ok) return true;

  if (result?.reason === 'network_error') {
    showMessage('用户数据刷新失败', 'warning');
    return false;
  }

  showMessage(result?.message || '登录状态校验失败', 'error');
  return false;
}

async function syncUnreadReminder() {
  if (activeKey.value === 'chat') return;
  const unread = await checkHasUnreadMessages(token.value || '');
  setChatUnread(unread);
}

async function initializePage() {
  await refreshUserData({ background: false });
  await preloadAutorunPingMeta();
  await syncUnreadReminder();
}

async function handleRunSubmitted() {
  await refreshUserData({ background: true });
}

const TAB_ORDER = ['submit', 'club', 'chat', 'my'];
let swipeStartX = 0;
let swipeStartY = 0;
let swipeStartTime = 0;

function handleSwipeStart(e) {
  if (!e.touches || e.touches.length !== 1) return;
  const t = e.touches[0];
  swipeStartX = t.clientX;
  swipeStartY = t.clientY;
  swipeStartTime = Date.now();
}

function handleSwipeEnd(e) {
  if (!e.changedTouches || e.changedTouches.length === 0) return;
  const t = e.changedTouches[0];
  const deltaX = t.clientX - swipeStartX;
  const deltaY = t.clientY - swipeStartY;
  const duration = Date.now() - swipeStartTime;

  // 1. 若有抽屉打开，或目标元素为地图/输入框/选择器/按钮等，不触发 Tab 滑动切换
  if (document.querySelector('.drawer-panel')) return;
  const target = t.target;
  if (
    target &&
    (target.closest?.('input, textarea, select, .leaflet-container, button, a, [contenteditable="true"]') ||
      target.isContentEditable)
  ) {
    return;
  }

  // 2. 判断是否为清晰的水平快速划动手势（横向位移 > 50px，横向距离超过纵向 1.5 倍，耗时 < 500ms）
  if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && duration < 500) {
    if (activeKey.value === 'chat') {
      // 消息页内避免与气泡滑动回复冲突，仅允许从左侧区域右滑返回上一 Tab
      if (deltaX > 50 && swipeStartX <= 80) {
        const idx = TAB_ORDER.indexOf(activeKey.value);
        if (idx > 0) setActiveKey(TAB_ORDER[idx - 1]);
      }
      return;
    }

    const currentIndex = TAB_ORDER.indexOf(activeKey.value);
    if (currentIndex === -1) return;

    if (deltaX < -50) {
      // 从右往左滑 -> 切换到下一个 Tab
      if (currentIndex < TAB_ORDER.length - 1) {
        setActiveKey(TAB_ORDER[currentIndex + 1]);
      }
    } else if (deltaX > 50) {
      // 从左往右滑 -> 切换到上一个 Tab
      if (currentIndex > 0) {
        setActiveKey(TAB_ORDER[currentIndex - 1]);
      }
    }
  }
}

function handleEdgeSwipeBack() {
  if (activeKey.value !== 'submit') {
    setActiveKey('submit');
  }
}

provide('goBack', () => setActiveKey('submit'));

watch(
  activeKey,
  async (newKey) => {
    if (newKey === 'chat') {
      chatMounted.value = true;
      markChatSeen();
      return;
    }

    await nextTick();
    updateHeaderCompact(mainScrollRef.value?.scrollTop || 0);
    scheduleMeasureHeights();
  },
  { flush: 'post' },
);

onMounted(() => {
  if (activeKey.value === 'chat') {
    markChatSeen();
  }

  initializePage().catch(() => {
    showMessage('用户数据刷新失败', 'warning');
  });

  scheduleMeasureHeights();
  window.addEventListener('resize', scheduleMeasureHeights);
  window.addEventListener('orientationchange', scheduleMeasureHeights);
  window.visualViewport?.addEventListener('resize', scheduleMeasureHeights);
  window.visualViewport?.addEventListener('scroll', scheduleMeasureHeights);

  window.addEventListener('app:edge-swipe-back', handleEdgeSwipeBack);

  nextTick(() => {
    updateHeaderCompact(mainScrollRef.value?.scrollTop || 0);
  });
});

onUnmounted(() => {
  window.removeEventListener('app:edge-swipe-back', handleEdgeSwipeBack);
  window.removeEventListener('resize', scheduleMeasureHeights);
  window.removeEventListener('orientationchange', scheduleMeasureHeights);
  window.visualViewport?.removeEventListener('resize', scheduleMeasureHeights);
  window.visualViewport?.removeEventListener('scroll', scheduleMeasureHeights);

  if (homeMeasureFrame) {
    cancelAnimationFrame(homeMeasureFrame);
    homeMeasureFrame = 0;
  }
});
</script>

<style scoped>
.main-scroll-area {
  flex: 1 1 auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}
</style>
