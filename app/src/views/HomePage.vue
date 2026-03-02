<template>
  <div class="h-screen flex flex-col bg-transparent overflow-hidden">
    <AppHeader v-show="activeKey !== 'chat'" ref="appHeaderRef" :scrolled="headerCompact" />

    <div class="flex-1 flex flex-col min-h-0 w-full mx-auto p-0 relative bg-transparent">
      <main
        v-show="activeKey !== 'chat'"
        class="main-scroll-area relative overflow-y-auto w-full box-border px-4"
        :style="{ paddingTop: headerHeight + 'px', paddingBottom: bottomBarHeight + 'px' }"
        ref="mainScrollRef"
        @scroll.passive="handleMainScroll"
      >
        <keep-alive>
          <RunRecords v-if="activeKey === 'records'" :key="'records'" />
          <SubmitRun
            v-else-if="activeKey === 'submit'"
            :key="'submit'"
            @submitted="fetchUserData"
          />
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
      :active="activeKey"
      @update:active="setActiveKey"
      class="fixed inset-x-4 bottom-4 z-50 max-w-3xl mx-auto"
      ref="bottomBarRef"
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
import { useDataStore } from '@/composables/useDataStore';

const { fetchUserData, activeTab } = useDataStore();
const rootShowMessage = inject('showMessage', null);

const appHeaderRef = ref(null);
const bottomBarRef = ref(null);
const mainScrollRef = ref(null);
const HEADER_RESERVED_SPACE = 56;
const headerHeight = ref(HEADER_RESERVED_SPACE);
const bottomBarHeight = ref(96);
const headerCompact = ref(false);
const activeKey = ref(activeTab.value || 'submit');
const chatMounted = ref(activeKey.value === 'chat');

const getScrollKey = (key = activeKey.value) => `scroll_${key}`;

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

function saveScrollPosition(key = activeKey.value) {
  if (!mainScrollRef.value || key === 'chat') return;
  localStorage.setItem(getScrollKey(key), String(mainScrollRef.value.scrollTop || 0));
}

function restoreScrollPosition(key = activeKey.value) {
  if (!mainScrollRef.value || key === 'chat') return;
  const pos = Number(localStorage.getItem(getScrollKey(key)) || 0);
  mainScrollRef.value.scrollTop = Number.isFinite(pos) ? pos : 0;
  updateHeaderCompact(mainScrollRef.value.scrollTop || 0);
}

const setActiveKey = (key) => {
  if (!key || key === activeKey.value) return;
  saveScrollPosition(activeKey.value);
  activeKey.value = key;
  activeTab.value = key;
};

function measureHeights() {
  const bottomEl = bottomBarRef.value && (bottomBarRef.value.$el || bottomBarRef.value);
  headerHeight.value = HEADER_RESERVED_SPACE;
  if (bottomEl && bottomEl.getBoundingClientRect) {
    const r = bottomEl.getBoundingClientRect();
    const bottomGap = Math.max(0, window.innerHeight - (r.bottom || window.innerHeight));
    bottomBarHeight.value = (r.height || 96) + bottomGap;
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

provide('goBack', () => setActiveKey('submit'));
provide('showMessage', showMessage);

watch(
  activeKey,
  async (newKey, oldKey) => {
    if (oldKey && oldKey !== 'chat') {
      saveScrollPosition(oldKey);
    }
    if (newKey === 'chat') {
      chatMounted.value = true;
      return;
    }
    await nextTick();
    restoreScrollPosition(newKey);
    measureHeights();
  },
  { flush: 'post' },
);

onMounted(() => {
  measureHeights();
  window.addEventListener('resize', measureHeights);
  nextTick(() => {
    try {
      restoreScrollPosition(activeKey.value);
      updateHeaderCompact(mainScrollRef.value?.scrollTop || 0);
    } catch (e) {}
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', measureHeights);
  try {
    saveScrollPosition(activeKey.value);
  } catch (e) {}
});
</script>

<style scoped>
.main-scroll-area {
  flex: 1 1 auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}
</style>
