<template>
  <div class="submit-container">
    <div class="stats-table">
      <div class="stats-table-header">
        <div class="stats-header-title">完成情况</div>
        <div class="stats-header-semester">{{ semesterYearText }}学期</div>
      </div>
      <!-- 三个卡片表格布局 -->
      <div class="stats-table-row">
        <div class="stats-card club-activity">
          <div class="stats-percentage">
            {{
              totalActivities === 0
                ? "0%"
                : Math.round(clubCompletionRate) + "%"
            }}
          </div>
          <div class="stats-title">俱乐部活动</div>
          <div class="stats-ratio">
            {{ completedActivities + "/" + totalActivities }}
          </div>
        </div>
        <div class="stats-card run-completion">
          <div class="stats-percentage">{{ runCompletionRate }}%</div>
          <div class="stats-title">跑步次数</div>
          <div class="stats-ratio">
            {{ completedRuns }}/{{ totalRequiredRuns }}
          </div>
        </div>
        <div class="stats-card distance-stats">
          <div class="stats-percentage">
            {{ Math.round(distancePercentage) }}%
          </div>
          <div class="stats-title">跑步里程</div>
          <div class="stats-ratio">
            {{ totalDistanceKm }}/{{
              Number(targetDistanceKm) ? targetDistanceKm : "0"
            }}
          </div>
        </div>
      </div>
    </div>

    <!-- 数据输入表单 -->
    <form @submit.prevent="handleSubmit">
      <div class="form-section">
        <h3 class="section-title">提交记录</h3>

        <!-- 跑步路线选择 -->
        <!-- 修改路由选择部分 -->
        <div class="form-group">
          <label>选择地图</label>
          <div
            class="route-dropdown"
            @click="
              mapsLoaded && !submitting
                ? (showRouteOptions = !showRouteOptions)
                : null
            "
          >
            <div
              class="selected-route"
              :class="{ disabled: !mapsLoaded || submitting }"
            >
              <span v-if="!mapsLoaded">加载地图中...</span>
              <span v-else>{{ getRouteName(form.route) }}</span>
              <div
                class="dropdown-arrow"
                :class="{ active: showRouteOptions && mapsLoaded }"
                v-if="mapsLoaded"
              ></div>
            </div>
            <transition name="dropdown">
              <div
                v-show="showRouteOptions && mapsLoaded"
                class="route-options"
              >
                <div
                  v-for="(name, value) in routeOptions"
                  :key="value"
                  class="route-option"
                  :class="{ selected: form.route === value }"
                  @click.stop="selectRoute(value)"
                >
                  {{ name }}
                </div>
                <div
                  v-if="Object.keys(routeOptions).length === 0"
                  class="route-option disabled"
                >
                  无可用地图
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- 跑步里程输入 -->
        <div class="form-group">
          <label>跑步里程</label>
          <div class="input-wrapper">
            <input
              v-model.number="form.distance"
              type="number"
              step="1"
              placeholder="输入里程"
              required
              style="box-shadow: none; outline: none"
            />
            <span class="unit">米</span>
          </div>
        </div>

        <!-- 跑步时长输入 -->
        <div class="form-group">
          <label>跑步时长</label>
          <div class="input-wrapper">
            <input
              v-model.number="form.duration"
              type="number"
              step="1"
              placeholder="输入时长"
              required
              style="box-shadow: none; outline: none"
            />
            <span class="unit">分钟</span>
          </div>
        </div>

        <!-- 配速计算 -->
        <div class="form-group">
          <div class="pace-display">
            <div class="pace-card" :class="{ error: !paceLimit }">
              <div class="pace-label">当前配速：</div>
              <div class="pace-value">
                {{
                  form.distance && form.distance > 0
                    ? formatPace(form.duration, form.distance)
                    : "0:00"
                }}
                <span class="pace-unit">分钟/公里</span>
              </div>
              <transition name="fade">
                <div v-if="!paceLimit" class="pace-error">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  {{ getPaceLimitErrorText() }}
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- AutoRun配置区域 -->
        <div class="action-buttons">
          <button
            type="button"
            class="random-btn"
            @click="onRandomFill"
            :disabled="submitting"
          >
            <i class="fa-solid fa-dice"></i>
          </button>
          <button
            type="button"
            class="autorun-setting-btn"
            :class="{ active: showAutoModal }"
            @click="showAutoModal = !showAutoModal"
            :aria-pressed="showAutoModal"
            title="定时任务配置"
          >
            <i class="fa-solid fa-alarm-clock"></i>
          </button>
          <button
            type="submit"
            class="submit-btn"
            :disabled="submitting || !paceLimit"
            :class="{ submitting: submitting }"
          >
            <i class="fa-solid fa-check"></i>
            <span class="btn-icon" v-if="!submitting"> </span>
            <span class="loader" v-else></span>
            {{ submitting ? "提交中..." : "提交记录" }}
          </button>
        </div>
      </div>
    </form>

    <!-- 路线预览部分 -->
    <div class="route-preview-section">
      <h3 class="section-title">路线预览</h3>
      <MapPreview :track="generatedTrack" />
    </div>

    <AutoConfig
      :visible="showAutoModal"
      @update:visible="updateAutoVisible"
      @saved="onAutoSaved"
    />
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  inject,
  defineAsyncComponent,
} from "vue";
import api from "../utils/api";
import { genTrackPoints } from "../utils/map";

