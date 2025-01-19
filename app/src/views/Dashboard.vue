<template>
    <el-container class="dashboard-layout">
        <el-header class="header">
            <div class="header-content">
                <img src="@/assets/logo.png" alt="logo" class="logo" @click="refreshData()" />
                <div class="header-right">
                    <div class="header-icon-button" @click="toggleTheme">
                        <el-icon>
                            <component :is="isDarkMode ? 'Sunny' : 'Moon'" />
                        </el-icon>
                    </div>
                    <a :href="config.urls.github" target="_blank" rel="noopener noreferrer" class="header-icon-button">
                        <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" data-v-87052479="">
                            <path fill="currentColor"
                                d="M12 2C6.475 2 2 6.475 2 12a9.994 9.994 0 0 0 6.838 9.488c.5.087.687-.213.687-.476c0-.237-.013-1.024-.013-1.862c-2.512.463-3.162-.612-3.362-1.175c-.113-.288-.6-1.175-1.025-1.413c-.35-.187-.85-.65-.013-.662c.788-.013 1.35.725 1.538 1.025c.9 1.512 2.338 1.087 2.912.825c.088-.65.35-1.087.638-1.337c-2.225-.25-4.55-1.113-4.55-4.938c0-1.088.387-1.987 1.025-2.688c-.1-.25-.45-1.275.1-2.65c0 0 .837-.262 2.75 1.026a9.28 9.28 0 0 1 2.5-.338c.85 0 1.7.112 2.5.337c1.912-1.3 2.75-1.024 2.75-1.024c.55 1.375.2 2.4.1 2.65c.637.7 1.025 1.587 1.025 2.687c0 3.838-2.337 4.688-4.562 4.938c.362.312.675.912.675 1.85c0 1.337-.013 2.412-.013 2.75c0 .262.188.574.688.474A10.016 10.016 0 0 0 22 12c0-5.525-4.475-10-10-10z">
                            </path>
                        </svg>
                    </a>
                    <el-dropdown @command="handleCommand" trigger="click" placement="bottom-end">
                        <div class="header-icon-button">
                            <el-icon>
                                <Menu />
                            </el-icon>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu class="menu-item">
                                <el-dropdown-item command="refresh">
                                    <el-icon>
                                        <Avatar />
                                    </el-icon>
                                    {{ userStore.userInfo?.name }}
                                </el-dropdown-item>
                                <el-dropdown-item command="refresh">
                                    <el-icon>
                                        <Refresh />
                                    </el-icon>
                                    刷新数据
                                </el-dropdown-item>
                                <el-dropdown-item command="logout">
                                    <el-icon>
                                        <SwitchButton />
                                    </el-icon>
                                    退出登录
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
        </el-header>

        <el-main class="content">
            <!-- 公告板 -->
            <NoticeBoard />

            <!-- 数据概述 -->
            <div class="stats-panel">
                <el-skeleton :loading="!activity || !runInfo || statsLoading" animated>
                    <template #template>
                        <el-row :gutter="16">
                            <el-col :span="12">
                                <div class="stats-skeleton">
                                    <el-skeleton-item variant="text" style="width: 30%; margin-bottom: 8px;" />
                                    <el-skeleton-item variant="text" style="width: 50%;" />
                                </div>
                            </el-col>
                            <el-col :span="12">
                                <div class="stats-skeleton">
                                    <el-skeleton-item variant="text" style="width: 30%; margin-bottom: 8px;" />
                                    <el-skeleton-item variant="text" style="width: 50%;" />
                                </div>
                            </el-col>
                        </el-row>
                    </template>
                    <template #default>
                        <el-row :gutter="16">
                            <el-col :span="12">
                                <el-statistic v-if="activity" title="校园跑完成率" :value="activity.running_completion_rate"
                                    value-style="color: #409EFF;" />
                                <el-statistic v-else title="校园跑完成率" value="0" />
                            </el-col>
                            <el-col :span="12">
                                <el-statistic v-if="runInfo" title="里程完成率"
                                    :value="`${(runInfo.runValidDistance / 1000).toFixed(2)}/${(runInfo.needRunDistance / 1000).toFixed(0)}KM`"
                                    value-style="color: #409EFF;" />
                                <el-statistic v-else title="里程完成率" value="0/0KM" />
                            </el-col>
                        </el-row>
                    </template>
                </el-skeleton>
            </div>

            <!-- 提交新记录 -->
            <el-card class="submit-card">
                <template #header>提交新记录</template>
                <el-form ref="formRef" :model="formState" :rules="rules" label-position="top">
                    <el-row :gutter="16">
                        <el-col :xs="24" :sm="12">
                            <el-form-item label="跑步距离" prop="distance">
                                <el-input-number v-model="formState.distance" :min="distanceMin" :max="distanceMax"
                                    :controls="false" style="width: 100%">
                                    <template #append>米</template>
                                </el-input-number>
                            </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="12">
                            <el-form-item label="跑步时长" prop="duration">
                                <el-input-number v-model="formState.duration" :min="timeMin" :max="timeMax"
                                    :controls="false" style="width: 100%">
                                    <template #append>分钟</template>
                                </el-input-number>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="地图选择" prop="route">
                        <el-select v-model="formState.route" style="width: 100%;">
                            <el-option v-for="map in getSchoolMaps()" :key="map.value" :label="map.label"
                                :value="map.value" />
                        </el-select>
                    </el-form-item>

                    <div class="form-info" v-if="formState.distance && formState.duration">
                        <span :class="{ 'text-error': !paceLimit }">
                            当前配速:
                            {{ formatPace(formState.duration, formState.distance) }}/公里
                        </span>
                    </div>

                    <div class="form-footer">
                        <el-button @click="fillRandomData" :disabled="submitting">
                            <el-icon>
                                <MagicStick />
                            </el-icon>
                            随机填充
                        </el-button>
                        <el-button type="primary" @click="handleSubmit" :loading="submitting" class="submit-btn">
                            提交记录
                        </el-button>
                    </div>
                </el-form>
            </el-card>

            <!-- 历史记录 -->
            <el-card class="records-card" v-loading="recordsLoading" element-loading-text="记录加载中">
                <template #header>跑步记录</template>
                <div class="records-list">
                    <el-skeleton :loading="recordsLoading" animated :count="3">
                        <template #template>
                            <div style="padding: 14px">
                                <el-skeleton-item variant="p" style="width: 100%; height: 100px; margin: 8px 0" />
                            </div>
                        </template>
                        <template #default>
                            <div v-for="record in records" :key="record.recordId">
                                <el-descriptions class="margin-top" :key="record.recordId" :column="1" border>
                                    <el-descriptions-item label="记录时间">
                                        {{ record.createTime }}
                                    </el-descriptions-item>
                                    <el-descriptions-item label="跑步时长">
                                        {{ record.runTime }} 分钟
                                    </el-descriptions-item>
                                    <el-descriptions-item label="跑步里程">
                                        {{ (record.runDistance / 1000).toFixed(2) }} 公里
                                    </el-descriptions-item>
                                    <el-descriptions-item label="平均配速">
                                        {{ formatPace(record.runTime, record.runDistance) }}
                                    </el-descriptions-item>
                                    <el-descriptions-item label="状态">
                                        <div class="status-container">
                                            <el-icon :style="{
                                                color: record.defeatedInfo === '有效跑步' ? 'blue' : 'red',
                                            }">
                                                <component :is="record.defeatedInfo === '有效跑步'
                                                    ? SuccessFilled
                                                    : CircleCloseFilled
                                                    " />
                                            </el-icon>
                                            {{ record.defeatedInfo }}
                                        </div>
                                    </el-descriptions-item>
                                </el-descriptions>
                            </div>
                            <el-empty v-if="!recordsLoading && records.length === 0" description="暂无跑步记录" />
                        </template>
                    </el-skeleton>
                </div>
                <div class="pagination">
                    <el-pagination v-model:currentPage="pagination.current" :total="pagination.total"
                        :page-size="pagination.pageSize" layout="prev, pager, next"
                        @current-change="handleTableChange" />
                </div>
            </el-card>
        </el-main>
    </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, h, computed } from "vue";
