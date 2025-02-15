<template>
  <el-container class="dashboard-container">
    <el-header class="dashboard-header">
      <div class="dashboard-header-content">
        <img
          src="@/assets/logo.png"
          alt="logo"
          class="logo"
          @click="refreshData()"
        />
        <div class="header-right">
          <div class="header-icon-button" @click="toggleTheme">
            <el-icon v-if="!isDarkMode"><MoonIcon /></el-icon>
            <el-icon v-else><SunnyIcon /></el-icon>
          </div>
          <a
            :href="config.urls.github"
            target="_blank"
            rel="noopener noreferrer"
            class="header-icon-button"
          >
            <el-icon><GithubIcon /></el-icon>
          </a>
          <el-dropdown
            @command="handleCommand"
            trigger="click"
            placement="bottom-end"
          >
            <div class="header-icon-button">
              <el-icon><SettingsIcon /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="menu-item">
                <el-dropdown-item command="refresh">
                  <el-icon>
                    <UserIcon />
                  </el-icon>
                  {{ userStore.userInfo?.name }}
                </el-dropdown-item>
                <el-dropdown-item command="refresh">
                  <el-icon>
                    <RefreshIcon />
                  </el-icon>
                  刷新数据
                </el-dropdown-item>
                <el-dropdown-item command="showEndDate">
                  <el-icon><AlarmClockIcon /></el-icon>
                  截止日期
                </el-dropdown-item>
                <el-dropdown-item command="logout">
                  <el-icon>
                    <LogoutIcon />
                  </el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <!-- 公告板 -->
    <NoticeBoard />

    <el-main class="dashboard-content">
      <!-- 横向导航栏 -->
      <el-menu
        mode="horizontal"
        :default-active="activeNav"
        @select="handleNavSelect"
        class="nav-bar"
      >
        <el-menu-item index="home"
          >数据</el-menu-item
        >
        <el-menu-item index="records"
          >记录</el-menu-item
        >
      </el-menu>

      <!-- 根据导航项切换显示 -->
      <template v-if="activeNav === 'home'">
        <!-- 数据概述 -->
        <div class="stats-panel">
          <el-skeleton
            :loading="!activity || !runInfo || statsLoading"
            animated
          >
            <template #template>
              <el-row :gutter="16">
                <el-col :span="8">
                  <div class="stats-skeleton">
                    <el-skeleton-item
                      variant="text"
                      style="width: 30%; margin-bottom: 8px"
                    />
                    <el-skeleton-item variant="text" style="width: 50%" />
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stats-skeleton">
                    <el-skeleton-item
                      variant="text"
                      style="width: 30%; margin-bottom: 8px"
                    />
                    <el-skeleton-item variant="text" style="width: 50%" />
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stats-skeleton">
                    <el-skeleton-item
                      variant="text"
                      style="width: 30%; margin-bottom: 8px"
                    />
                    <el-skeleton-item variant="text" style="width: 50%" />
                  </div>
                </el-col>
              </el-row>
            </template>
            <template #default>
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-statistic
                    title="俱乐部完成率"
                    :value="activity?.joinNum || 0"
                    value-style="color: #409EFF;"
                  >
                    <template #suffix
                      >/{{
                        activity ? activity.totalNum.toFixed(0) : "0"
                      }}</template
                    >
                  </el-statistic>
                </el-col>
                <el-col :span="8">
                  <el-statistic
                    title="校园跑完成率"
                    :value="activity?.runJoinNum || 0"
                    value-style="color: #409EFF;"
                  >
                    <template #suffix
                      >/{{
                        activity ? activity.runTotalNum.toFixed(0) : "0"
                      }}</template
                    >
                  </el-statistic>
                </el-col>
                <el-col :span="8">
                  <el-statistic
                    title="里程完成率"
                    :value="
                      runInfo
                        ? +(runInfo.runValidDistance / 1000).toFixed(2)
                        : 0
                    "
                    value-style="color: #409EFF;"
                  >
                    <template #suffix>
                      /{{
                        runInfo
                          ? (runInfo.needRunDistance / 1000).toFixed(0)
                          : "0"
                      }}
                    </template>
                  </el-statistic>
                </el-col>
              </el-row>
            </template>
          </el-skeleton>
        </div>

        <!-- 提交新记录 -->
        <el-card class="submit-card">
          <el-form
            ref="formRef"
            :model="formState"
            :rules="rules"
            label-position="left"
            label-width="auto"
          >
            <el-row :gutter="16">
              <el-col :xs="24" :sm="12">
                <el-form-item label="跑步里程" prop="distance">
                  <el-input-number
                    v-model="formState.distance"
                    :min="distanceMin"
                    :max="distanceMax"
                    :controls="false"
                    style="width: 100%"
                    placeholder="请输入跑步里程（米）"
                  >
                    <template #append>米</template>
                  </el-input-number>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="跑步时长" prop="duration">
                  <el-input-number
                    v-model="formState.duration"
                    :min="timeMin"
                    :max="timeMax"
                    :controls="false"
                    style="width: 100%"
                    placeholder="请输入跑步时长（分钟）"
                  >
                    <template #append>分钟</template>
                  </el-input-number>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="地图选择" prop="route">
              <el-select
                v-model="formState.route"
                style="width: 100%"
                placeholder="请选择学校地图"
              >
                <el-option
                  v-for="map in getSchoolMaps()"
                  :key="map.value"
                  :label="map.label"
                  :value="map.value"
                />
              </el-select>
            </el-form-item>

            <div
              class="form-info"
              v-if="formState.distance && formState.duration"
            >
              <span :class="{ 'text-error': !paceLimit }">
                当前配速:
                {{
                  formState.distance === 0
                    ? "0:00"
                    : formatPace(formState.duration, formState.distance)
                }}/公里
              </span>
            </div>

            <div class="form-footer">
              <el-button
                type="text"
                @click="fillRandomData"
                :disabled="submitting"
                class="randomBtn"
              >
                随机填充
              </el-button>
              <el-button
                type="primary"
                @click="handleSubmit"
                :loading="submitting"
                class="submit-btn"
                style="width: 100%"
              >提交记录
              </el-button>
            </div>

            <!-- 添加地图显示 -->
            <el-skeleton
              :loading="!formState.route"
              class="map-container"
              animated
            >
              <template #template>
                <div class="map-skeleton-content">
                  <el-icon class="map-skeleton-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                    >
                      <mask id="lineMdCompassLoop0">
                        <g
                          fill="none"
                          stroke="#fff"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                        >
                          <path
                            stroke-dasharray="64"
                            stroke-dashoffset="64"
                            d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"
                          >
                            <animate
                              fill="freeze"
                              attributeName="stroke-dashoffset"
                              dur="0.6s"
                              values="64;0"
                            />
                          </path>
                          <path
                            fill="#fff"
                            stroke="none"
                            d="M11 11L12 12L13 13L12 12z"
                            transform="rotate(-180 12 12)"
                          >
                            <animate
                              fill="freeze"
                              attributeName="d"
                              begin="0.6s"
                              dur="0.3s"
                              values="M11 11L12 12L13 13L12 12z;M10.2 10.2L17 7L13.8 13.8L7 17z"
                            />
                            <animateTransform
                              attributeName="transform"
                              dur="9s"
                              repeatCount="indefinite"
                              type="rotate"
                              values="-180 12 12;0 12 12;0 12 12;0 12 12;0 12 12;270 12 12;-90 12 12;0 12 12;-180 12 12;-35 12 12;-40 12 12;-45 12 12;-45 12 12;-110 12 12;-135 12 12;-180 12 12"
                            />
                          </path>
                          <circle
                            cx="12"
                            cy="12"
                            r="1"
                            fill="#000"
                            fill-opacity="0"
                            stroke="none"
                          >
                            <animate
                              fill="freeze"
                              attributeName="fill-opacity"
                              begin="0.9s"
                              dur="0.15s"
                              values="0;1"
                            />
                          </circle>
                        </g>
                      </mask>
                      <rect
                        width="24"
                        height="24"
                        fill="currentColor"
                        mask="url(#lineMdCompassLoop0)"
                      />
                    </svg>
                  </el-icon>
                </div>
              </template>
              <template #default>
                <div v-show="formState.route" class="map-content">
                  <RunMap
                    :map-choice="formState.route"
                    :visible="showMap"
                    :distance="formState.distance"
                    :duration="formState.duration"
                  />
                </div>
              </template>
            </el-skeleton>
          </el-form>
        </el-card>
      </template>

      <!-- 历史记录 -->
      <template v-else-if="activeNav === 'records'">
        <el-card
          class="records-card"
          v-loading="recordsLoading"
          element-loading-text="记录加载中"
        >
          <div class="records-list">
            <el-skeleton :loading="recordsLoading" animated :count="10">
              <template #template>
                <div style="padding: 2px">
                  <el-skeleton-item
                    variant="p"
                    style="width: 100%; height: 5px"
                  />
                </div>
              </template>
              <template #default>
                <el-table
                  :data="records"
                  v-if="records.length > 0"
                  table-layout="auto"
                  border
                  stripe
                  height="calc(100vh - 300px)"
                  style="width: 100%"
                >
                  <el-table-column
                    prop="recordDate"
                    label="记录时间"
                    fixed
                    sortable
                    align="center"
                  />
                  <el-table-column
                    prop="defeatedInfo"
                    label="状态"
                    align="center"
                  >
                    <template #default="{ row }">
                      <div class="status-container">
                        <el-icon
                          :style="{
                            color:
                              row.defeatedInfo === '有效跑步'
                                ? '#409EFF'
                                : '#F56C6C',
                          }"
                        >
                          <component
                            :is="
                              row.defeatedInfo === '有效跑步'
                                ? SuccessFilled
                                : CircleCloseFilled
                            "
                          />
                        </el-icon>
                        {{ row.defeatedInfo }}
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    type="expand"
                    min-width="10"
                    label=""
                    align="center"
                  >
                    <template #default="{ row }">
                      <el-form
                        label-position="left"
                        inline
                        class="expanded-form"
                      >
                        <el-form-item label="跑步时长">
                          {{ row.runTime }} 分钟
                        </el-form-item>
                        <el-form-item label="跑步里程">
                          {{ (row.runDistance / 1000).toFixed(2) }} 公里
                        </el-form-item>
                        <el-form-item label="平均配速">
                          {{ formatPace(row.runTime, row.runDistance) }}
                        </el-form-item>
                      </el-form>
                    </template>
                  </el-table-column>
                </el-table>
                <el-empty v-else description="暂无跑步记录" />
              </template>
            </el-skeleton>
          </div>

          <div class="pagination">
            <el-pagination
              :currentPage="pagination.current"
              :total="pagination.total"
              :page-size="pagination.pageSize"
              layout="pager"
              @current-change="handleTableChange"
            />
          </div>
        </el-card>
      </template>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, h, computed, watch } from "vue";
