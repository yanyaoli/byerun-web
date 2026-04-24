<template>
  <div class="flex-1 flex flex-col min-h-0 relative w-full box-border">
    <!-- 完成情况卡片 -->
    <div class="theme-card rounded-2xl p-5 mb-5 w-full box-border">
      <div class="flex justify-between items-center border-b border-dashed theme-card-divider pb-2">
        <div class="text-sm font-semibold theme-text-primary">完成情况</div>
        <div class="text-sm theme-text-secondary">
          <i class="ri-hourglass-fill"></i> {{ stats.semesterEndDateText }}
        </div>
      </div>
      <div class="flex flex-nowrap gap-2 pt-2 w-full">
        <div
          v-for="card in summaryCards"
          :key="card.label"
          class="flex-1 basis-0 min-w-0 rounded-xl p-2 summary-card"
        >
          <div class="summary-card-main">
            <div class="summary-card-title-row">
              <span class="summary-card-title theme-text-primary truncate">{{ card.label }}</span>
            </div>
            <div class="summary-card-metrics-row">
              <span class="summary-card-ratio theme-text-secondary">{{ card.detail }}</span>
              <span :class="['summary-card-metric', card.valueClass]">{{ card.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提交表单 -->
    <form @submit.prevent="onFormSubmit" class="flex-1 flex flex-col min-h-0 overflow-visible">
      <div class="theme-card rounded-2xl w-full box-border mb-5 p-5 form-card-container">
        <!-- Tab 按钮行 -->
        <div class="flex items-center mb-4 border-b border-dashed theme-card-divider pb-2">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            @click="activeTab = tab.key"
            :class="[
              'flex-1 text-base h-8 font-semibold transition-all text-center rounded-full',
              activeTab === tab.key
                ? 'theme-text-primary theme-card-soft'
                : 'submit-tab-inactive border-none',
            ]"
          >
            <i :class="tab.icon" class="mr-2"></i>{{ tab.label }}
          </button>
        </div>

        <div>
          <!-- 提交记录表单 -->
          <div v-show="activeTab === 'submit'">
            <div class="form-group mb-4">
              <label class="block text-sm theme-text-secondary mb-2 font-medium">选择地图</label>
              <div
                class="route-dropdown theme-card-soft rounded-md p-2 cursor-pointer relative w-full box-border"
                @click="mapsLoaded && !submitting ? (showRouteOptions = !showRouteOptions) : null"
              >
                <div
                  class="selected-route flex items-center justify-between text-sm theme-text-secondary"
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
                <div v-if="showRouteOptions && mapsLoaded" class="route-options theme-card-strong">
                  <div
                    v-for="(name, value) in routeOptions"
                    :key="value"
                    class="route-option text-sm theme-text-secondary cursor-pointer"
                    :class="{ selected: form.route === value }"
                    @click.stop="selectRoute(value)"
                  >
                    <div class="route-option-main">
                      <div class="route-option-name">
                        <span v-if="isCustomRoute(value)" class="route-custom-tag">自定义</span>
                        <span>{{ name }}</span>
                      </div>
                      <div v-if="isCustomRoute(value)" class="route-option-actions">
                        <button
                          type="button"
                          class="route-action-btn"
                          title="重命名"
                          @click.stop="renameRoute(value)"
                        >
                          <i class="ri-edit-line"></i>
                        </button>
                        <button
                          type="button"
                          class="route-action-btn"
                          title="修改路线"
                          @click.stop="editRoute(value)"
                        >
                          <i class="ri-route-line"></i>
                        </button>
                        <button
                          type="button"
                          class="route-action-btn danger"
                          title="删除"
                          @click.stop="deleteRoute(value)"
                        >
                          <i class="ri-delete-bin-6-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div v-if="Object.keys(routeOptions).length === 0" class="route-option disabled">
                    无可用地图
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="block text-sm theme-text-secondary mt-2 mb-2 font-medium">
                <div class="flex justify-between items-center">
                  <span>跑步数据</span>
                  <span class="text-xs theme-text-tertiary">配速 {{ paceDisplay }}</span>
                </div>
              </label>
              <div class="input-container flex items-center gap-2">
                <div
                  class="input-wrapper flex-1 min-w-0 flex items-center theme-card-soft rounded-md px-3"
                >
                  <input
                    v-model.number="form.distance"
                    type="number"
                    step="1"
                    placeholder="输入里程"
                    required
                    class="flex-1 min-w-0 bg-transparent py-2 text-sm theme-text-secondary outline-none pr-2"
                  />
                  <span class="unit shrink-0 text-sm theme-text-tertiary pl-2">米</span>
                </div>
                <div
                  class="input-wrapper flex-1 min-w-0 flex items-center theme-card-soft rounded-md px-3"
                >
                  <input
                    v-model.number="form.duration"
                    type="number"
                    placeholder="分"
                    class="flex-1 min-w-0 bg-transparent py-2 text-sm theme-text-secondary outline-none pr-2"
                    @focus="userTyping = true"
                    @blur="onDurationBlur"
                  />
                  <span class="unit shrink-0 text-sm theme-text-tertiary pl-2">分</span>
                </div>
                <button
                  type="button"
                  class="shrink-0 px-3 py-2 theme-card-soft text-sm theme-text-secondary cursor-pointer disabled:opacity-50 rounded-md"
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
                class="w-full p-2 font-semibold theme-text-primary theme-card-soft rounded-full disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="submitting || !isDistanceValid"
              >
                提交记录
              </button>
              <div v-else key="double-submit" class="flex w-full gap-3">
                <button
                  type="button"
                  class="flex-1 p-2 rounded-full submit-confirm-cancel disabled:cursor-not-allowed disabled:opacity-70"
                  :disabled="submitting || randomizing"
                  @click="cancelSubmitConfirm"
                >
                  取消
                </button>
                <button
                  type="button"
                  class="flex-1 p-2 rounded-full submit-confirm-ok disabled:cursor-not-allowed disabled:opacity-70"
                  :disabled="submitting || !isDistanceValid"
                  @click="confirmSubmit"
                >
                  <i v-if="!submitting" class="ri-check-fill"></i>
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
    <div v-show="activeTab === 'submit'" class="theme-card rounded-2xl p-5 mb-5 w-full box-border">
      <div class="flex justify-between items-center border-b border-dashed theme-card-divider pb-2">
        <div class="text-sm font-semibold theme-text-secondary">路线预览</div>
        <button
          type="button"
          class="p-1 rounded-md theme-card-soft theme-text-secondary text-sm"
          @click="openMapDrawer"
          title="绘制路线"
        >
          <i class="ri-map-line"></i>
          自定义
        </button>
      </div>
      <MapPreview
        v-if="mapRenderUnlocked"
        :track="displayTrack"
        :ready="mapReady"
        :map-style="isDark ? 'dark' : 'light'"
        class="pt-2 w-full transition-all duration-300"
      />
    </div>

    <ConfirmDialog ref="confirmDialogRef" />
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, defineAsyncComponent, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { submitRun as submitRunApi, useRouteGenerator } from '@/composables/useRun';
import { useDataStore } from '@/composables/useDataStore';
import { useThemeStore } from '@/composables/useTheme';
import { waitForAutorunPingReady } from '@/sdk/autorun';
import { deleteCustomMap, getCustomMapData, renameCustomMap } from '@/utils/map';
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
const ConfirmDialog = defineAsyncComponent(() => import('./ui/ConfirmDialog.vue'));

const router = useRouter();
const showMessage = inject('showMessage');

const { userInfo, runStandard, runInfo, activityInfo, submitRunDistance, submitRunRoute } =
  useDataStore();

const emit = defineEmits(['submitted']);

const tabs = [
  { key: 'submit', label: '手动提交', icon: 'ri-add-line' },
  { key: 'schedule', label: '自动提交', icon: 'ri-calendar-schedule-line' },
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
  duration: 0,
});
const mapRenderUnlocked = ref(false);
const manualTrack = ref(null);
const confirmDialogRef = ref(null);
const pendingDrawerRoute = ref('');
const submitting = ref(false);
const randomizing = ref(false);
const awaitingSubmitConfirm = ref(false);
const showRouteOptions = ref(false);

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);

