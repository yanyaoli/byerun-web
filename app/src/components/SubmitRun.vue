<template>
  <div class="flex-1 flex flex-col min-h-0 relative w-full box-border">
    <!-- 完成情况卡片 -->
    <div class="bg-stone-900 rounded-xl p-5 mb-5 w-full box-border">
      <div class="flex justify-between items-center border-b border-dashed border-stone-700 pb-2">
        <div class="text-sm font-semibold text-gray-400">完成情况</div>
        <div class="text-sm text-gray-500">
          <i class="fa-solid fa-hourglass-end"></i> {{ stats.semesterEndDateText }}
        </div>
      </div>
      <div class="flex gap-2 pt-2 w-full">
        <div
          v-for="card in summaryCards"
          :key="card.label"
          class="flex-1 bg-stone-950/50 rounded-xl p-3 flex flex-col items-center"
        >
          <div class="text-lg font-semibold text-gray-500 mb-1">
            {{ card.value }}
          </div>
          <div class="text-sm font-medium text-gray-500 mb-1 truncate">{{ card.label }}</div>
          <div class="text-sm text-gray-500 mb-2">
            {{ card.detail }}
          </div>
        </div>
      </div>
    </div>

    <!-- 主卡片：Tab 与 表单共存 -->
    <form @submit.prevent="onFormSubmit" class="flex-1 flex flex-col min-h-0 overflow-visible">
      <div class="bg-stone-900 rounded-xl border-none w-full box-border mb-5 p-5">
        <!-- Tab 按钮行 -->
        <div class="flex items-center mb-4 border-b border-dashed border-stone-700 pb-2">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            @click="activeTab = tab.key"
            :class="[
              'flex-1 text-base h-8 font-semibold transition-all text-center rounded-full',
              activeTab === tab.key
                ? 'text-gray-400 bg-stone-950/50 '
                : 'text-gray-500 hover:text-gray-400 hover:bg-stone-950/50',
            ]"
          >
            <i :class="tab.icon" class="mr-2"></i>{{ tab.label }}
          </button>
        </div>

        <div>
          <!-- 提交记录表单 -->
          <div v-show="activeTab === 'submit'">
            <div class="form-group mb-4">
              <label class="block text-sm text-gray-500 mb-2 font-medium">选择地图</label>
              <div
                class="route-dropdown bg-stone-950/50 border-none rounded-md p-2 cursor-pointer relative w-full box-border"
                @click="mapsLoaded && !submitting ? (showRouteOptions = !showRouteOptions) : null"
              >
                <div
                  class="selected-route flex items-center justify-between text-sm text-gray-500"
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
                  <div v-show="showRouteOptions && mapsLoaded" class="route-options">
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

            <div class="form-group mb-4">
              <label class="block text-sm text-gray-500 mt-2 mb-2 font-medium">跑步里程</label>
              <div class="input-container flex items-center">
                <div
                  class="input-wrapper flex-1 flex items-center bg-stone-950/50 border-none rounded-md px-3"
                >
                  <input
                    v-model.number="form.distance"
                    type="number"
                    step="1"
                    placeholder="输入里程"
                    required
                    class="flex-1 py-2 text-sm text-gray-500 outline-none pr-2"
                  />
                  <span class="unit text-sm text-gray-500 pl-2">米</span>
                </div>
                <button
                  type="button"
                  class="ml-3 px-3 py-2 bg-stone-950/50 text-sm text-gray-400 cursor-pointer hover:bg-stone-950/80 disabled:opacity-50 rounded-md"
                  @click="onRandomFill"
                  :disabled="submitting || randomizing"
                  aria-label="随机里程"
                >
                  <i :class="['fa-solid', randomizing ? 'fa-spinner fa-spin' : 'fa-dice']"></i>
                </button>
              </div>
            </div>

            <transition name="confirm-actions" mode="out-in">
              <button
                v-if="!awaitingSubmitConfirm"
                key="single-submit"
                type="submit"
                class="w-full p-2 text-gray-300 bg-stone-950/80 rounded-full hover:bg-gray-400 hover:text-gray-700 disabled:cursor-not-allowed disabled:bg-gray-200"
                :disabled="submitting || !isDistanceValid"
              >
                <i class="fa-solid fa-check"></i>
                提交记录
              </button>
              <div v-else key="double-submit" class="flex w-full gap-3">
                <button
                  type="button"
                  class="flex-1 p-2 text-gray-300 border border-dashed border-gray-950 rounded-full hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
                  :disabled="submitting || randomizing"
                  @click="cancelSubmitConfirm"
                >
                  取消
                </button>
                <button
                  type="button"
                  class="flex-1 p-2 text-gray-300 bg-stone-950/50 rounded-full hover:bg-stone-950 disabled:cursor-not-allowed disabled:opacity-70"
                  :disabled="submitting || !isDistanceValid"
                  @click="confirmSubmit"
                >
                  <i v-if="!submitting" class="fa-solid fa-check"></i>
                  <span class="loader" v-else></span>
                  {{ submitting ? '提交中...' : '确认' }}
                </button>
              </div>
            </transition>
          </div>

          <!-- 定时任务 -->
          <div v-show="activeTab === 'schedule'" class="space-y-4">
            <div v-if="schedulePanelMounted">
              <AutoConfig inline @saved="onAutoConfigSaved" />
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- 路线预览 -->
    <div v-show="activeTab === 'submit'" class="bg-stone-900 rounded-xl p-5 mb-5 w-full box-border">
      <div class="flex justify-between items-center border-b border-dashed border-stone-700 pb-2">
        <div class="text-sm font-semibold text-gray-400">路线预览</div>
      </div>
      <MapPreview
        v-if="mapRenderUnlocked"
        :track="generatedTrack"
        :ready="mapReady"
        class="pt-2 w-full transition-all duration-300"
      />
      <div v-else class="pt-2 text-xs text-gray-400"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, defineAsyncComponent, onMounted } from 'vue';