// 注入全局消息方法
const showMessage = inject("showMessage");

// 异步组件
const MapPreview = defineAsyncComponent(() => import("./MapPreview.vue"));
const AutoConfig = defineAsyncComponent(() => import("./AutoConfig.vue"));

// Props
const props = defineProps({
  userInfo: { type: Object, default: null },
  runStandard: { type: Object, default: null },
  runInfo: { type: Object, default: null },
  activityInfo: { type: Object, default: null },
});

// Emits
const emit = defineEmits(["submitted"]);

// 常量定义
const LOCAL_STORAGE_ROUTE_KEY = "submitRunRoute";
const LOCAL_STORAGE_DISTANCE_KEY = "submitRunDistance";
const LOCAL_STORAGE_DURATION_KEY = "submitRunDuration";

// Refs
const mapsLoaded = ref(false);
const routeOptions = ref({});
const form = ref({
  distance: 2000,
  duration: 20,
  route: "",
  date: new Date().toISOString().split("T")[0],
});
const submitting = ref(false);
const showAutoModal = ref(false);
const showRouteOptions = ref(false);
const animateProgress = ref(false);
const generatedTrack = ref(null);

// Computed Properties - 统计数据
const completedActivities = computed(() => {
  return props.activityInfo ? props.activityInfo.joinNum : 0;
});

const totalActivities = computed(() => {
  return props.activityInfo ? props.activityInfo.totalNum : 0;
});

const clubCompletionRate = computed(() => {
  if (!totalActivities.value) return 0;
  return (completedActivities.value / totalActivities.value) * 100;
});

const completedRuns = computed(() => {
  return props.activityInfo ? props.activityInfo.runJoinNum : 0;
});

const totalRequiredRuns = computed(() => {
  return props.activityInfo ? props.activityInfo.runTotalNum : 0;
});

const runCompletionRate = computed(() => {
  if (!totalRequiredRuns.value) return 0;
  return Math.min(
    100,
    Math.round((completedRuns.value / totalRequiredRuns.value) * 100)
  );
});

const totalDistanceKm = computed(() => {
  if (props.runInfo && props.runInfo.runValidDistance) {
    return (Number(props.runInfo.runValidDistance) / 1000).toFixed(1);
  }
  return "0.0";
});

const targetDistanceKm = computed(() => {
  if (props.runStandard && props.userInfo) {
    const gender = props.userInfo.gender;
    if (gender === "1") {
      return (Number(props.runStandard.boyAllRunDistance) / 1000).toFixed(1);
    } else if (gender === "2") {
      return (Number(props.runStandard.girlAllRunDistance) / 1000).toFixed(1);
    }
  }
  return "0.0";
});

const distancePercentage = computed(() => {
  const target = Number(targetDistanceKm.value);
  const current = Number(totalDistanceKm.value);
  if (!target) return 0;
  return Math.min(100, (current / target) * 100);
});

const semesterYearText = computed(() => {
  if (props.runStandard && props.runStandard.semesterYear) {
    return props.runStandard.semesterYear || "当前";
  }
  return "当前";
});

const paceLimit = computed(() => {
  if (!form.value.distance || !form.value.duration || form.value.distance <= 0)
    return true;
  const pace = form.value.duration / (form.value.distance / 1000);
  const minPace = 6;
  const maxPace = 10;
  if (isNaN(pace)) return true;
  if (pace < minPace) return false;
  if (pace > maxPace) return false;
  return true;
});