const displayTrack = computed(() => {
  if (manualTrack.value) return manualTrack.value;
  return generatedTrack.value;
});

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

const predictedRunTime = ref(0);

const calculatePredictedRunTime = (distance) => {
  if (!Number.isInteger(distance) || distance <= 0) return 0;
  const rawDuration = computeDurationFromDistance(distance, {
    minMinutes: distanceBounds.value.timeMin,
    maxMinutes: distanceBounds.value.timeMax,
  });
  return normalizeRoundedRunTime(rawDuration, distance, {
    minMinutes: distanceBounds.value.timeMin,
    maxMinutes: distanceBounds.value.timeMax,
  });
};

const userTyping = ref(false);

watch(
  () => Number(form.value.distance),
  (distance) => {
    if (!userTyping.value) {
      const time = calculatePredictedRunTime(distance);
      predictedRunTime.value = time;
      form.value.duration = Math.floor(time);
    }
  },
  { immediate: true },
);

watch(
  () => form.value.duration,
  (duration) => {
    if (!userTyping.value) return;
    if (duration > 0) {
      predictedRunTime.value = 0;
    }
  },
);

const userDuration = computed(() => {
  const d = Number(form.value.duration);
  return Number.isInteger(d) && d > 0 ? d : 0;
});

const paceDisplay = computed(() => {
  const distance = Number(form.value.distance);
  const time = userDuration.value || Math.floor(predictedRunTime.value);
  if (!Number.isInteger(distance) || distance <= 0 || !time) {
    return "0'00''/km";
  }

  return formatPaceMinutesPerKm(distance, time);
});

