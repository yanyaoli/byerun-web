<template>
  <div class="flex-1 flex flex-col min-h-0 relative w-full box-border gap-4 pb-2">
    <!-- 板块一：完成情况 -->
    <section class="rounded-xl p-4 bg-transparent border border-[var(--card-border)]">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold theme-text-primary">完成情况</span>
          </div>
          <div class="text-xs theme-text-tertiary flex items-center gap-1.5">
            <template v-if="stats.semesterEndDateText">
              <span>截止</span>
              <span>{{ stats.semesterEndDateText }}</span>
            </template>
          </div>
        </div>
        <div class="flex gap-3">
          <div
            v-for="card in summaryCards"
            :key="card.label"
            class="summary-card relative overflow-hidden rounded-lg flex-1 min-w-0"
            style="padding: 12px 8px"
            :class="[card.cardClass]"
          >
            <i
              :class="[card.icon, 'summary-card-bg-icon']"
              aria-hidden="true"
            ></i>
            <div class="relative z-[1] flex flex-col items-center justify-center gap-1 h-full">
              <span class="summary-card-label font-medium truncate">{{ card.label }}</span>
              <span
                :class="['summary-card-value text-lg font-bold tabular-nums leading-none', card.valueClass]"
              >{{ card.value }}</span>
              <span class="summary-card-detail text-xs theme-text-tertiary tabular-nums leading-none truncate">
                {{ card.detail }}
              </span>
            </div>
          </div>
        </div>
      </section>

    <!-- 板块二：提交记录 -->
    <form @submit.prevent="onFormSubmit" class="rounded-xl p-4 bg-transparent border border-[var(--card-border)]">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold theme-text-primary">提交记录</span>
            <span
              v-if="autoRunEnabled"
              class="h-4.5 px-1.5 rounded-full text-[10px] font-medium inline-flex items-center border theme-success-border theme-success-bg theme-success"
            >
              自动任务已启用
            </span>
          </div>
          <div class="flex items-center gap-2">
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

              <Drawer v-model="showRouteOptions" title="选择地图" max-height="80vh" v-if="mapsLoaded">
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

            <transition name="confirm-actions" mode="out-in">
              <div v-if="!awaitingSubmitConfirm" class="flex w-full gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  class="flex-1"
                  :disabled="submitting || autoRunSaving || autoRunLoading"
                  @click="toggleAutoRun"
                >
                  <i
                    :class="autoRunSaving ? 'ri-loader-4-line animate-spin' : 'ri-timer-line'"
                    class="mr-1 shrink-0 text-base"
                  ></i>
                  {{ autoRunSaving ? (autoRunEnabled ? '停用中...' : '启用中...') : autoRunEnabled ? '停用自动任务' : '启用自动任务' }}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  class="flex-1"
                  :is-pending="submitting"
                  :disabled="submitting || !isDistanceValid"
                >
                  <i v-if="submitting" class="ri-loader-4-line animate-spin mr-1.5 shrink-0 text-base"></i>
                  提交记录
                </Button>
              </div>
              <div v-else key="double-submit" class="flex w-full gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  class="flex-1"
                  :disabled="submitting || randomizing"
                  @click="cancelSubmitConfirm"
                >
                  取消
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  class="flex-1"
                  :is-pending="submitting"
                  :disabled="submitting || !isDistanceValid"
                  @click="confirmSubmit"
                >
                  <i v-if="submitting" class="ri-loader-4-line animate-spin mr-1.5 shrink-0 text-base"></i>
                  <i v-else class="ri-check-fill mr-1"></i>
                  {{ submitting ? '提交中...' : '确认' }}
                </Button>
              </div>
            </transition>

            <p class="mt-2.5 text-[11px] theme-text-tertiary leading-relaxed">
              每日非定时自动提交记录，跑步里程和时长使用随机值，可选固定地图
            </p>
      </form>

    <!-- 执行记录模块 -->
    <section class="rounded-xl p-3.5 bg-transparent border border-[var(--card-border)]">
      <div class="flex items-center justify-between gap-2 mb-2">
        <div class="flex items-center gap-1.5 min-w-0">
          <span class="text-xs font-semibold theme-text-primary flex items-center gap-1">
            <i class="ri-history-line text-sm theme-text-tertiary"></i>
            <span>执行记录</span>
          </span>
          <span
            class="h-4.5 px-1.5 rounded-full text-[10px] font-medium inline-flex items-center border"
            :class="
              autoRunEnabled
                ? 'theme-success-border theme-success-bg theme-success'
                : 'bg-[var(--card-soft-bg)] theme-text-secondary border-[var(--card-border)]'
            "
          >
            {{ autoRunEnabled ? '已启用' : '未启用' }}
          </span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span v-if="autoRunLastLabel" class="text-[10px] font-mono theme-text-tertiary">{{ autoRunLastLabel }}</span>
          <button
            type="button"
            class="text-[11px] text-sky-500 hover:text-sky-400 inline-flex items-center gap-0.5 transition-colors cursor-pointer"
            @click="toggleAutoRunHistory"
          >
            <span>{{ showAutoRunHistory ? '收起历史' : '查看历史' }}</span>
            <i :class="showAutoRunHistory ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
          </button>
        </div>
      </div>

      <div v-if="autoRunLoading" class="space-y-1.5 py-1">
        <SkeletonBox width="60%" height="13px" radius="4px" />
        <SkeletonBox width="100%" height="28px" radius="6px" />
      </div>

      <div v-else class="space-y-2">
        <div v-if="autoRuntime.todayExecuted" class="space-y-1.5">
          <div class="flex items-center gap-1.5">
            <i
              :class="autoRuntime.todaySuccess ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'"
              class="text-sm shrink-0"
              :style="{ color: autoRuntime.todaySuccess ? 'var(--success-color, #22c55e)' : 'var(--danger-color, #ef4444)' }"
            ></i>
            <span class="text-xs font-medium theme-text-primary">
              今日已于 <span class="font-mono">{{ autoRunExecutedTimeText }}</span>
              {{ autoRuntime.todaySuccess ? '执行成功' : '执行失败' }}
            </span>
          </div>
          <div
            v-if="autoRuntime.msg"
            class="rounded-lg p-2 bg-black/10 dark:bg-white/5 border border-white/10 text-xs flex items-start justify-between gap-2"
          >
            <div
              class="font-mono text-[11px] break-all select-all leading-relaxed flex-1"
              :class="autoRuntime.todaySuccess ? 'theme-success' : 'theme-danger'"
            >
              {{ autoRuntime.msg }}
            </div>
            <button
              type="button"
              class="shrink-0 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              title="复制结果信息"
              @click="copyAutoRunText(autoRuntime.msg)"
            >
              <i class="ri-file-copy-line text-xs"></i>
            </button>
          </div>
        </div>

        <div v-else-if="autoRunEnabled" class="space-y-1">
          <div class="flex items-center gap-1.5 text-xs theme-text-secondary">
            <i class="ri-time-line text-sm shrink-0 text-sky-500"></i>
            <span>{{ autoRuntime.msg || '已启用每日自动任务，将在每日 07:00 ~ 24:00 顺序执行' }}</span>
          </div>
          <div class="text-[11px] theme-text-tertiary">
            固定地图：{{ autoRunMapNameText }}
          </div>
        </div>

        <div v-else class="space-y-1">
          <p class="text-[11px] theme-text-tertiary">未启用自动任务</p>
          <div
            v-if="autoRuntime.msg && autoRuntime.msg !== '未启用自动任务' && autoRuntime.msg !== '未启用定时任务' && autoRuntime.msg !== '定时任务已停用'"
            class="rounded-lg p-2 bg-black/5 dark:bg-white/5 text-[11px] font-mono theme-text-tertiary break-all select-all flex items-start justify-between gap-2"
          >
            <span>上次结果：{{ autoRuntime.msg }}</span>
            <button
              type="button"
              class="shrink-0 p-0.5 hover:opacity-80 transition-opacity"
              title="复制"
              @click="copyAutoRunText(autoRuntime.msg)"
            >
              <i class="ri-file-copy-line text-xs"></i>
            </button>
          </div>
        </div>

        <div v-if="showAutoRunHistory" class="mt-2 pt-2 border-t border-[var(--card-border)] space-y-1.5">
          <div v-if="loadingAutoRunHistory" class="space-y-1.5 py-1">
            <div
              v-for="idx in 3"
              :key="`run-history-skel-${idx}`"
              class="flex items-center justify-between gap-2 p-1.5 rounded bg-black/5 dark:bg-white/5"
            >
              <div class="flex items-center gap-2 flex-1">
                <SkeletonBox width="6px" height="6px" radius="9999px" />
                <SkeletonBox width="80px" height="12px" radius="4px" />
              </div>
              <SkeletonBox width="46px" height="12px" radius="4px" />
            </div>
          </div>
          <div v-else-if="autoRunHistoryRecords.length === 0" class="text-center py-2 text-[11px] theme-text-tertiary">
            暂无历史执行记录
          </div>
          <div
            v-for="rec in autoRunHistoryRecords"
            :key="`run-rec-${rec.id}-${rec.created_at}`"
            class="flex items-start justify-between gap-2 p-2 rounded-lg bg-black/5 dark:bg-white/5 text-[11px]"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 text-[10px] mb-0.5">
                <span
                  class="w-1.5 h-1.5 rounded-full shrink-0"
                  :class="rec.success ? 'bg-emerald-500' : 'bg-rose-500'"
                ></span>
                <span v-if="rec.map_id" class="theme-text-secondary truncate max-w-[140px]">
                  {{ getRouteName(rec.map_id) || rec.map_id }}
                </span>
                <span class="theme-text-tertiary font-mono ml-auto shrink-0">
                  {{ rec.created_at }}
                </span>
              </div>
              <div class="font-mono text-[10px] theme-text-secondary break-all select-all">
                {{ rec.message }}
              </div>
            </div>
            <button
              type="button"
              class="shrink-0 p-0.5 hover:opacity-80 transition-opacity"
              title="复制"
              @click="copyAutoRunText(rec.message)"
            >
              <i class="ri-file-copy-line text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 板块三：路线预览 -->
    <div v-show="activeTab === 'submit'" class="rounded-xl p-4 bg-transparent border border-[var(--card-border)]">
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

    <ConfirmDialog ref="confirmDialogRef" />

    <Drawer v-model="showRecords" title="跑步记录">
      <div class="px-4">
        <RunRecords />
      </div>
    </Drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, inject, defineAsyncComponent, onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { submitRun as submitRunApi, useRouteGenerator } from '@/composables/useRun';
