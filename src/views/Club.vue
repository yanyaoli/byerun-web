<template>
  <el-container>
    <el-header>
      <el-select
        v-model="activeName"
        placeholder="选择时间"
        @change="handleSelect"
        class="week-menu"
      >
        <el-option
          v-for="option in options"
          :key="option.id"
          :label="option.label"
          :value="option.id.toString()"
        >
        </el-option>
      </el-select>
    </el-header>
    <el-main v-if="isLoading">
      <el-result>
        <template #sub-title>
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
        </template>
        <template #extra>
        </template>
      </el-result>
    </el-main>
    <el-main v-else>
      <el-scrollbar height="70vh" v-if="clubs.length > 0">
        <div v-for="club in clubs" :key="club.configurationId">
          <el-descriptions
            class="margin-top"
            :title="club.activityName"
            :key="club.configurationId"
            :column="1"
            border
          >
            <template #extra>
              <el-button
                v-if="buttonTypes[club.joinStatus]"
                :loading="JoinLoading"
                :type="buttonTypes[club.joinStatus].type"
                @click="handleJoin(club)"
                :disabled="buttonTypes[club.joinStatus].disabled"
              >
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
      <el-result
        v-else
        icon="success"
        sub-title="暂无俱乐部活动或俱乐部活动已达标"
      >
        <template #extra>
        </template>
      </el-result>
    </el-main>
    <el-button @click="goBack">返回</el-button>
  </el-container>
</template>

<script setup>
import "@/styles/club/index.css";
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

const options = ref([
  { id: 1, label: "周一" },
  { id: 2, label: "周二" },
  { id: 3, label: "周三" },
  { id: 4, label: "周四" },
  { id: 5, label: "周五" },
  { id: 6, label: "我的俱乐部" },
]);

const weekDayMap = reactive({
  0: "返回",
  1: "周一",
  2: "周二",
  3: "周三",
  4: "周四",
  5: "周五",
  6: "我的俱乐部",
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
  window.history.go(-1);
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

<style scoped></style>