// 工具函数
function getMapDisplayName(mapId) {
  const displayNames = {
    cuit_hkg: "成都信息工程大学（航空港校区）",
    cuit_lqy: "成都信息工程大学（龙泉驿校区）",
    cdutcm_wj: "成都中医药大学（温江校区）",
    ncwsxx: "南充卫生学校",
    sctbc: "四川工商职业技术学院",
  };
  return displayNames[mapId] || mapId;
}

function getRouteName(routeValue) {
  return routeOptions.value[routeValue] || "选择路线";
}

function formatPace(duration, distance) {
  if (!distance) return "0:00";
  const pace = duration / (distance / 1000);
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60)
    .toString()
    .padStart(2, "0");
  return `${min}:${sec}`;
}

function getPaceLimitErrorText() {
  if (!form.value.distance || !form.value.duration || form.value.distance <= 0)
    return "";
  const pace = form.value.duration / (form.value.distance / 1000);
  const minPace = 6;
  const maxPace = 10;
  if (pace < minPace) {
    return `配速过快，不能快于6:00分钟/公里`;
  }
  if (pace > maxPace) {
    return `配速过慢，不能慢于10:00分钟/公里`;
  }
  return "配速不符合要求";
}

function triggerProgressAnimation() {
  animateProgress.value = false;
  setTimeout(() => {
    animateProgress.value = true;
  }, 50);
}

// 事件处理函数
function updateAutoVisible(v) {
  showAutoModal.value = v;
}

function onAutoSaved() {
  showMessage("定时任务配置已保存", "success");
}

function selectRoute(route) {
  if (!Object.prototype.hasOwnProperty.call(routeOptions.value, route)) {
    return;
  }
  form.value.route = route;
  showRouteOptions.value = false;
  try {
    localStorage.setItem(LOCAL_STORAGE_ROUTE_KEY, route);
  } catch (e) {}
}

// 主要业务函数
async function loadMaps() {
  try {
    const trackUtils = await import("../utils/map");
    const mapIds = await trackUtils.loadMapFiles();

    const options = {};
    for (const mapId of mapIds) {
      options[mapId] = getMapDisplayName(mapId);
    }

    routeOptions.value = options;
    mapsLoaded.value = true;

    console.log("成功加载地图选项:", options);
  } catch (error) {
    console.error("加载地图失败:", error);
    routeOptions.value = {
      cdutcm_wj: "成都中医药大学（温江校区）",
    };
    mapsLoaded.value = true;
  }
}

const handleSubmit = async () => {
  if (!paceLimit.value) {
    showMessage("配速不能小于6分钟/公里", "error");
    return;
  }

  if (!Number.isInteger(form.value.distance) || form.value.distance <= 0) {
    showMessage("跑步里程必须为正整数", "error");
    return;
  }

  const userId = localStorage.getItem("userId");
  const studentId = localStorage.getItem("studentId");
  const schoolId = localStorage.getItem("schoolId");
  if (!userId || !studentId || !schoolId) {
    showMessage("请先登录", "error");
    return;
  }

  submitting.value = true;
  const trackPoints = genTrackPoints(form.value.distance, form.value.route);

  const now = new Date(form.value.date);
  const pad = (n) => n.toString().padStart(2, "0");
  const recordDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  let yearSemester;
  if (props.runStandard && props.runStandard.semesterYear) {
    yearSemester = props.runStandard.semesterYear;
  } else {
    const year = now.getFullYear();
    const semester = now.getMonth() + 1 < 8 ? "1" : "2";
    yearSemester = `${year}${semester}`;
  }

  const payload = {
    againRunStatus: "0",
    againRunTime: 0,
    appVersions: "1.8.3",
    brand: "iPhone",
    mobileType: "iPhone 15 Pro Max",
    sysVersions: "17.0",
    trackPoints,
    distanceTimeStatus: "1",
    innerSchool: "1",
    runDistance: Math.round(form.value.distance),
    runTime: Math.round(form.value.duration),
    userId: Number(userId),
    vocalStatus: "1",
    yearSemester,
    recordDate,
  };

  try {
    console.debug("Submitting run payload:", payload);
    const { data } = await api.post("/unirun/save/run/record/new", payload);
    console.debug("Server response for run submit:", data);

    if (data && data.code === 10000) {
      showMessage(data.response.resultDesc, "success");
      triggerProgressAnimation();
      emit("submitted");
    } else {
      showMessage(data?.msg || "提交失败", "error");
    }
  } catch (e) {
    console.error("Submit run error:", e);
    showMessage("提交异常", "error");
  } finally {
    submitting.value = false;
  }
};

