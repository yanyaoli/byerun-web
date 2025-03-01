<template>
  <el-container class="dashboard-container">
    <!-- 顶部固定区域 -->
    <div class="dashboard-fixed-area">
      <!-- 头部导航 -->
      <div class="header-container">
        <DashboardHeader
          :is-dark-mode="isDarkMode"
          :user-name="userStore.userInfo?.name"
          @refresh="handleRefreshData"
          @show-end-date="showEndDate"
          @logout="handleLogout"
          @toggle-theme="toggleTheme"
        />
      </div>
    </div>


    <!-- 主要内容区域 -->
    <el-main class="dashboard-main">
      <div class="content-wrapper">
        <template v-if="activeNav === 'home'">
          <StatsPanel 
            :loading="!activity || !runInfo || statsLoading"
            :activity="activity"
            :run-info="runInfo"
          />
          <SubmitForm
            :form-state="formState"
            :submitting="submitting"
            :distance-limits="{ min: distanceMin, max: distanceMax }"
            :time-limits="{ min: timeMin, max: timeMax }"
            @submit="handleSubmit"
            @random-fill="fillRandomData"
          />

                <div class="notice-container">
        <NoticeBoard />
      </div>
        </template>

        <template v-else-if="activeNav === 'records'">
          <RunRecords
            :records="records"
            :loading="recordsLoading"
            :pagination="pagination"
            @pageChange="handleTableChange"
          />
        </template>
      </div>
    </el-main>


    <!-- 底部固定导航 -->
    <div class="dashboard-footer">
      <!-- 公告栏 -->
      <div class="footer-container">
        <el-menu
          mode="horizontal"
          :default-active="activeNav"
          @select="handleNavSelect"
          class="nav-bar"
        >
          <el-menu-item index="home">数据</el-menu-item>
          <el-menu-item index="records">记录</el-menu-item>
        </el-menu>
      </div>
    </div>
  </el-container>
</template>

<style scoped>
.dashboard-container {
  height: 100vh;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--background-color);
  background-image:
    linear-gradient(var(--grid-color) 1px, transparent 1px), /* 垂直线 */
    linear-gradient(90deg, var(--grid-color) 1px, transparent 1px); /* 水平线 */
  background-size: 20px 20px;
  background-position: 0 0;
  border: var(--dashboard-border);
}

