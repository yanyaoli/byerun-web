<template>
  <div class="h-screen flex flex-col bg-transparent overflow-hidden">
    <template v-if="activeKey !== 'chat'">
      <AppHeader ref="appHeaderRef" class="fixed inset-x-4 top-4 z-50 max-w-3xl mx-auto" />
      <div class="flex-1 flex flex-col min-h-0 w-full mx-auto p-0 relative bg-transparent">
        <main
          class="main-scroll-area relative overflow-y-auto w-full box-border px-4"
          :style="{ paddingTop: headerHeight + 'px', paddingBottom: bottomBarHeight + 'px' }"
          ref="mainScrollRef"
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
      </div>
      <BottomTabBar
        :active="activeKey"
        @update:active="setActiveKey"
        class="fixed inset-x-4 bottom-4 z-50 max-w-3xl mx-auto"
        ref="bottomBarRef"
      />
      <Message />
    </template>

    <template v-else>
      <ChatPage />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import RunRecords from '@/components/RunRecords.vue';
import SubmitRun from '../components/SubmitRun.vue';
import ChatPage from '@/views/ChatPage.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import BottomTabBar from '@/components/layout/BottomTabBar.vue';
import Message from '@/components/Message.vue';
import { useDataStore } from '@/composables/useDataStore';

const { fetchUserData } = useDataStore();

const appHeaderRef = ref(null);
const bottomBarRef = ref(null);
const mainScrollRef = ref(null);
const headerHeight = ref(56);
const bottomBarHeight = ref(96);
const activeKey = ref('submit');

const setActiveKey = (key) => {
  activeKey.value = key;
};

function measureHeights() {
  const headerEl = appHeaderRef.value && (appHeaderRef.value.$el || appHeaderRef.value);
  const bottomEl = bottomBarRef.value && (bottomBarRef.value.$el || bottomBarRef.value);
  if (headerEl && headerEl.getBoundingClientRect) {
    const r = headerEl.getBoundingClientRect();
    const topGap = Math.max(0, r.top || 0);
    headerHeight.value = (r.height || 56) + topGap;
  }
  if (bottomEl && bottomEl.getBoundingClientRect) {
    const r = bottomEl.getBoundingClientRect();
    const bottomGap = Math.max(0, window.innerHeight - (r.bottom || window.innerHeight));
    bottomBarHeight.value = (r.height || 96) + bottomGap;
  }
}

const getScrollKey = () => `scroll_${activeKey.value}`;

onMounted(() => {
  measureHeights();
  window.addEventListener('resize', measureHeights);
  nextTick(() => {
    try {
      const pos = Number(localStorage.getItem(getScrollKey()) || 0);
      if (mainScrollRef.value) mainScrollRef.value.scrollTop = pos;
    } catch (e) {}
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', measureHeights);
  try {
    if (mainScrollRef.value) {
      localStorage.setItem(getScrollKey(), String(mainScrollRef.value.scrollTop || 0));
    }
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
