<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <AppHeader />
    <div class="app-layout">
      <!-- 主要内容区域 -->
      <main class="page-main">
        <div class="main-scroll-area" ref="mainScrollRef">
          <keep-alive>
            <component :is="currentComponent" :key="activeTab" v-bind="currentProps" v-on="currentListeners" />
          </keep-alive>
        </div>
      </main>


    </div>
    <!-- 底部导航栏 -->
    <BottomTabBar :active="activeTab" @switch="switchTab" />
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

// 动态组件配置
const components = {
  club: markRaw(Club),
  records: markRaw(RunRecords),
  submit: markRaw(SubmitRun),
  profile: markRaw(Profile),
};

const currentComponent = computed(() => components[activeTab.value]);

const currentProps = computed(() => {
  if (activeTab.value === 'club') {
    return {
      userInfo: userInfo.value
    };
  } else if (activeTab.value === 'records') {
    return {
      userInfo: userInfo.value,
      runInfo: runInfo.value,
      runStandard: runStandard.value,
      activityInfo: activityInfo.value,
      profileLoading: profileLoading.value
    };
  } else if (activeTab.value === 'submit') {
    return {
      userInfo: userInfo.value,
      runStandard: runStandard.value,
      activityInfo: activityInfo.value,
      runInfo: runInfo.value
    };
  } else {
    return {
      userInfo: userInfo.value,
      loading: profileLoading.value
    };
  }
});

const currentListeners = computed(() => {
  if (activeTab.value === 'submit') {
    return { submitted: fetchUserData };
  } else if (activeTab.value === 'profile') {
    return { logout: logout };
  }
  return {};
});

const fetchUserData = async () => {
  profileLoading.value = true;
  try {
    const userRes = await api.getToken();
    if (userRes.data.code === 10000) {
      userInfo.value = userRes.data.response;
      profileLoading.value = false;

      const { schoolId, userId, studentId } = userInfo.value;

      // 跑步标准
      api.getRunStandard(schoolId)
        .then((standardRes) => {
          if (standardRes.data.code === 10000) {
            runStandard.value = standardRes.data.response;
            const semesterFromStandard = runStandard.value && runStandard.value.semesterYear;
            const now = new Date();
            const year = now.getFullYear();
            const semester = now.getMonth() + 1 < 8 ? "1" : "2";
            const fallbackYearSemester = `${year}${semester}`;

            const finalSemester = semesterFromStandard || fallbackYearSemester;
            api.getRunInfo(Number(userId), finalSemester)
              .then((runRes) => {
                if (runRes.data.code === 10000) {
                  runInfo.value = runRes.data.response;
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {});

      // 活动信息
      api.getJoinNum(schoolId, studentId)
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
  width: 100%;
  margin: 0 auto;
  padding: 0;
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
  padding-top: var(--app-header-height);
  padding-bottom: var(--app-bottom-height);
  overflow: hidden;
}

.main-scroll-area {
  position: relative;
  height: 100%;
  min-height: calc(100vh - var(--app-header-height) - var(--app-bottom-height));
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  box-sizing: border-box;
  padding: 15px 0;
}
</style>