import { useUserStore } from "@/stores/user";
import { useAuth } from "@/composables/useAuth";
import { useDashboard } from "@/composables/useDashboard";
import { useRunStandard } from "@/composables/useRunStandard";
import { formatPace } from "@/utils/format";
import { getSchoolMaps } from "@/utils/map";
import { useSubmitActivity } from "@/composables/useSubmitActivity";
import type { RunRecord } from "@/types/run";
import NoticeBoard from "@/components/NoticeBoard.vue";
import { config } from "@/config";
import { ElMessage } from "element-plus";
import {
  SuccessFilled,
  CircleCloseFilled,
  MagicStick,
} from "@element-plus/icons-vue";
import RunMap from "@/components/RunMap.vue";

// 导入图标
import {
  UserIcon,
  SettingsIcon,
  MoonIcon,
  SunnyIcon,
  GithubIcon,
  LogoutIcon,
  AlarmClockIcon,
  RefreshIcon,
} from "@/components/icons";

const userStore = useUserStore();
const { logout } = useAuth();
const {
  loading: dashboardLoading,
  activity,
  runInfo,
  runStandardData,
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

const { submit: submitActivity, isSubmitting } = useSubmitActivity();

const activeNav = ref("home");
const handleNavSelect = (index: string) => {
  activeNav.value = index;
  // 可根据需求添加额外逻辑，如路由跳转
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

const formRef = ref();
const submitting = ref(false);
const formState = reactive({
  distance: runDistanceMin.value,
  duration: runTimeMin.value,
  route: "",
});

// 添加地图显示控制
const showMap = ref(false);

// 监听路线选择变化
watch(
  () => formState.route,
  (newVal) => {
    if (newVal) {
      showMap.value = true;
    }
  }
);

// 计算配速限制
const paceLimit = computed(() => {
  if (!formState.distance || !formState.duration || formState.distance === 0)
    return true;
  const paceInMinutes = (formState.duration * 60) / (formState.distance / 1000);
  return !isNaN(paceInMinutes) && paceInMinutes >= 6;
});

// 获取里程和时间限制
const distanceMin = runDistanceMin.value;
const distanceMax = runDistanceMax.value + 2333;
const timeMin = runTimeMin.value;
const timeMax = runTimeMax.value + 23;

// 校验规则
const rules = {
  distance: [
    { required: true, message: "请输入跑步里程" },
    {
      type: "number",
      min: distanceMin,
      message: `最小里程为 ${distanceMin} 米`,
    },
    {
      type: "number",
      max: distanceMax,
      message: `最大里程为 ${distanceMax} 米`,
    },
  ],
  duration: [
    { required: true, message: "请输入跑步时长" },
    { type: "number", min: timeMin, message: `最小时长为 ${timeMin} 分钟` },
    { type: "number", max: timeMax, message: `最大时长为 ${timeMax} 分钟` },
  ],
  route: [{ required: true, message: "请选择学校地图" }],
};

const columns = [
  {
    title: "日期",
    dataIndex: "recordDate",
    key: "recordDate",
    width: 120,
  },
  {
    title: "里程",
    dataIndex: "runDistance",
    key: "runDistance",
    width: 100,
    align: "right" as const,
  },
  {
    title: "时长",
    dataIndex: "runTime",
    key: "runTime",
    width: 100,
    align: "right" as const,
  },
  {
    title: "配速",
    dataIndex: "runSpeed",
    key: "runSpeed",
    width: 100,
    align: "right" as const,
    customRender: ({ record }: { record: RunRecord }) =>
      formatPace(
        record.runValidTime || record.runTime,
        record.runValidDistance || record.runDistance
      ),
  },
  {
    title: "状态",
    dataIndex: "defeatedInfo",
    key: "defeatedInfo",
    customRender: ({ text, record }: { text: string; record: any }) =>
      h("span", [
        h({
          icon:
            record.runStatus === "1"
              ? "ph:check-circle-fill"
              : "ph:x-circle-fill",
          style: {
            color: record.runStatus === "1" ? "#52c41a" : "#ff4d4f",
            marginRight: "8px",
            fontSize: "16px",
            verticalAlign: "middle",
          },
        }),
        text,
      ]),
  },
];

const handleSubmit = async () => {
  try {
    await formRef.value.validate();

    if (!paceLimit.value) {
      ElMessage.error("配速不能小于6分钟/公里");
      return;
    }

    if (!userStore.userInfo?.userId) {
      ElMessage.error("用户信息不完整");
      return;
    }

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

const handleCommand = (command: string) => {
  switch (command) {
    case "refresh":
      handleRefreshData();
      break;
    case "showEndDate":
      showEndDate();
      break;
    case "logout":
      handleLogout();
      break;
  }
};

// 修改 fillRandomData 函数
const fillRandomData = () => {
  // 如果没有选择地图，随机选择一个地图
  if (!formState.route) {
    const maps = getSchoolMaps();
    const randomMapIndex = Math.floor(Math.random() * maps.length);
    formState.route = maps[randomMapIndex].value;
  }

  // 生成随机的距离和时间，确保配速大于6分钟每公里
  let distance, time, pace;
  do {
    distance = Math.random() * (distanceMax - distanceMin) + distanceMin;
    time = Math.random() * (timeMax - timeMin) + timeMin;
    pace = time / (distance / 1000); // 计算配速
  } while (pace <= 6); // 确保配速大于6分钟每公里

  formState.distance = Math.round(distance);
  formState.duration = Math.round(time);
};

const handleTableChange = async (currentPage: number) => {
  recordsLoading.value = true;
  try {
    await fetchPageData(currentPage);
  } finally {
    recordsLoading.value = false;
  }
};

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

<style scoped>

.status-container {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 100px;
    /* 确保最小宽度一致 */
  }
  
  /* 确保图标大小一致 */
  .status-container .el-icon {
    font-size: 16px;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  
  .dashboard-container {
    height: auto;
    width: 100%;
    background-color: var(--dashboard-container-bg-color);
    align-content: center;
    justify-content: center;
    display: flex;
    padding: 0 16px;
    flex-direction: column;
    gap: 1px;
    align-items: center;
  }
  
  .dashboard-header {
    background: var(--dashboard-container-bg-color);
    border-radius: 50px;
    margin: 10px 0;
    height: 40px;
    width: 100%;
    max-width: 600px;
    min-width: auto;
    box-shadow: var(--dashboard-header-box-shadow);
    border: var(--dashboard-header-border);
    transition: all 0.3s ease;
  }
  
  .dashboard-header:hover {
    transform: translateY(-2px);
  }
  .dashboard-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .user-menu {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--primary-text);
    cursor: pointer;
    border: none;
  }
  
  .settings-menu {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s;
  }
  
  .menu-item {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    align-items: center;
  }
  
  .dashboard-content {
    width: 100%;
    max-width: 600px;
    min-width: auto;
    margin: 10px 0;
    padding: 16px 0;
    background-color: var(--dashboard-content-bg-color);
    border: var(--dashboard-content-border);
    border-radius: 20px;
    box-shadow: var(--dashboard-content-box-shadow);
    transition: all 0.3s ease;
  }
  .dashboard-content:hover {
    transform: translateY(-2px);
  }
  
  /* 添加响应式布局 */
  @media screen and (max-width: 480px) {
    .dashboard-container {
      padding: 0 8px;
    }
    
    .dashboard-content {
      padding: 8px;
    }
  
    /* 优化表单在移动端的展示 */
    .el-form-item {
      margin-bottom: 12px;
    }
  
    /* 调整移动端的表格显示 */
    :deep(.el-table) {
      font-size: 12px;
    }
  
    /* 优化状态展示 */
    .status-container {
      min-width: 60px;
      font-size: 12px;
    }
  }
  
  /* 优化表格滚动 */
  :deep(.el-table) {
    width: 100% !important;
    overflow-x: auto;
  }
  
  /* 数据状态板 */
  .stats-panel {
    background-color: var(--stats-panel-bg-color);
    border: var(--stats-panel-border);
    text-align: center;
    padding: 20px 0 10px 0;
    color: var(--el-text-color-primary);
    padding: 16px 8px;
    overflow-x: auto;
  }
  
  .stats-skeleton {
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  /* 提交表单卡片 */
  .submit-card {
    background-color: var(--submit-card-bg-color);
    border: var(--submit-card-border);
    box-shadow: var(--submit-card-box-shadow);
    border-radius: 0px;
    color: var(--el-text-color-primary);
    overflow: hidden;
    transition: none;
  }
  
  /* 记录表格卡片 */
  .records-card {
    background-color: var(--records-card-bg-color);
    box-shadow: none;
    border: none;
    color: var(--el-text-color-primary);
    overflow: hidden;
    transition: none;
  }
  
  .add-record-btn {
    margin-bottom: 10px;
  }
  
  .logo {
    height: 24px;
    width: 24px;
    margin-right: 24px;
    object-fit: contain;
    cursor: pointer;
    filter: brightness(var(--logo-value));
  }
  
  .nav-bar {
    gap: 20px;
    align-items: center;
    justify-content: center;
    height: 40px;
  }
  
  .records-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .record-item {
    background-color: var(--secondary-bg);
  }
  
  .record-status {
    display: inline-flex;
    align-items: center;
    color: var(--primary-text);
    font-size: 14px;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    margin: 15px 0 0 0;
  }
  
  .form-info {
    margin: 10px 0 20px 0;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    text-align: center;
    transition: all 0.3s;
  }
  
  .form-footer {
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    display: flex;
  }
  
  .randomBtn {
    color: var(--el-text-color-secondary);
    width: 100%;
  }
  
  .text-error {
    color: var(--el-color-danger);
  }
  
  .header-icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    cursor: pointer;
    border-radius: 4px;
    color: var(--el-text-color-primary);
    transition: all 0.3s;
  }
  
  .header-icon-button:hover {
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-primary);
  }
  
  .map-container {
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    overflow: hidden;
    height: 200px;
    margin: 24px 0 5px 0;
  }
  
  .map-skeleton-content {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--el-fill-color-light);
    height: 100%;
  }
  
  .map-skeleton-icon {
    font-size: 50px;
    color: var(--el-text-color-placeholder);
  }
  
  .status-container {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  
  .status-container .el-icon {
    font-size: 16px;
  }
  
  .expanded-form {
    padding: 16px;
  }
  
  .expanded-form :deep(.el-form-item) {
    margin-bottom: 0;
  }
  
  .expanded-form :deep(.el-form-item__label) {
    color: var(--el-text-color-secondary);
  }</style>