const onRandomFill = () => {
  const minDistance = 1000,
    maxDistance = 7500,
    minTime = 6,
    maxTime = 75;
  const minPace = 6,
    maxPace = 10;
  let randomDistance = 0,
    randomDuration = 0,
    pace = 0;
  let tryCount = 0;

  while (true) {
    randomDistance =
      Math.floor(Math.random() * (maxDistance - minDistance + 1)) + minDistance;
    const minDuration = Math.max(
      minTime,
      Math.ceil((randomDistance / 1000) * minPace)
    );
    const maxDuration = Math.min(
      maxTime,
      Math.floor((randomDistance / 1000) * maxPace)
    );

    if (minDuration > maxDuration) {
      tryCount++;
      if (tryCount > 100) break;
      continue;
    }

    randomDuration =
      Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;
    pace = randomDuration / (randomDistance / 1000);

    if (
      randomDistance > 0 &&
      randomDuration > 0 &&
      pace >= minPace &&
      pace <= maxPace
    ) {
      break;
    }
    tryCount++;
    if (tryCount > 100) break;
  }

  form.value.distance = randomDistance;
  form.value.duration = randomDuration;
  triggerProgressAnimation();
};

// Watchers
watch(
  () => form.value.distance,
  (val) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_DISTANCE_KEY, String(val));
    } catch (e) {}
  }
);

watch(
  () => form.value.duration,
  (val) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_DURATION_KEY, String(val));
    } catch (e) {}
  }
);

watch(
  () => [form.value.distance, form.value.duration],
  () => {
    triggerProgressAnimation();
  },
  { deep: true }
);

watch(
  () => [form.value.route, form.value.distance],
  () => {
    try {
      generatedTrack.value = genTrackPoints(
        Number(form.value.distance),
        form.value.route
      );
    } catch (e) {
      generatedTrack.value = null;
    }
  },
  { immediate: true }
);

// Lifecycle
onMounted(async () => {
  await loadMaps();

  try {
    const savedRoute = localStorage.getItem(LOCAL_STORAGE_ROUTE_KEY);
    if (
      savedRoute &&
      Object.prototype.hasOwnProperty.call(routeOptions.value, savedRoute)
    ) {
      form.value.route = savedRoute;
    } else if (Object.keys(routeOptions.value).length > 0) {
      form.value.route = Object.keys(routeOptions.value)[0];
    }

    const savedDistance = localStorage.getItem(LOCAL_STORAGE_DISTANCE_KEY);
    if (savedDistance && !isNaN(Number(savedDistance))) {
      form.value.distance = Number(savedDistance);
    }

    const savedDuration = localStorage.getItem(LOCAL_STORAGE_DURATION_KEY);
    if (savedDuration && !isNaN(Number(savedDuration))) {
      form.value.duration = Number(savedDuration);
    }
  } catch (e) {}

  setTimeout(() => {
    animateProgress.value = true;
  }, 500);
});
</script>

<style scoped>
.submit-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f6f7f9;
  height: 100%;
  position: relative;
  padding: 0 16px;
}

.stats-table {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e3e6e8;
  box-shadow: none;
}
/* 完成情况表头 */
.stats-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e3e6e8;
}
.stats-header-title {
  font-size: 15px;
  font-weight: 600;
  color: #2d3a3f;
  margin: 0 0 5px 0;
}
.stats-header-semester {
  font-size: 14px;
  color: #7b8a8b;
  margin: 0 0 5px 0;
}