const durationDisplay = computed(() => {
  const minutes = Math.floor(predictedRunTime.value);
  if (!minutes || minutes <= 0) {
    return '';
  }
  return String(minutes);
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

function onDurationBlur() {
  userTyping.value = false;
  if (!form.value.duration || form.value.duration <= 0) {
    const time = calculatePredictedRunTime(form.value.distance);
    predictedRunTime.value = time;
    form.value.duration = Math.floor(time);
  }
}

async function onRandomFill() {
  if (submitting.value || randomizing.value) return;

  randomizing.value = true;
  userTyping.value = false;
  try {
    const randomRun = buildLocalRandomRun();
    applyRandomRun(randomRun);
    predictedRunTime.value =
      randomRun.run_time || calculatePredictedRunTime(Number(form.value.distance));
    form.value.duration = Math.floor(predictedRunTime.value);
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
        icon: 'ri-basketball-fill',
        valueClass: 'summary-value-club',
      },
      {
        label: '跑步次数',
        value: `${runCompletionRate}%`,
        detail: `${completedRuns}/${totalRequiredRuns}`,
        icon: 'ri-numbers-fill',
        valueClass: 'summary-value-count',
      },
      {
        label: '跑步里程',
        value: distancePercentageText,
        detail: `${totalDistanceKm}/${targetDistanceKmDisplay}`,
        icon: 'ri-footprint-fill',
        valueClass: 'summary-value-distance',
      },
    ],
  };
});

const summaryCards = computed(() => stats.value.summaryCards);

function isCustomRoute(route) {
  return String(route || '').startsWith('custom_');
}

function getCustomStorageId(route) {
  if (!isCustomRoute(route)) return '';
  return String(route).replace(/^custom_/, '');
}

async function refreshRoutes(preferredRoute = '') {
  await loadMaps();

  if (preferredRoute && Object.prototype.hasOwnProperty.call(routeOptions.value, preferredRoute)) {
    selectRoute(preferredRoute);
    return;
  }

  if (Object.prototype.hasOwnProperty.call(routeOptions.value, form.value.route)) {
    selectRoute(form.value.route);
    return;
  }

  const firstRoute = Object.keys(routeOptions.value)[0];
  if (firstRoute) {
    selectRoute(firstRoute);
  }
}

async function renameRoute(route) {
  const storageId = getCustomStorageId(route);
  if (!storageId) return;

  const currentName = String(routeOptions.value[route] || '').trim();
  const nextName = window.prompt('请输入新的路线名称', currentName)?.trim();
  if (!nextName || nextName === currentName) return;

  const success = renameCustomMap(storageId, nextName);
  if (!success) {
    showMessage('重命名失败，请重试', 'error');
    return;
  }

  await refreshRoutes(route);
  showMessage('路线已重命名', 'success');
}

function editRoute(route) {
  const storageId = getCustomStorageId(route);
  if (!storageId) return;

  const customData = getCustomMapData(storageId);
  if (!Array.isArray(customData) || customData.length < 2) {
    showMessage('路线数据无效，无法编辑', 'error');
    return;
  }

  router.push({
    name: 'map-drawer',
    query: {
      track: JSON.stringify(customData),
      editCustomMapId: storageId,
      editCustomMapName: routeOptions.value[route] || '',
    },
  });
}

async function deleteRoute(route) {
  const storageId = getCustomStorageId(route);
  if (!storageId) return;

  const confirmed = await confirmDialogRef.value?.show({
    title: '删除自定义路线',
    message: `确定删除「${routeOptions.value[route] || '该路线'}」吗？此操作不可恢复。`,
  });
  if (!confirmed) return;

  const success = deleteCustomMap(storageId);
  if (!success) {
    showMessage('删除失败，请重试', 'error');
    return;
  }

  if (form.value.route === route) {
    manualTrack.value = null;
  }

  await refreshRoutes();
  showMessage('路线已删除', 'success');
}

function selectRoute(route) {
  if (!Object.prototype.hasOwnProperty.call(routeOptions.value, route)) {
    return;
  }
  manualTrack.value = null;
  selectMapRoute(route);
  form.value.route = route;
  submitRunRoute.value = route;
  showRouteOptions.value = false;
}

