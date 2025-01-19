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

        <div class="right-menu">
          <el-dropdown trigger="click">
            <el-button plain class="icon-button">
              <el-icon>
                <Avatar />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="fetchUser">
                  <div v-if="user" class="stuInfo">
                    <el-text>{{ user.studentName }}</el-text>
                    <el-text size="small">{{ user.registerCode }}</el-text>
                  </div>
                  <div v-else class="stuInfo">
                    <el-text>未登录</el-text>
                  </div>
                </el-dropdown-item>
                <el-divider style="margin: 1px" />
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
      <div class="runInfo">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-statistic
              v-if="activity"
              title="俱乐部完成率"
              :value="activity.club_completion_rate"
              value-style="color: #409EFF;"
            />
            <el-statistic v-else title="俱乐部完成率" :value="0" />
          </el-col>
          <el-col :span="8">
            <el-statistic
              v-if="activity"
              title="校园跑完成率"
              :value="activity.running_completion_rate"
              value-style="color: #409EFF;"
            />
            <el-statistic v-else title="校园跑完成率" :value="0" />
          </el-col>
          <el-col :span="8">
            <el-statistic
              v-if="runInfo"
              title="里程完成率"
              :value="runInfo.runValidDistance"
              value-style="color: #409EFF;"
            />
            <el-statistic v-else title="里程完成率" :value="0" />
            <div class="statistic-footer">
              <div class="footer-item">
                <span>/</span>
                <span style="color: #409eff" v-if="runInfo">
                  {{ runInfo.needRunDistance }}
                </span>
                <span style="color: #409eff" v-else>0</span>
              </div>
            </div>
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
            :min="distanceMin"
            :max="distanceMax"
            :step="randomDistanceStep"
            style="width: 200px"
            placeholder="跑步里程（米）"
          ></el-input-number>
        </div>
        <div class="input-group">
          <el-input-number
            for="runTime"
            id="time"
            v-model="runTime"
            :min="timeMin"
            :max="timeMax"
            :step="randomTimeStep"
            style="width: 200px"
            placeholder="跑步时长（分钟）"
          ></el-input-number>
        </div>
        <div class="input-group">
          <el-select
            id="school"
            v-model="schoolChoice"
            placeholder="请选择学校"
            style="width: 300px"
          >
            <el-option
              v-for="school in availableSchools"
              :key="school.value"
              :label="school.label"
              :value="school.value"
            ></el-option>
          </el-select>
        </div>
      </div>
      <el-divider />
      <el-button type="" @click="randomizeInputs" plain round
        >随机填充</el-button
      >
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
import Notice from "@/components/Notice.vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getSchoolMaps } from "@/utils/maps/map";

import { useUser, useActivity, useRunInfo } from "@/hooks/dashboard/index";

import { useRunStandard, useSubmitActivity } from "@/hooks/run/index";

const { user, fetchUser } = useUser();
const { activity, fetchActivity } = useActivity();
const { runInfo, fetchRunInfo } = useRunInfo();
const { isSubmitting, submit } = useSubmitActivity();
const {
  runDistanceMin,
  runDistanceMax,
  runTimeMin,
  runTimeMax,
  fetchRunStandard,
  setRunStandardValues,
} = useRunStandard();
const userData = JSON.parse(localStorage.getItem("userData")) || null;
const token = localStorage.getItem("token") || null;

const showMainBoard = ref(true);

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
const randomDistanceStep = ref(500);
const randomTimeStep = ref(10);
// 随机生成 step 值
randomDistanceStep.value = Math.floor(Math.random() * 133) + 50;
randomTimeStep.value = Math.floor(Math.random() * 13) + 5;
const distanceMin = runDistanceMin.value;
const distanceMax = runDistanceMax.value + 2333;
const timeMin = runTimeMin.value;
const timeMax = runTimeMax.value + 23;

// 获取活动信息
const getActivity = async () => {
  await fetchActivity(user.value.schoolId, user.value.studentId);
};

// 获取跑步信息
const getRunInfo = async () => {
  await fetchRunInfo(user.value.userId, user.value.schoolId);
};

// 延迟函数
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    distance = Math.random() * (distanceMax - distanceMin) + distanceMin;
    time = Math.random() * (timeMax - timeMin) + timeMin;
    pace = time / (distance / 1000); // 计算配速
  } while (pace <= 6); // 确保配速大于6分钟每公里

  runDistance.value = Math.round(distance);
  runTime.value = Math.round(time);
  schoolChoice.value =
    availableSchools.value[
      Math.floor(Math.random() * availableSchools.value.length)
    ].value;
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
      const runStandardData = localStorage.getItem("runStandardData");
      if (runStandardData) {
        setRunStandardValues();
      } else {
        await fetchRunStandard(user.value.schoolId); // 请求获取跑步标准信息
      }

      // 从 localStorage 获取 activityData 和 runInfoData
      const storedActivityData = JSON.parse(
        localStorage.getItem("activityData")
      );
      const storedRunInfoData = JSON.parse(localStorage.getItem("runInfoData"));

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
</script>

<style scoped>
.el-container {
  max-width: 500px;
  max-height: 100vh;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 10px;
  margin: 0 auto;
}

.el-header {
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.header-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.left-menu,
.right-menu {
  flex: 0 0 auto;
}

.el-dropdown-menu {
  text-align: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  flex-direction: column;
  align-items: center;
}

.el-main {
  width: 100%;
  padding: 10px;
  text-align: center;
}

.stuInfo {
  display: flex;
  justify-content: space-between;
  width: 100%;
  flex-direction: column;
  align-items: center;
}

.runInfo {
  letter-spacing: 2px;
  /* margin-bottom: -20px; */
}

.el-statistic {
  overflow: hidden;
}

.input-group {
  margin-bottom: 5px;
}

.icon-button {
  border: none;
  color: #000;
  background-color: transparent;
  font-size: 20px;
  padding: 0;
}
.icon-button:hover {
  color: red;
}

.el-divider {
  margin: 18px auto;
}

.el-card {
  border: none;
  box-shadow: none;
}
</style>
