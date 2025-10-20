<template>
  <div v-if="!isLogin">
    <LoginPage />
  </div>
  <div v-else class="app-container">
    <div class="app-layout">
      <!-- 顶部标题栏 -->
      <AppHeader :title="pageTitle" />

      <!-- 主要内容区域 -->
      <main class="page-main">
        <div class="main-scroll-area">
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
    <Message ref="messageRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { ComponentPublicInstance } from "vue";
import LoginPage from "./views/LoginPage.vue";
import SubmitRun from "./components/SubmitRun.vue";
import RunRecords from "./components/RunRecords.vue";
import Profile from "./components/Profile.vue";
import Message from "./components/Message.vue";
import AppHeader from "./components/layout/AppHeader.vue";
import BottomTabBar from "./components/layout/BottomTabBar.vue";
import api from "./utils/api";

const isLogin = ref(!!localStorage.getItem("token"));
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

// Measure header and bottom actual heights and update CSS variables so
// `page-main` height (which uses calc with those variables) stays accurate.
// Simple static layout: header and footer fixed heights defined in CSS.
onMounted(() => {
  // nothing required here for simple layout
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f6f7f9;
  font-family: "Segoe UI", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif;
  color: #2d3a3f;
  -webkit-font-smoothing: antialiased;
}

/* 主布局容器 */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  max-width: 420px; /* mobile max width */
  margin: 0 auto; /* center on larger screens */
  position: relative;
  background: #f6f7f9;
  border-right: 1px solid #e3e6e8;
  border-left: 1px solid #e3e6e8;
  /* 定义 header 和 bottom 的高度变量（可根据需要调整） */
  --app-header-height: 56px;
  --app-bottom-height: 72px;
}

/* header styles moved into components/layout/AppHeader.vue */

/* 主内容区域 - 添加宽度限制和容器固定 */
.page-main {
  /* page-main occupies the area between fixed header and bottom bar */
  /* ensure main content avoids the fixed header and bottom bar */
  padding-top: var(--app-header-height);
  padding-bottom: var(--app-bottom-height);
  min-height: calc(100vh - var(--app-header-height) - var(--app-bottom-height));
  position: relative;
  background: #f6f7f9;
  width: 100%;
  max-width: 100%;
}

.main-scroll-area {
  /* Fill the page-main height and scroll internally only */
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  box-sizing: border-box;
  /* avoid being covered by fixed header/footer */
  padding: 10px 0;
}

/* bottom tab styles moved into components/layout/BottomTabBar.vue */

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