import { useUserStore } from "@/stores/user";
import { useAuth } from "@/composables/useAuth";
import { useDashboard } from "@/composables/useDashboard";
import { formatPace } from "@/utils/format";
import { getSchoolMaps } from "@/utils/map";
import { useSubmitActivity } from "@/composables/useSubmitActivity";
import type { RunRecord } from "@/types/run";
import NoticeBoard from "@/components/NoticeBoard.vue";
import { config } from "@/config";
import { ElMessage } from "element-plus";
import { SuccessFilled, CircleCloseFilled, Loading, MagicStick, Operation, Avatar } from "@element-plus/icons-vue";
import DarkIcon from "@/components/icons/DarkIcon.vue";
import LightIcon from "@/components/icons/LightIcon.vue";

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
    initDashboard
} = useDashboard();

const { submit: submitActivity, isSubmitting } = useSubmitActivity();

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

// 计算配速限制
const paceLimit = computed(() => {
    if (!formState.distance || !formState.duration) return true;
    const paceInMinutes = (formState.duration * 60) / (formState.distance / 1000);
    return paceInMinutes >= 6;
});

// 获取距离和时间限制
const distanceMin = runDistanceMin.value;
const distanceMax = runDistanceMax.value + 2333;
const timeMin = runTimeMin.value;
const timeMax = runTimeMax.value + 23;

