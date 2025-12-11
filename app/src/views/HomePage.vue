<template>
  <div class="app-container">
    <div class="app-layout">
      <!-- 顶部标题栏 -->
      <AppHeader :title="pageTitle" />

      <!-- 主要内容区域 -->
      <main class="page-main">
        <div class="main-scroll-area" ref="mainScrollRef">
          <!-- 使用过渡效果实现页面切换 -->
          <transition name="fade-slide" mode="out-in">
            <div :key="activeTab">
              <!-- 记录页 -->
              <RunRecords
                v-if="activeTab === 'records'"
                :userInfo="userInfo"
                :runInfo="runInfo"
                :runStandard="runStandard"
                :activityInfo="activityInfo"
                :profileLoading="profileLoading"
              />
              <!-- 提交页 -->
              <SubmitRun
                v-else-if="activeTab === 'submit'"
                :userInfo="userInfo"
                :runStandard="runStandard"
                :activityInfo="activityInfo"
                @submitted="fetchUserData"
              />
              <!-- 我的（个人信息）页 -->
              <Profile
                v-else-if="activeTab === 'profile'"
                :userInfo="userInfo"
                :loading="profileLoading"
                @logout="logout"
              />
            </div>
          </transition>
        </div>
      </main>

      <!-- 底部导航栏 -->
      <BottomTabBar :active="activeTab" @switch="switchTab" />
    </div>
    <!-- 全局消息提示 -->
    <Message ref="messageRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide, nextTick } from "vue";
import SubmitRun from "../components/SubmitRun.vue";
import RunRecords from "../components/RunRecords.vue";
import Profile from "../components/Profile.vue";
import Message from "../components/Message.vue";
import AppHeader from "../components/layout/AppHeader.vue";
import BottomTabBar from "../components/layout/BottomTabBar.vue";
import api from "../utils/api";

const activeTab = ref(localStorage.getItem("activeTab") || "submit");
const userInfo = ref(null);
const runInfo = ref(null);
const runStandard = ref(null);
const activityInfo = ref(null);
const profileLoading = ref(true);
const messageRef = ref(null);
const mainScrollRef = ref(null);

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

const fetchUserData = async () => {
  profileLoading.value = true;
  try {
    const userRes = await api.get("/auth/query/token");
    if (userRes.data.code === 10000) {
      userInfo.value = userRes.data.response;
      profileLoading.value = false;

      const { schoolId, userId, studentId } = userInfo.value;

      // 跑步标准
      api
        .get("/unirun/query/runStandard", {
          params: { schoolId },
        })
        .then((standardRes) => {
          if (standardRes.data.code === 10000) {
            runStandard.value = standardRes.data.response;
          }
        });

      // 跑步信息
      api
        .get("/unirun/query/runInfo", {
          params: {
            userId,
            yearSemester: 1,
          },
        })
        .then((runRes) => {
          if (runRes.data.code === 10000) {
            runInfo.value = runRes.data.response;
          }
        });

      // 活动信息
      api
        .get("/clubactivity/getJoinNum", {
          params: {
            schoolId,
            studentId,
          },
        })
        .then((activityRes) => {
          if (activityRes.data.code === 10000) {
            activityInfo.value = activityRes.data.response;
          }
        });
    } else {
      handleLogout();
    }
  } catch {
    handleLogout();
  }
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("studentId");
  localStorage.removeItem("schoolId");
  window.location.reload();
};

onMounted(() => {
  fetchUserData();
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
  localStorage.setItem("activeTab", tab);
  
  // 切换后恢复新页面的滚动位置
  nextTick(() => {
    if (mainScrollRef.value) {
      mainScrollRef.value.scrollTop = scrollPositions.value[tab] || 0;
    }
  });
};

// 页面标题的计算属性
const pageTitle = computed(() => {
  switch (activeTab.value) {
    case "records":
      return "跑步记录";
    case "submit":
      return "提交记录";
    case "profile":
      return "我的信息";
    default:
      return "";
  }
});
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
  overflow: hidden;
}

.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  position: relative;
  background: transparent;
  --app-header-height: 48px;
  --app-bottom-height: 72px;
  overflow: hidden;
}

.page-main {
  flex: 1;
  position: relative;
  background: transparent;
  width: 100%;
  max-width: 100%;
  padding-top: var(--app-header-height);
  padding-bottom: var(--app-bottom-height);
  min-height: 100vh;
  overflow: hidden;
}

.main-scroll-area {
  height: 100%;
  min-height: calc(100vh - var(--app-header-height) - var(--app-bottom-height));
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease-out;
  position: relative;
  overflow: hidden;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
}
</style>