import { submitRun as submitRunApi } from '@/composables/useRunSubmission';
import { useRouteGenerator } from '@/composables/useRouteGenerator';
import { useDataStore } from '@/composables/useDataStore';
import { useApiRequestGate } from '@/composables/useApiRequestGate';
import { waitForAutorunPingReady } from '@/composables/useAutorunPingMeta';
import {
  calculatePaceMinutesPerKm,
  computeDurationFromDistance,
  formatPaceMinutesPerKm,
  normalizeRoundedRunTime,
  randomIntNonThousand,
  resolveRunBoundsFromStandard,
} from '@/utils/run';

const MapPreview = defineAsyncComponent(() => import('./MapPreview.vue'));
const AutoConfig = defineAsyncComponent(() => import('./AutoConfig.vue'));
const { waitForIdle } = useApiRequestGate();

const showMessage = inject('showMessage');

const { userInfo, runStandard, runInfo, activityInfo, submitRunDistance, submitRunRoute } =
  useDataStore();

const emit = defineEmits(['submitted']);

const tabs = [
  { key: 'submit', label: '提交记录', icon: 'ri-add-line' },
  { key: 'schedule', label: '定时任务', icon: 'ri-calendar-schedule-line' },
];

const activeTab = ref('submit');
const schedulePanelMounted = ref(false);

watch(
  activeTab,
  (tab) => {
    if (tab === 'schedule') {
      schedulePanelMounted.value = true;
    }
  },
  { immediate: true },
);

// 提交记录相关
const form = ref({
  distance: submitRunDistance.value,
  route: submitRunRoute.value,
});
const mapRenderUnlocked = ref(false);
const submitting = ref(false);
const randomizing = ref(false);
const awaitingSubmitConfirm = ref(false);
const showRouteOptions = ref(false);

const distanceBounds = computed(() =>
  resolveRunBoundsFromStandard(userInfo.value || {}, runStandard.value || {}),
);

const isDistanceValid = computed(() => {
  const distance = Number(form.value.distance);
  return Number.isInteger(distance) && distance > 0;
});

const distanceErrorText = computed(() => {
  return '跑步里程需为大于 0 的整数';
});

