<template>
  <div class="flex-1 flex flex-col min-h-0 relative w-full box-border">
    <!-- 整体卡片 -->
    <div class="rounded-xl w-full box-border mb-5" style="padding: 20px; background: var(--card-bg); border: 1px solid var(--card-border)">
      <!-- 板块一：完成情况 -->
      <section class="rounded-xl p-4" style="background: var(--section-soft-bg)">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold theme-text-primary">完成情况</span>
          </div>
          <div class="text-xs theme-text-tertiary flex items-center gap-1.5">
            <i class="ri-hourglass-line"></i>
            <span>{{ stats.semesterEndDateText }}</span>
          </div>
        </div>
        <div class="flex gap-3">
          <div
            v-for="card in summaryCards"
            :key="card.label"
            class="summary-card relative overflow-hidden rounded-lg flex-1 min-w-0"
            style="padding: 14px 12px"
            :class="[card.cardClass]"
          >
            <i
              :class="[card.icon, 'summary-card-bg-icon']"
              aria-hidden="true"
            ></i>
            <div
              class="relative z-[1] flex flex-col gap-0.5 items-center h-full cursor-pointer"
              @click="toggleSummaryCard(card.label)"
            >
              <span class="summary-card-label font-medium truncate">{{ card.label }}</span>
              <span
                :class="['summary-card-value text-lg font-bold tabular-nums leading-none mt-auto', card.valueClass]"
              >{{ summaryCardView[card.label] ? card.detail : card.value }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 分割线 -->
      <div class="my-5" style="border-top: 1px solid var(--card-divider)"></div>

      <!-- 板块二：提交记录 -->
      <form @submit.prevent="onFormSubmit" class="rounded-xl p-4" style="background: var(--section-soft-bg)">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold theme-text-primary">提交记录</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-[var(--action-hover-bg)] active:scale-95"
              @click="showAutoConfig = true"
              title="定时任务"
            >
              <i class="ri-calendar-schedule-line text-sm"></i>
            </button>
            <button
              type="button"
              class="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-[var(--action-hover-bg)] active:scale-95"
              @click="showRecords = true"
              title="记录"
            >
              <i class="ri-file-list-3-line text-sm"></i>
            </button>
          </div>
        </div>
        <div>
          <!-- 提交记录表单 -->
          <div class="flex items-center justify-between mb-4" style="border-bottom: 1.5px dashed var(--card-divider)">
            <button
              type="button"
              class="flex-1 flex items-center justify-between gap-2 text-sm theme-text-secondary bg-transparent py-2.5 disabled:opacity-50"
              :disabled="!mapsLoaded || submitting"
              @click="showRouteOptions = true"
            >
              <span class="truncate">
                <span v-if="!mapsLoaded">加载地图中...</span>
                <span v-else>{{ getRouteName(form.route) }}</span>
              </span>
              <i class="ri-arrow-down-s-line text-base theme-text-tertiary shrink-0"></i>
            </button>
          </div>

              <Drawer v-model="showRouteOptions" title="选择地图" v-if="mapsLoaded">
                <div
                  v-for="(name, value) in routeOptions"
                  :key="value"
                  class="flex items-center justify-between px-5 py-3 cursor-pointer transition-all border-b border-[var(--card-divider)] last:border-b-0 relative overflow-hidden"
                  :class="form.route === value ? 'option-selected' : 'hover:bg-[var(--action-hover-bg)]'"
                  @click="selectRoute(value)"
                >
                  <div class="flex items-center gap-3 min-w-0 flex-1">
                    <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="form.route === value ? 'option-dot-selected' : 'option-dot'"></span>
                      <div class="flex flex-col min-w-0">
                      <div class="flex items-center gap-2">
                        <span v-if="isCustomRoute(value)" class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style="background: #bae6fd; color: #075985">自定义</span>
                        <span class="text-base truncate" :class="form.route === value ? 'theme-text-primary font-semibold' : 'theme-text-secondary'">{{ name }}</span>
                      </div>
                    </div>
                  </div>
                  <i v-if="form.route === value" class="ri-check-line option-selected-icon" aria-hidden="true"></i>
                  <div v-if="isCustomRoute(value)" class="flex items-center gap-1 shrink-0 ml-3" @click.stop>
                    <button type="button" class="w-8 h-8 flex items-center justify-center rounded-lg theme-text-tertiary hover:bg-[var(--action-hover-bg)] hover:theme-text-primary transition-colors" title="重命名" @click="renameRoute(value)">
                      <i class="ri-edit-line text-base"></i>
                    </button>
                    <button type="button" class="w-8 h-8 flex items-center justify-center rounded-lg theme-text-tertiary hover:bg-[var(--action-hover-bg)] hover:theme-text-primary transition-colors" title="修改路线" @click="editRoute(value)">
                      <i class="ri-route-line text-base"></i>
                    </button>
                    <button type="button" class="w-8 h-8 flex items-center justify-center rounded-lg theme-text-tertiary hover:bg-red-50 hover:text-red-500 transition-colors" title="删除" @click="deleteRoute(value)">
                      <i class="ri-delete-bin-6-line text-base"></i>
                    </button>
                  </div>
                </div>
                <div v-if="Object.keys(routeOptions).length === 0" class="px-5 py-8 text-sm text-center theme-text-tertiary">
                  无可用地图
                </div>
              </Drawer>
            </div>

            <div class="form-group mb-4">
              <label class="block text-sm theme-text-secondary mb-2 font-medium">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-1.5">
                    <span>跑步数据</span>
                  </div>
                  <span class="text-xs theme-text-tertiary">
                    配速 {{ paceDisplay }}
                  </span>
                </div>
              </label>
              <div class="flex items-end gap-4">
                <div class="flex-1 min-w-0" style="border-bottom: 1.5px dashed var(--card-divider)">
                  <input
                    v-model.number="form.distance"
                    type="number"
                    step="1"
                    placeholder="输入里程"
                    required
                    class="w-full bg-transparent py-2.5 text-sm theme-text-secondary outline-none text-center"
                  />
                </div>
                <span class="shrink-0 text-xs theme-text-tertiary font-medium pb-2.5">米</span>
                <div class="flex-1 min-w-0" style="border-bottom: 1.5px dashed var(--card-divider)">
                  <input
                    v-model.number="form.duration"
                    type="number"
                    placeholder="分"
                    class="w-full bg-transparent py-2.5 text-sm theme-text-secondary outline-none text-center"
                    @focus="userTyping = true"
                    @blur="onDurationBlur"
                  />
                </div>
                <span class="shrink-0 text-xs theme-text-tertiary font-medium pb-2.5">分</span>
                <button
                  type="button"
                  class="shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-50 bg-transparent"
                  style="width: 36px; height: 36px"
                  @click="onRandomFill"
                  :disabled="submitting || randomizing"
                  aria-label="随机里程"
                >
                  <i :class="randomizing ? 'ri-loader-4-line animate-spin' : 'ri-magic-line'" class="text-base"></i>
                </button>
              </div>
            </div>

            <div class="mb-3">
              <TurnstileWidget
                v-if="showTurnstile"
                ref="turnstileRef"
                @token="turnstileToken = $event"
                @expired="turnstileToken = ''"
              />
            </div>
            <transition name="confirm-actions" mode="out-in">
              <div v-if="!awaitingSubmitConfirm">
                <button
                  type="submit"
                  class="w-full font-semibold rounded-xl py-3 submit-btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="submitting || !isDistanceValid || (showTurnstile && !turnstileToken)"
                >
                  提交记录
                </button>
              </div>
              <div v-else key="double-submit" class="flex w-full gap-3">
                <button
                  type="button"
                  class="flex-1 py-3 font-semibold rounded-xl theme-card-soft theme-text-secondary transition-all disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[var(--action-hover-bg)]"
                  :disabled="submitting || randomizing"
                  @click="cancelSubmitConfirm"
                >
                  取消
                </button>
                <button
                  type="button"
                  class="flex-1 py-3 font-semibold rounded-xl submit-btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="submitting || !isDistanceValid || (showTurnstile && !turnstileToken)"
                  @click="confirmSubmit"
                >
                  <i v-if="!submitting" class="ri-check-fill mr-1"></i>
                  <span class="loader" v-else></span>
                  {{ submitting ? '提交中...' : '确认' }}
                </button>
              </div>
            </transition>
      </form>

      <Drawer v-model="showAutoConfig" title="定时任务">
        <AutoConfig inline @saved="onAutoConfigSaved" />
      </Drawer>

      <!-- 分割线 -->
      <div v-show="activeTab === 'submit'" class="my-5" style="border-top: 1px solid var(--card-divider)"></div>

      <!-- 板块三：路线预览 -->
      <div v-show="activeTab === 'submit'" class="rounded-xl p-4" style="background: var(--section-soft-bg)">

        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold theme-text-primary">路线预览</span>
          </div>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-[var(--action-hover-bg)] active:scale-95"
            @click="openMapDrawer"
            title="自定义路线"
          >
            <i class="ri-draw-line text-sm"></i>
          </button>
        </div>
        <div class="rounded-xl overflow-hidden">
          <MapPreview
            v-if="mapRenderUnlocked"
            :track="displayTrack"
            :ready="mapReady"
            :map-style="isDark ? 'dark' : 'light'"
            class="w-full transition-all duration-300"
          />
        </div>
      </div>
    </div>

    <ConfirmDialog ref="confirmDialogRef" />

    <Drawer v-model="showRecords" title="跑步记录">
      <div class="px-4">
        <RunRecords />
      </div>
    </Drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, inject, defineAsyncComponent, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { submitRun as submitRunApi, useRouteGenerator } from '@/composables/useRun';
import { useDataStore } from '@/composables/useDataStore';
import { useThemeStore } from '@/composables/useTheme';
import { waitForAutorunPingReady } from '@/sdk/autorun';
import { deleteCustomMap, getCustomMapData, renameCustomMap } from '@/utils/map';
import Drawer from '@/components/ui/Drawer.vue';
import RunRecords from '@/components/RunRecords.vue';
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
const TurnstileWidget = defineAsyncComponent(() => import('./TurnstileWidget.vue'));
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
const showAutoConfig = ref(false);
const showRecords = ref(false);
const turnstileToken = ref('');
const turnstileRef = ref(null);

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);
const showTurnstile = computed(() => !!import.meta.env.VITE_TURNSTILE_SITE_KEY);

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
        iconWrapperClass: 'summary-icon-club',
        cardClass: 'summary-card-club',
      },
      {
        label: '跑步次数',
        value: `${runCompletionRate}%`,
        detail: `${completedRuns}/${totalRequiredRuns}`,
        icon: 'ri-numbers-fill',
        valueClass: 'summary-value-count',
        iconWrapperClass: 'summary-icon-count',
        cardClass: 'summary-card-count',
      },
      {
        label: '跑步里程',
        value: distancePercentageText,
        detail: `${totalDistanceKm}/${targetDistanceKmDisplay}`,
        icon: 'ri-footprint-fill',
        valueClass: 'summary-value-distance',
        iconWrapperClass: 'summary-icon-distance',
        cardClass: 'summary-card-distance',
      },
    ],
  };
});