function openMapDrawer() {
  // 导航到全屏地图绘制页面
  router.push({
    name: 'map-drawer',
    query: {
      track: manualTrack.value ? JSON.stringify(manualTrack.value) : undefined,
    },
  });
}

// 检查从地图绘制页面返回时的轨迹数据
function checkMapDrawerResult() {
  const result = sessionStorage.getItem('_map_drawer_result');
  if (result) {
    try {
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed) && parsed.length > 0) {
        manualTrack.value = parsed;
      } else if (parsed && typeof parsed === 'object') {
        const track = Array.isArray(parsed.track) ? parsed.track : [];
        if (track.length > 0) {
          manualTrack.value = track;
        }
        if (parsed.customRoute) {
          pendingDrawerRoute.value = String(parsed.customRoute);
        }
      }
    } catch (e) {
      console.error('Failed to parse map drawer result:', e);
    } finally {
      sessionStorage.removeItem('_map_drawer_result');
    }
  }
}

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const runTime = userDuration.value || Math.floor(predictedRunTime.value);

    const apiPayload = {
      distance: form.value.distance,
      route: form.value.route || 'manual',
      runTime,
    };

    if (manualTrack.value) {
      apiPayload.track = manualTrack.value;
    }

    const res = await submitRunApi(apiPayload);
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
  await waitForAutorunPingReady();
  mapRenderUnlocked.value = true;
};

onMounted(() => {
  checkMapDrawerResult();
  unlockMapRender();
});

loadMaps().then(async () => {
  if (submitRunRoute.value) {
    form.value.route = submitRunRoute.value;
  } else if (selectedRoute.value) {
    form.value.route = selectedRoute.value;
  }

  if (
    pendingDrawerRoute.value &&
    Object.prototype.hasOwnProperty.call(routeOptions.value, pendingDrawerRoute.value)
  ) {
    selectRoute(pendingDrawerRoute.value);
    pendingDrawerRoute.value = '';
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
/* 表单卡片容器 - 确保浮于路线预览之上 */
.form-card-container {
  position: relative;
  z-index: 10;
}

.route-dropdown {
  position: relative;
  user-select: none;
  box-sizing: border-box;
  overflow: visible;
  z-index: 100;
}

.dropdown-arrow {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--text-tertiary);
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
  z-index: 10000;
  padding: 4px 0;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  pointer-events: auto;
}

/* 确保表单卡片容器允许下拉菜单溢出 */
:deep(.form-card-container) {
  overflow: visible;
}

.route-option {
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.route-option-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.route-option-name {
  display: inline-flex;
  align-items: center;
  flex: 1;
  gap: 6px;
  min-width: 0;
  white-space: nowrap;
}

.route-option-name span:last-child {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-option-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0.8;
}

.route-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
}

.route-action-btn:hover {
  background: var(--action-hover-bg);
  color: var(--text-primary);
}

.route-action-btn.danger:hover {
  color: #dc2626;
}

.route-custom-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 6px;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  color: #075985;
  background: #bae6fd;
}

.route-option.selected,
.route-option:hover {
  background: var(--action-hover-bg);
  color: var(--text-primary);
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

.submit-tab-inactive {
  color: var(--text-secondary);
}

.submit-tab-inactive:hover {
  color: var(--text-primary);
  background-color: var(--action-hover-bg);
}

.submit-confirm-cancel {
  color: var(--text-secondary);
  border: 1px dashed var(--card-divider);
  background-color: transparent;
}

.submit-confirm-cancel:hover {
  background-color: var(--action-hover-bg);
}

.submit-confirm-ok {
  color: var(--button-primary-text);
  background-color: var(--button-primary-bg);
}

.submit-confirm-ok:hover {
  filter: brightness(1.06);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.duration-readonly {
  opacity: 0.55;
  background-color: var(--card-soft-bg);
}

.duration-readonly input[readonly] {
  cursor: not-allowed;
  user-select: none;
}

.summary-card {
  border: 1px solid var(--card-divider);
}

.summary-card-main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.summary-card-title-row {
  display: flex;
  align-items: center;
}

.summary-card-title {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
}

.summary-card-metrics-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.summary-card-metric {
  font-size: 12px;
  line-height: 1.2;
  font-weight: 600;
  white-space: nowrap;
}

.summary-card-ratio {
  font-size: 11px;
  line-height: 1.2;
  white-space: nowrap;
}

.summary-value-club {
  color: #d97706;
}

.summary-value-count {
  color: #0891b2;
}

.summary-value-distance {
  color: #16a34a;
}
</style>