import { useDataStore } from '@/composables/useDataStore';
import { useThemeStore } from '@/composables/useTheme';
import { waitForAutorunPingReady, getAutorunClient } from '@/sdk/app';
import { deleteCustomMap, getCustomMapData, renameCustomMap, loadCustomMaps } from '@/utils/map';
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
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import { Button } from 'heroui-vue';
import { SkeletonBox } from 'skullet/vue';
import MapPreview from '@/components/MapPreview.vue';

import { showMessage } from '@/composables/useMessage';

const router = useRouter();

const { token, userInfo, runStandard, runInfo, activityInfo, submitRunDistance, submitRunRoute } =
  useDataStore();

const emit = defineEmits(['submitted']);

const activeTab = ref('submit');

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
const showRecords = ref(false);

// 自动任务与执行记录相关
const autoRunEnabled = ref(false);
const autoRunMapId = ref('');
const autoRunLoading = ref(false);
const autoRunSaving = ref(false);
const autoRuntime = reactive({
  todayExecuted: false,
  todaySuccess: false,
  msg: '',
  lastRunAt: '',
});
const showAutoRunHistory = ref(false);
const loadingAutoRunHistory = ref(false);
const autoRunHistoryRecords = ref([]);

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

const autoRunLastLabel = computed(() => {
  if (!autoRuntime.lastRunAt) return '';
  const parts = String(autoRuntime.lastRunAt).split(' ');
  return parts.length > 1 ? parts[1] : autoRuntime.lastRunAt;
});

