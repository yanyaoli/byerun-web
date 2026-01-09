<template>
  <div class="h-screen flex flex-col bg-transparent overflow-hidden">
    <!-- 顶部标题栏 -->
    <AppHeader v-show="!isLayoutHidden" />
    <div class="flex flex-col w-full mx-auto p-0 relative bg-transparent">
      <!-- 主要内容区域 -->
      <main class="flex-1 relative bg-transparent w-full transition-all duration-300"
        :class="[isLayoutHidden ? 'pt-0 pb-0' : 'pt-[48px] pb-[72px]']">
        <div
          class="main-scroll-area relative h-full min-h-[calc(100vh-48px-72px)] overflow-y-auto w-full box-border py-5"
          ref="mainScrollRef">
          <div v-if="profileLoading && !userInfo"
            class="flex flex-col items-center justify-center h-full py-20 bg-transparent">
            <div class="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-500 text-sm">正在加载数据...</p>
          </div>
          <keep-alive v-else>
            <component :is="currentComponent" :key="activeTab" v-on="currentListeners" />
          </keep-alive>
        </div>
      </main>


    </div>
    <!-- 底部导航栏 -->
    <BottomTabBar v-show="!isLayoutHidden" :active="activeTab" @switch="switchTab" />
    <!-- 全局消息提示 -->
    <Message ref="messageRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide, nextTick, markRaw } from "vue";
import SubmitRun from "@/components/SubmitRun.vue";
import RunRecords from "@/components/RunRecords.vue";
import Profile from "@/components/Profile.vue";
import Message from "@/components/Message.vue";
import Club from "@/components/Club.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import BottomTabBar from "@/components/layout/BottomTabBar.vue";
import { api } from "@/composables/useApi";
import { useDataStore } from "@/composables/useDataStore";

const {
  userInfo,
  runInfo,
  runStandard,
  activityInfo,
  loading: profileLoading,
  fetchUserData,
  clearAllData,
  activeTab
} = useDataStore();

const messageRef = ref(null);
const mainScrollRef = ref(null);
const isLayoutHidden = ref(false);

// 存储各个页面的滚动位置
const scrollPositions = ref({
  records: 0,
  submit: 0,
  profile: 0,
});


// 全局消息方法
const showMessage = (message, type = "info") => {
  messageRef.value?.show(message, type);
};

// 提供给子组件使用
provide('showMessage', showMessage);
provide('setLayoutHidden', (hidden) => {
  isLayoutHidden.value = hidden;
});

// 动态组件配置
const components = {
  club: markRaw(Club),
  records: markRaw(RunRecords),
  submit: markRaw(SubmitRun),
  profile: markRaw(Profile),
};

const currentComponent = computed(() => components[activeTab.value]);

const currentListeners = computed(() => {
  if (activeTab.value === 'submit') {
    return { submitted: fetchUserData };
  } else if (activeTab.value === 'profile') {
    return { logout: logout };
  }
  return {};
});

const handleLogout = () => {
  clearAllData();
  window.location.reload();
};

onMounted(() => {
  fetchUserData().then(success => {
  });
});

const logout = () => {
  handleLogout();
};

const switchTab = (tab) => {
  // 保存当前页面的滚动位置
  if (mainScrollRef.value) {
    scrollPositions.value[activeTab.value] = mainScrollRef.value.scrollTop;
  }

  activeTab.value = tab;

  // 切换后恢复新页面的滚动位置
  nextTick(() => {
    if (mainScrollRef.value) {
      mainScrollRef.value.scrollTop = scrollPositions.value[tab] || 0;
    }
  });
};
</script>

<style scoped>
.main-scroll-area {
  height: calc(100vh - 48px - 72px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>