const buildLocalRandomRun = () => {
  const bounds = distanceBounds.value;
  const runDistance = randomIntNonThousand(bounds.distanceMin, bounds.distanceMax);
  const duration = computeDurationFromDistance(runDistance, {
    minMinutes: bounds.timeMin,
    maxMinutes: bounds.timeMax,
  });
  const runTime = normalizeRoundedRunTime(duration, runDistance, {
    minMinutes: bounds.timeMin,
    maxMinutes: bounds.timeMax,
  });

  const route = String(form.value.route || selectedRoute.value || 'default').trim() || 'default';
  const paceMinutesPerKm = calculatePaceMinutesPerKm(runDistance, runTime);

  console.info('[SubmitRun] Random run generated', {
    route,
    distanceBounds: {
      min: bounds.distanceMin,
      max: bounds.distanceMax,
    },
    timeBounds: {
      min: bounds.timeMin,
      max: bounds.timeMax,
    },
    runDistance,
    rawDurationMinutes: duration,
    roundedRunTimeMinutes: runTime,
    paceMinutesPerKm,
    paceDisplay: formatPaceMinutesPerKm(runDistance, runTime),
  });

  return {
    map_id: route,
    run_distance: runDistance,
    run_time: runTime,
    track_points: '',
  };
};

const applyRandomRun = (randomRun) => {
  if (!randomRun) return;

  const mapId = String(randomRun.map_id || '').trim();
  if (mapId && Object.prototype.hasOwnProperty.call(routeOptions.value, mapId)) {
    selectMapRoute(mapId);
    form.value.route = mapId;
  }

  form.value.distance = randomRun.run_distance;
};

async function onRandomFill() {
  if (submitting.value || randomizing.value) return;

  randomizing.value = true;
  try {
    applyRandomRun(buildLocalRandomRun());
  } finally {
    randomizing.value = false;
    awaitingSubmitConfirm.value = false;
  }
}

watch(
  () => [form.value.distance, form.value.route],
  ([distance, route]) => {
    submitRunDistance.value = distance;
    submitRunRoute.value = route;
    awaitingSubmitConfirm.value = false;
  },
);

const {
  mapsLoaded,
  routeOptions,
  selectedRoute,
  load: loadMaps,
  selectRoute: selectMapRoute,
  getRouteName,
  generatedTrack,
  mapReady,
} = useRouteGenerator(
  computed(() => form.value.distance),
  computed(() => form.value.route),
);

// 统计数据
const stats = computed(() => {
  const activity = activityInfo.value || {};
  const run = runInfo.value || {};
  const standard = runStandard.value || {};
  const user = userInfo.value || {};

  const completedActivities = Number(activity.joinNum || 0);
  const totalActivities = Number(activity.totalNum || 0);
  const clubCompletionRate =
    totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
  const clubCompletionRateText =
    totalActivities === 0 ? '0%' : `${Math.round(clubCompletionRate)}%`;

  // Read semester targets by gender.
  const totalRequiredRuns =
    user.gender === '1'
      ? Number(standard.boyAllRunTime || 0)
      : user.gender === '2'
        ? Number(standard.girlAllRunTime || 0)
        : 0;
  const completedRuns = Number(run.runValidCount || 0);
  const runCompletionRate = totalRequiredRuns
    ? Math.min(100, Math.round((completedRuns / totalRequiredRuns) * 100))
    : 0;

  const totalDistanceMeters = Number(run.runValidDistance || 0);
  const totalDistanceKm = (Math.floor((totalDistanceMeters / 1000) * 10) / 10).toFixed(1);
  const targetDistanceKm =
    user.gender === '1'
      ? (Number(standard.boyAllRunDistance || 0) / 1000).toFixed(1)
      : user.gender === '2'
        ? (Number(standard.girlAllRunDistance || 0) / 1000).toFixed(1)
        : '0.0';
  const targetDistanceNumber = Number(targetDistanceKm);
  const currentDistanceNumber = Number(totalDistanceKm);
  const distancePercentage = targetDistanceNumber
    ? Math.min(100, (currentDistanceNumber / targetDistanceNumber) * 100)
    : 0;

  const semYear = String(standard.semesterYear || '');
  const semesterFlag = semYear.slice(-1);
  const semesterEndDateText =
    semesterFlag === '1'
      ? standard.firstSemesterDateEnd || ''
      : semesterFlag === '2'
        ? standard.secondSemesterDateEnd || ''
        : '';

  const distancePercentageText = `${Math.round(distancePercentage)}%`;
  const targetDistanceKmDisplay = targetDistanceNumber > 0 ? targetDistanceKm : '0';

  return {
    semesterEndDateText,
    summaryCards: [
      {
        label: '俱乐部活动',
        value: clubCompletionRateText,
        detail: `${completedActivities}/${totalActivities}`,
      },
      {
        label: '跑步次数',
        value: `${runCompletionRate}%`,
        detail: `${completedRuns}/${totalRequiredRuns}`,
      },
      {
        label: '跑步里程',
        value: distancePercentageText,
        detail: `${totalDistanceKm}/${targetDistanceKmDisplay}`,
      },
    ],
  };
});