/* 三卡片表格布局 */
.stats-table-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding: 10px 0px 0px 0px;
}
.stats-card {
  flex: 1;
  background: #f0f2f5;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stats-percentage {
  font-size: 20px;
  font-weight: 600;
  color: #323538;
  margin-bottom: 6px;
}
.stats-title {
  font-size: 14px;
  font-weight: 500;
  color: #2d3a3f;
  margin: 0 0 6px 0;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stats-ratio {
  font-size: 13px;
  color: #7b8a8b;
  margin-bottom: 8px;
}

.form-section,
.route-preview-section {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e3e6e8;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #2d3a3f;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f2f5;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #7b8a8b;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.form-group.half {
  flex: 1;
  margin-bottom: 0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f6f7f9;
  border: 1px solid #e3e6e8;
  border-radius: 8px;
  padding: 0 12px;
}

.input-wrapper input {
  flex: 1;
  padding: 10px 0;
  border: none;
  font-size: 15px;
  background: transparent;
  outline: none;
  color: #2d3a3f;
}

.input-wrapper .unit {
  color: #7b8a8b;
  font-size: 14px;
  padding-left: 4px;
}

/* 路线选择 */
.route-dropdown {
  background: #f6f7f9;
  border: 1px solid #e3e6e8;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  position: relative;
  user-select: none;
}
.selected-route {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
  color: #2d3a3f;
}
.dropdown-arrow {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #b0b0b0;
  margin-left: 8px;
  transition: transform 0.2s;
}
.dropdown-arrow.active {
  transform: rotate(180deg);
}
.route-options {
  position: absolute;
  left: 0;
  right: 0;
  top: 110%;
  background: #fff;
  border: 1px solid #e3e6e8;
  border-radius: 8px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  max-height: 200px;
  overflow-y: auto;
}
.route-option {
  padding: 12px 16px;
  font-size: 15px;
  color: #4f6d7a;
  cursor: pointer;
  transition: all 0.2s;
}
.route-option.selected,
.route-option:hover {
  background: #f0f7ff;
  color: #3b9eff;
}

/* 配速卡片 */
.pace-display {
  margin-bottom: 0;
}
.pace-card {
  background: #f6f7f9;
  border-radius: 8px;
  border: 1px solid #e3e6e8;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  position: relative;
}
.pace-card.error {
  border-color: #f8500e;
  background: #fff8f6;
}
.pace-label {
  font-size: 14px;
  color: #7b8a8b;
  margin-right: 6px;
}
.pace-value {
  font-size: 16px;
  font-weight: 600;
  color: #2d3a3f;
}
.pace-unit {
  font-size: 14px;
  color: #7b8a8b;
  margin-left: 2px;
}
/* 配速错误提示样式优化，移动端适配 */
.pace-error {
  color: #f8500e;
  font-size: 14px;
  position: absolute;
  right: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: pre-line;
  word-break: break-all;
  background: #fff8f6;
  padding: 2px 6px;
  border-radius: 4px;
  z-index: 2;
}
@media (max-width: 500px) {
  .pace-error {
    font-size: 13px;
    left: 8px;
    right: 8px;
    padding: 2px 2px;
  }
}

/* 按钮区域 */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
.random-btn,
.autorun-setting-btn {
  background: #f0f2f5;
  border: none;
  border-radius: 25px;
  padding: 14px;
  font-size: 16px;
  color: #4f6d7a;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn {
  flex: 1;
  padding: 8px 0;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  gap: 6px;
}
.random-btn {
  background: #f0f2f5;
  color: #4f6d7a;
  gap: 6px;
}
.random-btn:active {
  background: #e3e6e8;
}
.random-btn:disabled {
  background: #f0f0f0;
  color: #b0b0b0;
  cursor: not-allowed;
}
.submit-btn {
  background: #000;
  color: white;
  box-shadow: 0 2px 6px rgba(59, 158, 255, 0.2);
}
.submit-btn:active {
  background: #2b8ff0;
  transform: translateY(1px);
}
.submit-btn:disabled {
  background: #b0b0b0;
  box-shadow: none;
  color: #fff;
  cursor: not-allowed;
}
.submit-btn.submitting {
  background: #7b8a8b;
  color: #fff;
}
.loader {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-top: 2px solid #3b9eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.route-preview-placeholder {
  background: #f6f7f9;
  border: 1px dashed #e3e6e8;
  border-radius: 8px;
  height: 140px; /* 减少高度，节省空间 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  color: #7b8a8b;
  font-size: 14px;
}

/* 消息提示 */
.message-box {
  margin: 16px;
  background: #e6f4ff;
  border-radius: 8px;
  border: 1px solid #a8d8ff;
  color: #3b9eff;
  font-size: 15px;
  padding: 14px;
  text-align: center;
  box-shadow: none;
  transition: all 0.2s;
}
.message-box.error {
  background: #fff2e6;
  border-color: #ffcca5;
  color: #f8500e;
}
.message-text {
  font-size: 15px;
}

@media (max-width: 375px) {
  .stats-header {
    padding: 14px 12px 6px 12px;
  }
  .stats-header-title {
    font-size: 15px;
  }
  .stats-header-semester {
    font-size: 13px;
  }
  .stats-section {
    padding: 16px 12px 6px 12px;
    gap: 8px;
  }
  .stats-card {
    padding: 12px 8px 10px;
  }
  .stats-title {
    font-size: 12px;
  }
  .stats-percentage {
    font-size: 18px;
  }
  .stats-ratio {
    font-size: 12px;
  }
  .route-dropdown {
    padding: 8px 8px;
  }
  .modal-container {
    width: 98vw;
    padding: 0 0 8px 0;
  }
}
</style>