// 校验规则
const rules = {
    distance: [
        { required: true, message: "请输入跑步距离" },
        {
            type: "number",
            min: distanceMin,
            message: `最小距离为 ${distanceMin} 米`,
        },
        {
            type: "number",
            max: distanceMax,
            message: `最大距离为 ${distanceMax} 米`,
        },
    ],
    duration: [
        { required: true, message: "请输入跑步时长" },
        { type: "number", min: timeMin, message: `最小时长为 ${timeMin} 分钟` },
        { type: "number", max: timeMax, message: `最大时长为 ${timeMax} 分钟` },
    ],
    route: [{ required: true, message: "请选择跑步路线" }],
};

const columns = [
    {
        title: "日期",
        dataIndex: "recordDate",
        key: "recordDate",
        width: 120,
    },
    {
        title: "距离",
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
        case "logout":
            handleLogout();
            break;
    }
};

// 添加随机填充函数
const fillRandomData = () => {
    let distance, time, pace;
    do {
        distance = Math.random() * (distanceMax - distanceMin) + distanceMin;
        time = Math.random() * (timeMax - timeMin) + timeMin;
        pace = time / (distance / 1000); // 计算配速
    } while (pace <= 6); // 确保配速大于6分钟每公里

    const maps = getSchoolMaps();
    const randomMapIndex = Math.floor(Math.random() * maps.length);

    formState.distance = Math.round(distance);
    formState.duration = Math.round(time);
    formState.route = maps[randomMapIndex].value;
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
        console.error('Failed to refresh data:', error);
        ElMessage.error('数据刷新失败');
    } finally {
        statsLoading.value = false;
        recordsLoading.value = false;
    }
};

onMounted(async () => {
    statsLoading.value = true;
    recordsLoading.value = true;
    try {
        await Promise.all([
            initDashboard(),
        ]);
    } catch (error) {
        console.error('Failed to load data:', error);
        ElMessage.error('数据加载失败');
    } finally {
        statsLoading.value = false;
        recordsLoading.value = false;
    }
});
</script>

<style scoped>
/* 设置描述列表中的标签宽度 */
:deep(.el-descriptions__label) {
    width: 80px !important;
    text-align: right !important;
}

/* 确保内容区域正确对齐 */
:deep(.el-descriptions__content) {
    padding-left: 12px !important;
}

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

.dashboard-layout {
    min-height: 100vh;
}

.header {
    background: var(--primary-bg);
    padding: 0 24px;
    border-bottom: 1px solid var(--border-color);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
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
    width: 32px;
    height: 32px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s;
}

.menu-item {
    display: flex;
    justify-content: space-between;
    width: 100%;
    flex-direction: column;
    align-items: center;
}

.content {
    padding: 0 5%;
    background: var(--secondary-bg);
}

/* 数据状态板 */
.stats-panel {
    margin-bottom: 24px;
    text-align: center;
    background-color: var(--el-bg-color-page);
    border: 1px solid var(--el-border-color-light);
    box-shadow: var(--el-box-shadow);
    padding: 20px;
    border-radius: 8px;
    color: var(--el-text-color-primary);
    overflow: hidden;
    position: relative;
}

.stats-skeleton {
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 80px;
}

/* 提交表单卡片 */
.submit-card {
    margin-bottom: 24px;
    background-color: var(--el-bg-color-page);
    border: 1px solid var(--el-border-color-light);
    box-shadow: var(--el-box-shadow);
    border-radius: 8px;
    color: var(--el-text-color-primary);
    overflow: hidden;
    transition: none;
}

/* 记录表格卡片 */
.records-card {
    margin-bottom: 24px;
    background-color: var(--el-bg-color-page);
    box-shadow: var(--el-box-shadow);
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    color: var(--el-text-color-primary);
    overflow: hidden;
    transition: none;
    position: relative;
}

.add-record-btn {
    margin-bottom: 24px;
}

.github-link {
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo {
    height: 32px;
    margin-right: 24px;
    object-fit: contain;
    cursor: pointer;
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
    margin-top: 16px;
    display: flex;
    justify-content: center;
}

:deep(.el-pagination) {
    justify-content: center;
}


/* 更新表单样式 */
.form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
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
</style>