/* 顶部固定区域 */
.dashboard-fixed-area {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

/* 头部容器 */
.header-container {
  position: relative;
  background-color: transparent;
  width: 100%;
}

/* 公告栏容器 */
.notice-container {
  width: 100%;
  background: none;
}


/* 主要内容区域 */
.dashboard-main {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 调整上下边距 */
  margin-top: calc(70px + env(safe-area-inset-top));
  margin-bottom: calc(50px + env(safe-area-inset-bottom));
  -ms-overflow-style: none;
  scrollbar-width: none;
  border: var(--dashboard-);
}

.content-wrapper {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

/* 底部固定导航 */
.dashboard-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: var(--background-color);
  max-width: 600px;
  margin: 0 auto;
}

.footer-container {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
  border: none;
}

.nav-bar {
  height: 50px;
  width: 100%;
  display: flex;
  justify-content: space-around;
  background-color: var(---nav-background-color)
}

/* 移动端适配 */
@media screen and (max-width: 480px) {
  .dashboard-main {
    margin-top: calc(70px + env(safe-area-inset-top));
    margin-bottom: calc(45px + env(safe-area-inset-bottom));
  }

  .nav-bar {
    height: 45px;
  }

  .dashboard-footer {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* 隐藏滚动条 */
.dashboard-main::-webkit-scrollbar {
  display: none;
}
</style>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from "vue";
import { useUserStore } from "@/stores/user";
import { useAuth } from "@/composables/useAuth";
import { useDashboard } from "@/composables/useDashboard";
import { useRunStandard } from "@/composables/useRunStandard";
import { getSchoolMaps } from "@/utils/map";
import { useSubmitActivity } from "@/composables/useSubmitActivity";

// 导入组件
import DashboardHeader from "@/components/DashboardHeader.vue";
import SubmitForm from "@/components/SubmitForm.vue";
import StatsPanel from "@/components/StatsPanel.vue";
import RunRecords from "@/components/RunRecords.vue";
import NoticeBoard from "@/components/NoticeBoard.vue";
import { ElMessage } from "element-plus";

const userStore = useUserStore();
const { logout } = useAuth();
const {
  loading: dashboardLoading,
  activity,
  runInfo,
  runDistanceMin,
  runDistanceMax,
  runTimeMin,
  runTimeMax,
  records,
  pagination,
  handleTableChange: fetchPageData,
  refreshData,
  initDashboard,
} = useDashboard();

const distanceMin = computed(() => runDistanceMin.value)
const distanceMax = computed(() => runDistanceMax.value)
const timeMin = computed(() => runTimeMin.value)
const timeMax = computed(() => runTimeMax.value)

const { submit: submitActivity, isSubmitting } = useSubmitActivity();

const activeNav = ref("home");
const handleNavSelect = (index: string) => {
  activeNav.value = index;
};

const { showEndDate } = useRunStandard();
const isDarkMode = ref(userStore.$state.isDarkMode);

const handleLogout = () => {
  logout();
};

const toggleTheme = () => {
  userStore.toggleDarkMode();
  isDarkMode.value = userStore.$state.isDarkMode;
};

// 生成1-9之间的随机整数
const getRandomSingleDigit = (): number => Math.floor(Math.random() * 9) + 1;

// 检查是否为整数
const ensureNotRoundNumber = (num: number): number => {
  if (num.toString().endsWith('0')) {
    return Math.floor(num / 10) * 10 + getRandomSingleDigit();
  }
  return num;
};

const formRef = ref();
const submitting = ref(false);
const formState = reactive({
  distance: ensureNotRoundNumber(runDistanceMin.value),
  duration: ensureNotRoundNumber(runTimeMin.value),
  route: "",
});


// 提交新记录
const handleSubmit = async () => {
  try {
    if (!userStore.userInfo?.userId) {
      ElMessage.error("用户信息不完整");
      return;
    }

    formState.distance = ensureNotRoundNumber(formState.distance);
    formState.duration = ensureNotRoundNumber(formState.duration);

    submitting.value = true;
    await submitActivity(
      formState.distance,
      formState.duration,
      formState.route,
      userStore.userInfo.userId
    );
    await refreshData();
  } catch (error) {
    console.error(error);
  } finally {
    submitting.value = false;
  }
};

const statsLoading = ref(true);
const recordsLoading = ref(true);

// 随机填充数据
const fillRandomData = () => {
  try {
    // 检查必需值
    if (!runDistanceMax.value || !runDistanceMin.value || !runTimeMax.value || !runTimeMin.value) {
      ElMessage.error('获取限制值失败，请刷新页面重试');
      return;
    }

    // 设置随机路线
    if (!formState.route) {
      const maps = getSchoolMaps();
      if (maps.length === 0) {
        ElMessage.error('获取地图列表失败');
        return;
      }
      formState.route = maps[Math.floor(Math.random() * maps.length)].value;
    }

    // 生成随机值并确保不是整十数
    const distance = Math.floor(Math.random() * (runDistanceMax.value - runDistanceMin.value) + runDistanceMin.value);
    const time = Math.floor(Math.random() * (runTimeMax.value - runTimeMin.value) + runTimeMin.value);
    
    formState.distance = ensureNotRoundNumber(distance);
    formState.duration = ensureNotRoundNumber(time);

  } catch (error) {
    console.error('生成随机数据失败:', error);
    ElMessage.error('生成随机数据失败，请重试');
  }
};

// 分页切换
const handleTableChange = async (currentPage: number) => {
  recordsLoading.value = true;
  try {
    await fetchPageData(currentPage);
  } finally {
    recordsLoading.value = false;
  }
};

// 刷新数据
const handleRefreshData = async () => {
  statsLoading.value = true;
  recordsLoading.value = true;

  try {
    await refreshData();
  } catch (error) {
    console.error("Failed to refresh data:", error);
    ElMessage.error("数据刷新失败");
  } finally {
    statsLoading.value = false;
    recordsLoading.value = false;
  }
};

onMounted(async () => {
  statsLoading.value = true;
  recordsLoading.value = true;
  try {
    await Promise.all([initDashboard()]);
  } catch (error) {
    console.error("Failed to load data:", error);
    ElMessage.error("数据加载失败");
  } finally {
    statsLoading.value = false;
    recordsLoading.value = false;
  }
});
</script>
