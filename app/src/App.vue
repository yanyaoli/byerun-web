<template>
  <div v-if="!isLogin">
    <Login v-if="!showResetPassword" @showReset="handleShowReset" />
    <ResetPassword v-else @backToLogin="handleBackToLogin" />
  </div>
  <div v-else class="app-container">
    <div class="app-layout">
      <!-- 顶部标题栏 -->
      <header class="page-header">
        <h1 class="page-title">{{ pageTitle }}</h1>
      </header>

      <!-- 主要内容区域 -->
      <main class="page-main">
        <div class="main-scroll-area">
          <!-- 使用过渡效果实现页面切换 -->
          <transition name="fade-slide" mode="out-in">
            <div :key="activeTab">
              <!-- 通用页面标题 -->

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
      <nav class="bottom-tab-bar">
        <div class="tab-bar-container">
          <button
            class="tab-item"
            :class="{ active: activeTab === 'records' }"
            @click="switchTab('records')"
          >
            <div class="tab-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.5h-15V5h15v14.5zm0-16.5h-15c-.83 0-1.5.67-1.5 1.5v15c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span class="tab-label">记录</span>
          </button>

          <button
            class="tab-item"
            :class="{ active: activeTab === 'submit' }"
            @click="switchTab('submit')"
          >
            <div class="tab-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span class="tab-label">提交</span>
          </button>

          <button
            class="tab-item"
            :class="{ active: activeTab === 'profile' }"
            @click="switchTab('profile')"
          >
            <div class="tab-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span class="tab-label">我的</span>
          </button>
        </div>
      </nav>
    </div>
    <Message ref="messageRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { ComponentPublicInstance } from "vue";
import Login from "./components/Login.vue";
import ResetPassword from "./components/ResetPassword.vue";
import SubmitRun from "./components/SubmitRun.vue";
import RunRecords from "./components/RunRecords.vue";
import Profile from "./components/Profile.vue";
import Message from "./components/Message.vue";
import api from "./api";

const isLogin = ref(!!localStorage.getItem("token"));
const showResetPassword = ref(false);
const activeTab = ref(localStorage.getItem("activeTab") || "submit");
const userInfo = ref<any>(null);
const runInfo = ref<any>(null);
const runStandard = ref<any>(null);
const activityInfo = ref<any>(null);
const profileLoading = ref(true);

// 修改 Message 组件的类型
interface MessageInstance extends ComponentPublicInstance {
  show: (message: string, type?: string) => void;
}
const messageRef = ref<MessageInstance | null>(null);

const fetchUserData = async () => {
  profileLoading.value = true; // 开始加载
  try {
    const userRes = await api.get("/auth/query/token");
    if (userRes.data.code === 10000) {
      userInfo.value = userRes.data.response;
      profileLoading.value = false; // 用户信息获取后立即结束加载

      // 其余数据并行加载，不影响页面展示
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
      isLogin.value = false;
      profileLoading.value = false;
    }
  } catch {
    isLogin.value = false;
    profileLoading.value = false;
  }
};

onMounted(() => {
  if (isLogin.value) fetchUserData();
});

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("studentId");
  localStorage.removeItem("schoolId");
  showMessage("退出登录成功", "success");
  window.location.reload();
};

const handleShowReset = () => {
  showResetPassword.value = true;
};

const handleBackToLogin = () => {
  showResetPassword.value = false;
};

const switchTab = (tab: string) => {
  activeTab.value = tab;
  localStorage.setItem("activeTab", tab); // 保存当前标签页到本地存储
};

// 添加页面标题的计算属性
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

// 添加全局消息方法
const showMessage = (
  message: string,
  type: "success" | "error" | "info" | "warning" = "info"
) => {
  messageRef.value?.show(message, type);
};
</script>

<script lang="ts">
export default {
  name: "App",
};
</script>

<style scoped>
/* 全局重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body,
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f6f7f9;
  font-family: "Segoe UI", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif;
  color: #2d3a3f;
  overflow: hidden;
}

/* 主布局容器 */
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  /* 顶部和底部安全区内边距，避免被遮挡 */
  padding-top: env(safe-area-inset-top, 0);
  padding-bottom: env(safe-area-inset-bottom, 56px);
}

/* 顶部标题栏 */
.page-header {
  flex: none;
  background: #fff;
  padding: 14px 16px;
  border-bottom: 1px solid #e3e6e8;
  text-align: center;
  z-index: 10;
  position: sticky;
  top: 0;
}

/* 页面标题样式 */
.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3a3f;
  margin: 0;
}

/* 主内容区域 - 添加宽度限制和容器固定 */
.page-main {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #f6f7f9;
  width: 100%;
  max-width: 100%;
  /* 避免内容被顶部和底部遮挡 */
  padding-top: env(safe-area-inset-top, 0);
  padding-bottom: env(safe-area-inset-bottom, 56px);
}

.main-scroll-area {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px 0;
  width: 100%;
  position: relative;
  /* 避免内容被底部遮挡 */
  padding-bottom: calc(env(safe-area-inset-bottom, 56px) + 16px);
}

/* 底部标签栏样式 */
.bottom-tab-bar {
  flex: none;
  background-color: #ffffff;
  border-top: 1px solid #e3e6e8;
  padding-bottom: env(safe-area-inset-bottom, 0);
  position: sticky;
  bottom: 0;
  z-index: 100;
}

.tab-bar-container {
  display: flex;
  flex-direction: row; /* 确保水平布局 */
  justify-content: space-around;
  align-items: center;
  padding: 8px 0 4px;
  max-width: 500px;
  margin: 0 auto;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #7b8a8b;
  min-width: 64px;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  outline: none;
  user-select: none;
}

/* 修正激活状态的样式 */
.tab-item:active {
  color: #2d3a3f;
}

.tab-item.active {
  color: #24343b;
}

/* 图标和文字样式 */
.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
}

.tab-label {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

/* 过渡动画 - 优化动画效果 */
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
