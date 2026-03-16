<template>
  <div class="h-full min-h-0 flex flex-col bg-transparent overflow-hidden">
    <AppHeader v-show="activeKey !== 'chat'" ref="appHeaderRef" :scrolled="headerCompact" />

    <div class="flex-1 flex flex-col min-h-0 w-full mx-auto p-0 relative bg-transparent">
      <main
        v-show="activeKey !== 'chat'"
        ref="mainScrollRef"
        class="main-scroll-area relative overflow-y-auto w-full box-border px-4"
        :style="{
          paddingTop: `${headerHeight}px`,
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
      @update:active="setActiveKey"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, provide, inject } from 'vue';
import RunRecords from '@/components/RunRecords.vue';
import Club from '@/components/Club.vue';
import SubmitRun from '@/components/SubmitRun.vue';
import ChatPage from '@/views/ChatPage.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import BottomTabBar from '@/components/layout/BottomTabBar.vue';
import MyPage from '@/views/MyPage.vue';
import { useDataStore } from '@/composables/useDataStore';
import { useApiRequestGate } from '@/composables/useApiRequestGate';
import { preloadAutorunPingMeta } from '@/composables/useAutorunPingMeta';
import { checkHasUnreadMessages } from '@/composables/useMessageReminder';
import { getViewportMetrics } from '@/utils/viewport';

const { fetchUserData, activeTab, userInfo, token, chatUnread, setChatUnread, markChatSeen } =
  useDataStore();
const { waitForIdle } = useApiRequestGate();
const rootShowMessage = inject('showMessage', null);

const appHeaderRef = ref(null);
const bottomBarRef = ref(null);
const mainScrollRef = ref(null);
const HEADER_RESERVED_SPACE = 56;
const DEFAULT_BOTTOM_BAR_OVERLAY_HEIGHT = 96;
const BOTTOM_BAR_CLEARANCE_GAP = 12;
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

function showMessage(message, type = 'info') {
  if (activeKey.value !== 'chat' && appHeaderRef.value?.show) {
    appHeaderRef.value.show(message, type);
    return;
  }

  if (typeof rootShowMessage === 'function') {
    rootShowMessage(message, type);
  }
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
  await waitForIdle();
  await preloadAutorunPingMeta();
  await syncUnreadReminder();
}

async function handleRunSubmitted() {
  await refreshUserData({ background: true });
}

provide('goBack', () => setActiveKey('submit'));
provide('showMessage', showMessage);

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

  nextTick(() => {
    updateHeaderCompact(mainScrollRef.value?.scrollTop || 0);
  });
});

onUnmounted(() => {
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
