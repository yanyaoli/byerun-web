<template>
  <el-container>
    <el-header>
      <div class="header-container">
        <div class="left-menu">
          <el-dropdown trigger="click">
            <el-button plain class="icon-button">
              <el-icon>
                <Menu />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="getNotice">
                  <el-icon>
                    <Bell />
                  </el-icon>
                  公告
                </el-dropdown-item>
                <el-dropdown-item @click="goHome">
                  <el-icon>
                    <House />
                  </el-icon>
                  主页
                </el-dropdown-item>
                <el-dropdown-item @click="goClub">
                  <el-icon>
                    <Basketball />
                  </el-icon>
                  俱乐部
                </el-dropdown-item>
                <el-dropdown-item @click="toggleNotification">
                  <el-icon>
                    <component
                      :is="notificationAvailable ? 'Bell' : 'MuteNotification'"
                    />
                  </el-icon>
                  公告开关
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="center-content">
          <h2></h2>
        </div>

        <div class="right-menu">
          <el-dropdown trigger="click">
            <el-button plain class="icon-button">
              <el-icon><Avatar /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="refresh" :disabled="isRefreshing">
                  <el-icon :class="{ 'is-loading': isRefreshing }">
                    <Refresh />
                  </el-icon>
                  刷新
                </el-dropdown-item>
                <el-dropdown-item @click="switchUser">
                  <el-tooltip
                    content="切换账号"
                    placement="top"
                    open-delay="500"
                  >
                    <el-icon>
                      <Switch />
                    </el-icon>
                  </el-tooltip>
                  切换
                </el-dropdown-item>
                <el-dropdown-item @click="logout">
                  <el-tooltip
                    content="退出账号"
                    placement="top"
                    open-delay="500"
                  >
                    <el-icon color="red">
                      <CloseBold />
                    </el-icon>
                  </el-tooltip>
                  退出
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <el-main v-if="showMainBoard">
      <div v-if="user" class="stuInfo">
        <h1 @click="toggleMask" :class="{ masked: !masked }">
          {{ user.studentName }}
        </h1>
        <p @click="toggleMask" :class="{ masked: !masked }">
          {{ user.registerCode }}
        </p>
      </div>
      <div v-else class="stuInfo">
        <h1>
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
        </h1>
        <p>
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
        </p>
      </div>

      <div>
        <div class="runInfo">
          <el-row :gutter="20" justify="center">
            <el-col :span="24">
              <el-card class="no-border-card">
                <!-- 俱乐部完成率进度条 -->
                <el-progress
                  v-if="activity"
                  :percentage="activity.club_completion_percentage"
                  :stroke-width="20"
                  :text-inside="true"
                  @click="getActivity"
                >
                  <span>俱乐部完成率 {{ activity.club_completion_rate }}</span>
                </el-progress>
                <el-progress
                  v-else
                  :percentage="100"
                  :stroke-width="20"
                  :text-inside="true"
                  :duration="3"
                  striped
                  striped-flow
                >
                  <span
                    ><el-icon class="is-loading"><Loading /></el-icon
                  ></span>
                </el-progress>

                <!-- 校园跑完成率进度条 -->
                <el-progress
                  v-if="activity"
                  :percentage="activity.running_completion_percentage"
                  :stroke-width="20"
                  :text-inside="true"
                  @click="getActivity"
                >
                  <span
                    >校园跑完成率 {{ activity.running_completion_rate }}</span
                  >
                </el-progress>
                <el-progress
                  v-else
                  :percentage="100"
                  :stroke-width="20"
                  :text-inside="true"
                  :duration="3"
                  striped
                  striped-flow
                >
                  <span
                    ><el-icon class="is-loading"><Loading /></el-icon
                  ></span>
                </el-progress>

                <!-- 里程完成率进度条 -->
                <el-progress
                  v-if="runInfo"
                  :percentage="runInfo.runDistanceCompletionPercentage"
                  :stroke-width="20"
                  :text-inside="true"
                  @click="getRunInfo"
                >
                  <span
                    >里程完成率 {{ runInfo.runDistanceCompletionRate }}</span
                  >
                </el-progress>
                <el-progress
                  v-else
                  :percentage="100"
                  :stroke-width="20"
                  :text-inside="true"
                  :duration="3"
                  striped
                  striped-flow
                >
                  <span
                    ><el-icon class="is-loading"><Loading /></el-icon
                  ></span>
                </el-progress>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>

      <el-divider />
      <div>
        <div class="input-group">
          <el-input-number
            for="runDistance"
            id="distance"
            v-model="runDistance"
            :min="1000"
            :max="5000"
            :step="100"
            style="width: 200px"
            placeholder="跑步里程（米）"
          ></el-input-number>
        </div>
        <div class="input-group">
          <el-input-number
            for="runTime"
            id="time"
            v-model="runTime"
            :min="30"
            :max="100"
            :step="5"
            style="width: 200px"
            placeholder="跑步时长（分钟）"
          ></el-input-number>
        </div>
        <div class="input-group">
          <el-select id="map" v-model="mapChoice" placeholder="请选择地图">
            <el-option
              label="成都信息工程大学龙泉校区"
              value="cuit_lqy"
            ></el-option>
            <el-option
              label="成都信息工程大学航空港校区"
              value="cuit_hkg"
            ></el-option>
            <el-option
              label="成都中医药大学温江校区"
              value="cdutcm_wj"
            ></el-option>
          </el-select>
        </div>
        <el-button @click="randomizeInputs" plain class="icon-button">
          <el-icon class="is-loading">
            <RefreshRight />
          </el-icon>
        </el-button>
      </div>

      <el-divider />
      <el-button
        type="primary"
        :loading="isSubmitting"
        @click="submitActivityData"
        :disabled="LoginState"
        round
        >立即提交</el-button
      >
    </el-main>
  </el-container>