const summaryCards = computed(() => stats.value.summaryCards);
const summaryCardView = reactive(
  Object.fromEntries(summaryCards.value.map((c) => [c.label, false])),
);
watch(summaryCards, (cards) => {
  for (const c of cards) {
    if (!(c.label in summaryCardView)) {
      summaryCardView[c.label] = false;
    }
  }
});
function toggleSummaryCard(label) {
  summaryCardView[label] = !summaryCardView[label];
}

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
      turnstileToken: turnstileToken.value,
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
    turnstileToken.value = '';
    turnstileRef.value?.reset();
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

.submit-btn-primary {
  color: var(--text-primary);
  border: 1.5px dashed var(--card-divider);
  background: var(--card-soft-bg);
  transition: all 0.18s ease;
}

.submit-btn-primary:hover {
  background: var(--action-hover-bg);
}

.submit-btn-primary:active {
  transform: scale(0.985);
}

.submit-btn-outline {
  color: #2563eb;
  border: 1.5px solid #2563eb;
  background: transparent;
}

.submit-btn-outline:hover {
  background: rgba(37, 99, 235, 0.06);
}

:global(.dark) .submit-btn-outline {
  color: #60a5fa;
  border-color: #60a5fa;
}

:global(.dark) .submit-btn-outline:hover {
  background: rgba(96, 165, 250, 0.1);
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
  transition: transform 0.15s ease;
}

.summary-card:active {
  transform: scale(0.985);
}

.summary-card-bg-icon {
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 56px;
  opacity: 0.1;
  pointer-events: none;
}

.summary-card-label {
  font-size: 13px;
  line-height: 1.3;
  color: var(--text-primary);
}

.summary-card-value {
  line-height: 1.2;
}

.summary-card-club {
  background: rgba(217, 119, 6, 0.07);
}

.summary-card-count {
  background: rgba(8, 145, 178, 0.07);
}

.summary-card-distance {
  background: rgba(22, 163, 74, 0.07);
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
