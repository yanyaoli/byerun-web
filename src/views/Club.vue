<template>
  <el-container>
    <el-header>
      <el-menu :default-active="activeName"
               class="week-menu"
               mode="horizontal"
               :collapse-transition="false"
               @select="handleSelect">
        <el-menu-item index="0">
          <el-icon>
            <ArrowLeft />
          </el-icon>
        </el-menu-item>
        <el-menu-item index="1">周一</el-menu-item>
        <el-menu-item index="2">周二</el-menu-item>
        <el-menu-item index="3">周三</el-menu-item>
        <el-menu-item index="4">周四</el-menu-item>
        <el-menu-item index="5">周五</el-menu-item>
        <el-menu-item index="6">我的俱乐部</el-menu-item>
      </el-menu>
    </el-header>
    <el-main v-if="isLoading">
      <el-result title="Byerun">
        <template #extra>
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
        </template>
      </el-result>
    </el-main>
    <el-main v-else>
      <el-scrollbar height="70vh"
                    v-if="clubs.length > 0">
        <div v-for="club in clubs"
             :key="club.configurationId">
          <el-descriptions class="margin-top"
                           :title="club.activityName"
                           :key="club.configurationId"
                           :column="1"
                           border>
            <template #extra>
              <el-button v-if="buttonTypes[club.joinStatus]"
                         :loading="JoinLoading"
                         :type="buttonTypes[club.joinStatus].type"
                         @click="handleJoin(club)"
                         :disabled="buttonTypes[club.joinStatus].disabled">
                {{ buttonTypes[club.joinStatus].label }}
              </el-button>
            </template>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <User />
                  </el-icon>
                  教师
                </div>
              </template>
              {{ club.teacherName }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <Checked />
                  </el-icon>
                  人数
                </div>
              </template>
              {{ club.joinStudentNum }} / {{ club.studentNum }}人
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <clock />
                  </el-icon>
                  时间
                </div>
              </template>
              周{{ weekDayMap[club.weekDay] }} {{ club.startTime }} -
              {{ club.endTime }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <location />
                  </el-icon>
                  地点
                </div>
              </template>
              {{ club.addressDetail }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon :style="iconStyle">
                    <InfoFilled />
                  </el-icon>
                  介绍
                </div>
              </template>
              {{ club.clubIntroduction }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-scrollbar>
      <el-result v-else
                 icon="success"
                 title="Byerun"
                 sub-title="暂无俱乐部活动或俱乐部活动已达标">
        <template #extra>
          <el-button type="primary"
                     @click="goBack">返回</el-button>
        </template>
      </el-result>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

import {
  useWeeklyClub,
  useClubTask,
  useClubHistory,
  useJoinClub,
} from "@/hooks/club";

const { clubTask, fetchClubTask } = useClubTask();
const { ClubHistory, fetchClubHistory } = useClubHistory();
const { weeklyClubs, fetchWeeklyClub } = useWeeklyClub();
const { JoinLoading, fetchJoinClub } = useJoinClub();

const user = ref(JSON.parse(localStorage.getItem("userData")) || null);
const clubs = ref([]);
const isLoading = ref(false);
const router = useRouter();
const activeName = ref("1");

const weekDayMap = reactive({
  1: "一",
  2: "二",
  3: "三",
  4: "四",
  5: "五",
  6: "俱乐部记录",
});

const buttonTypes = reactive({
  0: { type: "primary", label: "报名", disabled: false },
  1: { type: "danger", label: "取消报名", disabled: false },
  2: { type: "warning", label: "报名", disabled: false },
  3: { type: "success", label: "活动进行中", disabled: false },
  4: { type: "info", label: "活动已失效", disabled: true },
});

const iconStyle = {
  large: "8px",
  default: "6px",
  small: "4px",
};

const goBack = () => {
  router.push("/dashboard");
};

const handleSelect = (index) => {
  if (index === "0") {
    goBack();
    return;
  }
  if (index === "6") {
    getClubs();
  } else {
    getWeeklyClub(index);
  }
};

// 获取周俱乐部
const getWeeklyClub = async (weekDay) => {
  isLoading.value = true;
  await fetchWeeklyClub(weekDay);
  isLoading.value = false;
  clubs.value = weeklyClubs.value;
};

// 获取我的俱乐部
const getClubs = async () => {
  isLoading.value = true;
  const studentId = user.value.studentId;
  await fetchClubHistory(studentId);
  await fetchClubTask();
  isLoading.value = false;
  clubs.value = [...clubTask.value, ...ClubHistory.value];
  if (clubs.value.length === 0) {
    ElMessage.success("暂无需要参加的俱乐部活动");
  }
};

const handleJoin = async (club) => {
  JoinLoading.value = true;

  let type;
  if (club.joinStatus === 0 || club.joinStatus === 2) {
    type = 1;
  } else if (club.joinStatus === 1 || club.joinStatus === 3) {
    type = 2;
  } else {
    JoinLoading.value = false;
    return;
  }

  const success = await fetchJoinClub(club.configurationId, type);
  JoinLoading.value = false;
  if (!success) {
    getClubs();
  }
};

onMounted(() => {
  if (!user.value) {
    router.push("/home");
  } else {
    getWeeklyClub(1);
  }
});
</script>

<style scoped>
.el-container {
  max-width: 500px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  margin: 0 auto;
}

.el-header {
  width: 100%;
}


.el-main {
  width: 100%;
  max-width: 1200px;
}

.el-main .el-descriptions {
  margin-top: 20px;
}

.el-main .el-descriptions-item {
  word-break: break-word;
  /* 设置单词过长时自动换行 */
}

.week-menu > .el-menu-item {
  padding: 10px;
  color: #6b778c;
  font-size: 15px;
  font-weight: 500;
}

.cell-item {
  display: flex;
  align-items: center;
  min-width: 50px;
}
</style>