</template>

<script setup>
import "@/styles/dashboard/index.css";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

import {
  useUser,
  useActivity,
  useRunInfo,
  useSubmitActivity,
} from "@/hooks/dashboard/index";
import useNotice from "@/hooks/notice/";
import address from "@/services/address";

const homeURL = ref(address.homeURL);

const { getNotice } = useNotice();

const { user, fetchUser } = useUser();
const { activity, fetchActivity } = useActivity();
const { runInfo, fetchRunInfo } = useRunInfo();
const { isSubmitting, submit } = useSubmitActivity();

const userData = JSON.parse(localStorage.getItem("userData")) || null;
const token = localStorage.getItem("token") || null;

const showMainBoard = ref(true);
const masked = ref(true);

const goHome = () => {
  window.open(homeURL.value);
};

const router = useRouter();
const runDistance = ref(null);
const runTime = ref(null);
const mapChoice = ref(null);
const LoginState = ref(true);

// 获取活动信息
const getActivity = async () => {
  await fetchActivity(user.value.schoolId, user.value.studentId);
};

// 获取跑步信息
const getRunInfo = async () => {
  await fetchRunInfo(user.value.userId, user.value.schoolId);
};

// 刷新
const isRefreshing = ref(false);
const refresh = async () => {
  isRefreshing.value = true;
  await Promise.all([getActivity(), getRunInfo()]);
  isRefreshing.value = false;
};

// 提交
const submitActivityData = async () => {
  if (!runDistance.value || !runTime.value || !mapChoice.value) {
    ElMessage.error("参数不完整，请检查后重新提交");
    return;
  }
  const schoolId = userData.schoolId;
  const userId = userData.userId;
  const result = await submit(
    runDistance.value,
    runTime.value,
    mapChoice.value,
    schoolId,
    userId
  );
  if (result) {
    refresh();
  }
};

// 俱乐部活动
const goClub = () => {
  router.push("/club");
};

// 随机填充
const randomizeInputs = () => {
  const maps = ["cuit_lqy", "cuit_hkg", "cdutcm_wj"];
  runDistance.value = Math.floor(Math.random() * (6000 - 1000 + 1)) + 1000;
  runTime.value = Math.floor(Math.random() * (100 - 30 + 1)) + 30;
  mapChoice.value = maps[Math.floor(Math.random() * maps.length)];
};

// 切换用户
const switchUser = () => {
  ElMessage.info("还没有实现该功能");
};

const notificationAvailable = ref(
  localStorage.getItem("NotificationAvailable") !== "false"
);

const toggleNotification = () => {
  const newValue = !notificationAvailable.value;
  localStorage.setItem("NotificationAvailable", newValue);
  notificationAvailable.value = newValue;
};

onMounted(async () => {
  if (notificationAvailable.value) {
    getNotice();
  }
  if (!userData || !token) {
    router.push("/home");
  } else {
    const result = await fetchUser();
    if (result) {
      LoginState.value = false;
      refresh();
    }
  }
});

// 退出账号
const logout = () => {
  localStorage.clear();
  router.push("/home");
  ElMessage.info("账号已退出");
};

// 切换蒙版显示
const toggleMask = () => {
  masked.value = !masked.value;
};
</script>

<style scoped>
.el-card {
  border: none;
  box-shadow: none;
}
</style>
