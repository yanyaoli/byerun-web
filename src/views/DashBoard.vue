<template>
  <Notice />
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
                <el-dropdown-item @click="goRunRecord">
                  <el-icon>
                    <List />
                  </el-icon>
                  跑步记录
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
                <span>校园跑完成率 {{ activity.running_completion_rate }}</span>
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
                <span>里程完成率 {{ runInfo.runDistanceCompletionRate }}</span>
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

      <el-divider />
      <div>
        <div class="input-group">
          <el-input-number
            for="runDistance"
            id="distance"
            v-model="runDistance"
            :min="runDistanceMin"
            :max="runDistanceMax"
            :step="500"
            style="width: 200px"
            placeholder="跑步里程（米）"
          ></el-input-number>
        </div>
        <div class="input-group">
          <el-input-number
            for="runTime"
            id="time"
            v-model="runTime"
            :min="runTimeMin"
            :max="runTimeMax"
            :step="10"
            style="width: 200px"
            placeholder="跑步时长（分钟）"
          ></el-input-number>
        </div>
        <div class="input-group">
          <el-select
            id="school"
            v-model="schoolChoice"
            placeholder="请选择学校"
          >
            <el-option
              v-for="school in availableSchools"
              :key="school.value"
              :label="school.label"
              :value="school.value"
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
import Notice from "@/components/Notice.vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getSchoolMaps } from "@/static/maps/map";

import {
  useUser,
  useActivity,
  useRunInfo,
} from "@/hooks/dashboard/index";

import { useRunStandard, useSubmitActivity } from "@/hooks/run/index";

const { user, fetchUser } = useUser();
const { activity, fetchActivity } = useActivity();
const { runInfo, fetchRunInfo } = useRunInfo();
const { isSubmitting, submit } = useSubmitActivity();
const { runDistanceMin, runDistanceMax, runTimeMin, runTimeMax, fetchRunStandard, setRunStandardValues } = useRunStandard();
const userData = JSON.parse(localStorage.getItem("userData")) || null;
const token = localStorage.getItem("token") || null;

const showMainBoard = ref(true);
const masked = ref(true);

const goHome = () => {
  router.push("/");
};

const goRunRecord = () => {
  router.push("/run/record");
};

const router = useRouter();
const runDistance = ref(null);
const runTime = ref(null);
const schoolChoice = ref(null);
const LoginState = ref(true);

const availableSchools = ref([]);

// 获取活动信息
const getActivity = async () => {
  await fetchActivity(user.value.schoolId, user.value.studentId);
};

// 获取跑步信息
const getRunInfo = async () => {
  await fetchRunInfo(user.value.userId, user.value.schoolId);
};

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 刷新
const isRefreshing = ref(false);
const refresh = async () => {
  isRefreshing.value = true;
  try {
    await getActivity();
    await delay(1000); // 请求间隔 1 秒
    await getRunInfo();
  } catch (error) {
    await delay(3000); // 请求失败后等待 3 秒再重试
    await refresh();
  } finally {
    isRefreshing.value = false;
  }
};

// 提交
const submitActivityData = async () => {
  if (!runDistance.value || !runTime.value || !schoolChoice.value) {
    ElMessage.error("参数不完整，请检查后重新提交");
    return;
  }
  const schoolId = userData.schoolId;
  const userId = userData.userId;
  const mapChoice = schoolChoice.value; // 获取对应的地图编号
  const pace = runTime.value / (runDistance.value / 1000); // 计算配速
  if (pace <= 6) {
    ElMessage.error("配速须大于6分钟每公里，请检查后重新提交");
    return;
  }
  const result = await submit(
    runDistance.value,
    runTime.value,
    mapChoice,
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
  let distance, time, pace;
  do {
    distance = Math.floor(Math.random() * (runDistanceMax.value - runDistanceMin.value + 1)) + runDistanceMin.value;
    time = Math.floor(Math.random() * (runTimeMax.value - runTimeMin.value + 1)) + runTimeMin.value;
    pace = time / (distance / 1000); // 计算配速
  } while (pace <= 6); // 确保配速大于6分钟每公里

  runDistance.value = distance;
  runTime.value = time;
  schoolChoice.value = availableSchools.value[Math.floor(Math.random() * availableSchools.value.length)].value;
};

// 切换用户
const switchUser = () => {
  ElMessage.info("还没有实现该功能");
};

onMounted(async () => {
  if (!userData || !token) {
    router.push("/login");
  } else {
    const result = await fetchUser();
    if (result) {
      LoginState.value = false;
      const runStandardData = localStorage.getItem('runStandardData');
      if (runStandardData) {
        setRunStandardValues();
      } else {
        await fetchRunStandard(user.value.schoolId); // 请求获取跑步标准信息
      }

      // 从 localStorage 获取 activityData 和 runInfoData
      const storedActivityData = JSON.parse(localStorage.getItem('activityData'));
      const storedRunInfoData = JSON.parse(localStorage.getItem('runInfoData'));

      if (storedActivityData) {
        activity.value = storedActivityData;
      } else {
        await fetchActivity(user.value.schoolId, user.value.studentId);
      }

      if (storedRunInfoData) {
        runInfo.value = storedRunInfoData;
      } else {
        await fetchRunInfo(user.value.userId, user.value.schoolId);
      }
    }
  }

  // 设置可用学校
  availableSchools.value = getSchoolMaps();
});

// 退出账号
const logout = () => {
//   const accounts = localStorage.getItem("accounts");
  localStorage.clear();
//   if (accounts) {
//     localStorage.setItem("accounts", accounts);
//   }
  router.push("/login");
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