const summaryCards = computed(() => stats.value.summaryCards);

function selectRoute(route) {
  if (!Object.prototype.hasOwnProperty.call(routeOptions.value, route)) {
    return;
  }
  selectMapRoute(route);
  form.value.route = route;
  submitRunRoute.value = route;
  showRouteOptions.value = false;
}

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const res = await submitRunApi({
      distance: form.value.distance,
      route: form.value.route,
    });
    if (!res.ok) {
      let msg = res.data?.msg || res.error?.message || '提交失败，请重试';

      if (res.msg === 'not_login') {
        msg = '请先登录';
      } else if (res.msg === 'distance_invalid') {
        msg = '跑步里程需为大于 0 的整数';
      } else if (res.msg === 'track_invalid') {
        msg = '轨迹生成失败，请重新随机里程';
      }

      showMessage(msg, 'error');
      return;
    }

    showMessage(res.data?.response?.resultDesc || '提交成功', 'success');
    emit('submitted');
  } finally {
    submitting.value = false;
    awaitingSubmitConfirm.value = false;
  }
};

const requestSubmitConfirm = () => {
  if (!isDistanceValid.value) {
    showMessage(distanceErrorText.value, 'error');
    return;
  }
  awaitingSubmitConfirm.value = true;
};

const cancelSubmitConfirm = () => {
  awaitingSubmitConfirm.value = false;
};

const confirmSubmit = () => {
  if (!awaitingSubmitConfirm.value || submitting.value) return;
  handleSubmit();
};

const onFormSubmit = () => {
  if (activeTab.value !== 'submit' || submitting.value) return;
  requestSubmitConfirm();
};

const onAutoConfigSaved = () => {
  showMessage('保存成功', 'success');
};

const unlockMapRender = async () => {
  await waitForIdle();
  await waitForAutorunPingReady();
  mapRenderUnlocked.value = true;
};

onMounted(() => {
  unlockMapRender();
});

loadMaps().then(async () => {
  if (submitRunRoute.value) {
    form.value.route = submitRunRoute.value;
  } else if (selectedRoute.value) {
    form.value.route = selectedRoute.value;
  }

  const cachedDistance = Number(submitRunDistance.value);

  if (Number.isInteger(cachedDistance) && cachedDistance > 0) {
    form.value.distance = cachedDistance;
  } else {
    await onRandomFill();
  }
});
</script>

<style scoped>
.route-dropdown {
  position: relative;
  user-select: none;
  box-sizing: border-box;
  overflow: visible;
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
  border-radius: 8px;
  z-index: 9999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  max-height: 200px;
  overflow-y: auto;
}

.route-option {
  padding: 8px 16px;
  font-size: 13px;
  background: #161414;
  color: #6a7282;
  cursor: pointer;
  transition: all 0.2s;
}
s .route-option.selected,
.route-option:hover {
  background: #0c0a0a;
  color: #4f6d7a;
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

.confirm-actions-enter-active,
.confirm-actions-leave-active {
  transition: all 0.18s ease;
}

.confirm-actions-enter-from,
.confirm-actions-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.985);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