const autoRunExecutedTimeText = computed(() => {
  if (!autoRuntime.todayExecuted) return '';
  const parts = String(autoRuntime.lastRunAt || '').split(' ');
  if (parts.length === 2 && parts[1]) return parts[1].substring(0, 5);
  return '今日';
});

const autoRunMapNameText = computed(() => {
  const id = String(autoRunMapId.value || '').trim();
  if (!id) return '未指定（默认地图）';
  return getRouteName(id) || id;
});

const applyAutoRunStatus = (data = {}) => {
  autoRunEnabled.value = Number(data.enabled) === 1 || data.enabled === true;
  autoRunMapId.value = String(data.map_id || '').trim();
  autoRuntime.todayExecuted = !!data.today_executed;
  autoRuntime.todaySuccess = !!data.today_success;
  autoRuntime.msg = String(data.msg || data.today_result || data.last_result || '');
  autoRuntime.lastRunAt = String(data.last_run_at || '');
};

const loadAutoRunStatus = async (silent = false) => {
  const client = getAutorunClient();
  if (!client || !token.value) return;
  if (!silent) autoRunLoading.value = true;
  try {
    const statusEnvelope = await client.getStatus(token.value);
    applyAutoRunStatus(statusEnvelope?.data || {});
  } catch (error) {
    console.error('loadAutoRunStatus failed:', error);
  } finally {
    autoRunLoading.value = false;
  }
};

