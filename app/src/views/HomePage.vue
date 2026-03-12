<template>
  <div class="h-screen flex flex-col bg-transparent overflow-hidden">
    <AppHeader v-show="activeKey !== 'chat'" ref="appHeaderRef" :scrolled="headerCompact" />

    <div class="flex-1 flex flex-col min-h-0 w-full mx-auto p-0 relative bg-transparent">
      <main
        v-show="activeKey !== 'chat'"
        ref="mainScrollRef"
        class="main-scroll-area bottom-overlay-aware relative overflow-y-auto w-full box-border px-4"
        :style="{ paddingTop: `${headerHeight}px` }"
        @scroll.passive="handleMainScroll"
      >
        <keep-alive>
          <RunRecords v-if="activeKey === 'records'" :key="'records'" />
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
import SubmitRun from '../components/SubmitRun.vue';
import ChatPage from '@/views/ChatPage.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import BottomTabBar from '@/components/layout/BottomTabBar.vue';
import MyPage from '@/views/MyPage.vue';
import { useDataStore } from '@/composables/useDataStore';
import { useApiRequestGate } from '@/composables/useApiRequestGate';
import { preloadAutorunPingMeta } from '@/composables/useAutorunPingMeta';
import { checkHasUnreadMessages } from '@/composables/useMessageReminder';

const { fetchUserData, activeTab, userInfo, token, chatUnread, setChatUnread, markChatSeen } =
  useDataStore();
const { waitForIdle } = useApiRequestGate();
const rootShowMessage = inject('showMessage', null);
const setBottomOverlay = inject('setBottomOverlay', null);
const setBottomOverlayHeight = inject('setBottomOverlayHeight', () => {});

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

function applyBottomOverlay(height = 0, gap = 0) {
  if (typeof setBottomOverlay === 'function') {
    setBottomOverlay({ height, gap });
    return;
  }
  setBottomOverlayHeight(height);
}

function updateHeaderCompact(top) {
  const next = Number(top) > 6;
  if (next === headerCompact.value) return false;
  headerCompact.value = next;
  return true;
}

function handleMainScroll(e) {
  const top = e?.target?.scrollTop || 0;
  updateHeaderCompact(top);
}

const setActiveKey = (key) => {
  if (!key || key === activeKey.value) return;
  activeKey.value = key;
  activeTab.value = key;
};

function measureHeights() {
  const bottomEl = bottomBarRef.value && (bottomBarRef.value.$el || bottomBarRef.value);
  headerHeight.value = HEADER_RESERVED_SPACE;

  if (bottomEl?.getBoundingClientRect) {
    const rect = bottomEl.getBoundingClientRect();
    const bottomGap = Math.max(0, window.innerHeight - (rect.bottom || window.innerHeight));
    bottomBarOverlayHeight.value = (rect.height || DEFAULT_BOTTOM_BAR_OVERLAY_HEIGHT) + bottomGap;
  }

  if (activeKey.value !== 'chat') {
    applyBottomOverlay(bottomBarOverlayHeight.value, BOTTOM_BAR_CLEARANCE_GAP);
  }
}

const showMessage = (message, type = 'info') => {
  if (activeKey.value !== 'chat' && appHeaderRef.value?.show) {
    appHeaderRef.value.show(message, type);
    return;
  }
  if (typeof rootShowMessage === 'function') {
    rootShowMessage(message, type);
  }
};

const refreshUserData = async (options = { background: true }) => {
  if (!userInfo.value) return true;

  const result = await fetchUserData(options);
  if (result?.ok) return true;

  if (result?.reason === 'network_error') {
    showMessage('用户数据刷新失败', 'warning');
    return false;
  }

  showMessage(result?.message || '登录状态校验失败', 'error');
  return false;
};

const syncUnreadReminder = async () => {
  if (activeKey.value === 'chat') return;
  const unread = await checkHasUnreadMessages(token.value || '');
  setChatUnread(unread);
};

const initializePage = async () => {
  await refreshUserData({ background: false });
  await waitForIdle();
  await preloadAutorunPingMeta();
  await syncUnreadReminder();
};

const handleRunSubmitted = async () => {
  await refreshUserData({ background: true });
};

provide('goBack', () => setActiveKey('submit'));
provide('showMessage', showMessage);

watch(
  activeKey,
  async (newKey) => {
    if (newKey === 'chat') {
      chatMounted.value = true;
      markChatSeen();
      applyBottomOverlay(0, 0);
      return;
    }

    await nextTick();
    updateHeaderCompact(mainScrollRef.value?.scrollTop || 0);
    measureHeights();
  },
  { flush: 'post' },
);

onMounted(() => {
  if (activeKey.value === 'chat') {
    markChatSeen();
    applyBottomOverlay(0, 0);
  }

  initializePage().catch(() => {
    showMessage('用户数据刷新失败', 'warning');
  });

  measureHeights();
  window.addEventListener('resize', measureHeights);
  nextTick(() => {
    updateHeaderCompact(mainScrollRef.value?.scrollTop || 0);
  });
});

onUnmounted(() => {
  applyBottomOverlay(0, 0);
  window.removeEventListener('resize', measureHeights);
});
</script>

<style scoped>
.main-scroll-area {
  flex: 1 1 auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}
</style>