const loadAutoRunHistory = async () => {
  const client = getAutorunClient();
  if (!client || !token.value || loadingAutoRunHistory.value) return;
  loadingAutoRunHistory.value = true;
  try {
    const res = await client.getRunHistory(token.value, { limit: 15 });
    autoRunHistoryRecords.value = Array.isArray(res?.data?.records) ? res.data.records : [];
  } catch (error) {
    console.error('getRunHistory failed:', error);
  } finally {
    loadingAutoRunHistory.value = false;
  }
};

const toggleAutoRunHistory = () => {
  showAutoRunHistory.value = !showAutoRunHistory.value;
  if (showAutoRunHistory.value && autoRunHistoryRecords.value.length === 0) {
    loadAutoRunHistory();
  }
};

const toggleAutoRun = async () => {
  const client = getAutorunClient();
  if (!client || autoRunSaving.value) return;
  if (!token.value) {
    showMessage('请先登录', 'error');
    return;
  }

  const nextEnabled = !autoRunEnabled.value;
  const currentRoute = String(form.value.route || '').trim();
  const payload = {
    enabled: nextEnabled ? 1 : 0,
  };
  if (nextEnabled) {
    payload.map_id = currentRoute && !isCustomRoute(currentRoute) ? currentRoute : '';
  }

  autoRunSaving.value = true;
  try {
    const statusEnvelope = await client.getStatus(token.value, payload);
    applyAutoRunStatus(statusEnvelope?.data || {});
    showMessage(autoRunEnabled.value ? '自动任务已启用' : '自动任务已停用', 'success');
    if (showAutoRunHistory.value) {
      loadAutoRunHistory();
    }
  } catch (error) {
    showMessage(error?.message || '更新自动任务失败', 'error');
  } finally {
    autoRunSaving.value = false;
  }
};

const copyAutoRunText = async (text) => {
  if (!text) return;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      showMessage('结果已复制到剪贴板', 'success');
      return;
    }
  } catch (e) {
    // fallback
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  showMessage('结果已复制到剪贴板', 'success');
};

const unlockMapRender = async () => {
  await waitForAutorunPingReady();
  mapRenderUnlocked.value = true;
};

watch(
  token,
  (newToken) => {
    if (newToken) {
      loadAutoRunStatus(true);
    }
  },
);

onMounted(() => {
  checkMapDrawerResult();
  unlockMapRender();
  loadAutoRunStatus();
});

onActivated(async () => {
  checkMapDrawerResult();
  loadCustomMaps(true);
  await loadMaps();
  loadAutoRunStatus(true);
  if (
    pendingDrawerRoute.value &&
    Object.prototype.hasOwnProperty.call(routeOptions.value, pendingDrawerRoute.value)
  ) {
    selectRoute(pendingDrawerRoute.value);
    pendingDrawerRoute.value = '';
  }
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

.summary-card-detail {
  font-size: 12px;
  line-height: 1.2;
  color: var(--text-tertiary);
  font-family: 'SF Mono', 'Cascadia Code', monospace;
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
