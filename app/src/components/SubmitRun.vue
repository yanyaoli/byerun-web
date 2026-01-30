<template>
  <div class="flex-1 flex flex-col min-h-0 relative w-full box-border">
    <!-- 完成情况卡片（始终显示） -->
    <div class="bg-white rounded-xl p-5 mb-5 border border-gray-200 w-full box-border">
      <div class="flex justify-between items-center bg-white border-b border-gray-200 pb-2">
        <div class="text-sm font-semibold text-gray-800">完成情况</div>
        <div class="text-sm text-gray-500">
          <i class="fa-solid fa-hourglass-end"></i> {{ semesterEndDateText }}
        </div>
      </div>
      <!-- 三个卡片表格布局 -->
      <div class="flex gap-2 pt-2 w-full">
        <div class="flex-1 bg-gray-100 rounded-xl p-3 flex flex-col items-center">
          <div class="text-lg font-semibold text-gray-800 mb-1">
            {{ totalActivities === 0 ? '0%' : Math.round(clubCompletionRate) + '%' }}
          </div>
          <div class="text-sm font-medium text-gray-800 mb-1 truncate">俱乐部活动</div>
          <div class="text-sm text-gray-500 mb-2">
            {{ completedActivities + '/' + totalActivities }}
          </div>
        </div>
        <div class="flex-1 bg-gray-100 rounded-xl p-3 flex flex-col items-center">
          <div class="text-lg font-semibold text-gray-800 mb-1">{{ runCompletionRate }}%</div>
          <div class="text-sm font-medium text-gray-800 mb-1">跑步次数</div>
          <div class="text-sm text-gray-500 mb-2">{{ completedRuns }}/{{ totalRequiredRuns }}</div>
        </div>
        <div class="flex-1 bg-gray-100 rounded-xl p-3 flex flex-col items-center">
          <div class="text-lg font-semibold text-gray-800 mb-1">
            {{ Math.round(distancePercentage) }}%
          </div>
          <div class="text-sm font-medium text-gray-800 mb-1">跑步里程</div>
          <div class="text-sm text-gray-500 mb-2">
            {{ totalDistanceKm }}/{{ Number(targetDistanceKm) ? targetDistanceKm : '0' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 主卡片：Tab 与 表单共存 -->
    <form @submit.prevent="handleSubmit" class="flex-1 flex flex-col min-h-0 overflow-visible">
      <div class="bg-white rounded-xl border border-gray-200 w-full box-border mb-5 p-5">
        <!-- Tab 按钮行 -->
        <div class="flex items-center mb-4 border-b border-gray-200 pb-2">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            @click="activeTab = tab.key"
            :class="[
              'flex-1 text-sm font-semibold transition-all text-center',
              activeTab === tab.key ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700',
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
                class="route-dropdown bg-gray-100 border border-gray-200 rounded-md p-2 cursor-pointer relative w-full box-border"
                @click="mapsLoaded && !submitting ? (showRouteOptions = !showRouteOptions) : null"
              >
                <div
                  class="selected-route flex items-center justify-between text-sm text-gray-800"
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
                  class="input-wrapper flex-1 flex items-center bg-gray-100 border border-gray-200 rounded-md px-3"
                >
                  <input
                    v-model.number="form.distance"
                    type="number"
                    step="1"
                    placeholder="输入里程"
                    required
                    class="flex-1 py-2 text-sm bg-transparent outline-none pr-2"
                  />
                  <span class="unit text-sm text-gray-500 pl-2">米</span>
                </div>
                <button
                  type="button"
                  class="ml-3 px-3 py-2 bg-gray-100 text-sm text-gray-600 cursor-pointer hover:bg-gray-200 disabled:opacity-50 rounded-md"
                  @click="onRandomFill"
                  :disabled="submitting"
                  aria-label="随机里程"
                >
                  <i class="fa-solid fa-dice"></i>
                </button>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                type="submit"
                class="w-full p-2 text-gray-600 bg-gray-200 rounded-full hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-200"
                :disabled="submitting || !paceLimit || !isDistanceValid"
              >
                <i v-if="!submitting" class="fa-solid fa-check"></i>
                <span class="loader" v-else></span>
                {{ submitting ? '提交中...' : '提交记录' }}
              </button>
            </div>
          </div>

          <!-- 定时任务 -->
          <div v-show="activeTab === 'schedule'" class="space-y-4">
            <div>
              <AutoConfig inline @saved="onAutoConfigSaved" />
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- 路线预览 -->
    <div
      v-show="activeTab === 'submit'"
      class="bg-white rounded-xl p-5 mb-5 border border-gray-200 w-full box-border"
    >
      <div class="flex justify-between items-center bg-white border-b border-gray-200 pb-2">
        <div class="text-sm font-semibold text-gray-800">路线预览</div>
      </div>
      <MapPreview
        :track="generatedTrack"
        :ready="mapReady"
        class="pt-2 w-full transition-all duration-300"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, inject, defineAsyncComponent } from 'vue';
import { submitRun as submitRunApi } from '@/composables/useRunSubmission';
import { computeDurationFromDistance, isPaceWithinLimits } from '@/utils/distance';
import { randomIntNonThousand } from '@/utils/random';
import { useRouteGenerator } from '@/composables/useRouteGenerator';
import { useDataStore } from '@/composables/useDataStore';
import { scheduledTaskConfig } from '@/utils/config';

// 异步组件
const MapPreview = defineAsyncComponent(() => import('./MapPreview.vue'));

const showMessage = inject('showMessage');

const {
  userInfo,
  runStandard,
  runInfo,
  activityInfo,
  submitRunDistance,
  submitRunRoute,
  userId,
  token,
} = useDataStore();

const emit = defineEmits(['submitted']);

const tabs = [
  { key: 'submit', label: '提交记录', icon: 'ri-add-line' },
  { key: 'schedule', label: '定时任务', icon: 'ri-calendar-schedule-line' },
];

const activeTab = ref('submit');

// 提交记录相关
const form = ref({
  distance: submitRunDistance.value,
  duration: 0,
  route: submitRunRoute.value,
  date: new Date().toISOString().split('T')[0],
});
const submitting = ref(false);
const showRouteOptions = ref(false);

const isDistanceValid = computed(() => {
  const d = Number(form.value.distance);
  return d >= 1000 && Number.isInteger(d);
});

const paceLimit = computed(() => isPaceWithinLimits(form.value.distance, form.value.duration));

async function syncDurationToDistance() {
  form.value.duration = computeDurationFromDistance(form.value.distance);
}

function onRandomFill() {
  const min = 1000,
    max = 7500;
  form.value.distance = randomIntNonThousand(min, max);
  syncDurationToDistance();
}

watch(
  () => form.value.distance,
  (val) => {
    submitRunDistance.value = val;
    syncDurationToDistance();
  },
);

const {
  mapsLoaded,
  routeOptions,
  mapDisplayNames,
  selectedRoute,
  load: loadMaps,
  selectRoute: selectMapRoute,
  getRouteName,
  generatedTrack,
  mapReady,
  regenerate,
} = useRouteGenerator(
  computed(() => form.value.distance),
  computed(() => form.value.route),
);

// 统计数据
const completedActivities = computed(() => {
  return activityInfo.value ? activityInfo.value.joinNum : 0;
});

const totalActivities = computed(() => {
  return activityInfo.value ? activityInfo.value.totalNum : 0;
});

const clubCompletionRate = computed(() => {
  if (!totalActivities.value) return 0;
  return (completedActivities.value / totalActivities.value) * 100;
});

const completedRuns = computed(() => {
  return runInfo.value ? runInfo.value.runValidCount : 0;
});

const totalRequiredRuns = computed(() => {
  if (runStandard.value && userInfo.value) {
    const gender = userInfo.value.gender;
    if (gender === '1') {
      return runStandard.value.boyAllRunTime || 0;
    } else if (gender === '2') {
      return runStandard.value.girlAllRunTime || 0;
    }
  }
  return 0;
});

const runCompletionRate = computed(() => {
  if (!totalRequiredRuns.value) return 0;
  return Math.min(100, Math.round((completedRuns.value / totalRequiredRuns.value) * 100));
});

const totalDistanceKm = computed(() => {
  if (runInfo.value && runInfo.value.runValidDistance) {
    const km = Number(runInfo.value.runValidDistance) / 1000;
    const truncated = Math.floor(km * 10) / 10;
    return truncated.toFixed(1);
  }
  return '0.0';
});

const targetDistanceKm = computed(() => {
  if (runStandard.value && userInfo.value) {
    const gender = userInfo.value.gender;
    if (gender === '1') {
      return (Number(runStandard.value.boyAllRunDistance) / 1000).toFixed(1);
    } else if (gender === '2') {
      return (Number(runStandard.value.girlAllRunDistance) / 1000).toFixed(1);
    }
  }
  return '0.0';
});

const distancePercentage = computed(() => {
  const target = Number(targetDistanceKm.value);
  const current = Number(totalDistanceKm.value);
  if (!target) return 0;
  return Math.min(100, (current / target) * 100);
});

const semesterEndDateText = computed(() => {
  const rs = runStandard.value || {};
  const semYear = String(rs.semesterYear || '');
  const last = semYear ? semYear.slice(-1) : '';

  if (last === '1') {
    return rs.firstSemesterDateEnd || '';
  }
  if (last === '2') {
    return rs.secondSemesterDateEnd || '';
  }
  return '';
});

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
  if (!paceLimit.value) {
    showMessage('配速不能小于6分钟/公里', 'error');
    return;
  }

  if (!Number.isInteger(form.value.distance) || form.value.distance < 1000) {
    showMessage('跑步里程必须为不小于1000米的正整数', 'error');
    return;
  }

  submitting.value = true;
  try {
    const res = await submitRunApi({ distance: form.value.distance });
    if (!res.ok) {
      const msg =
        res.msg === 'not_login'
          ? '请先登录'
          : res.data?.msg || res.error?.message || '提交失败，请重试';
      showMessage(msg, 'error');
      return;
    }

    showMessage(res.data?.response?.resultDesc || '提交成功', 'success');
    emit('submitted');
  } finally {
    submitting.value = false;
  }
};

// 使用独立组件展示/管理定时任务（复用 AutoConfig.vue）
import AutoConfig from './AutoConfig.vue';
const onAutoConfigSaved = () => {
  showMessage('设置已更新', 'success');
};

// 初始化提交记录组件
loadMaps().then(() => {
  if (submitRunRoute.value) {
    form.value.route = submitRunRoute.value;
  } else if (selectedRoute.value) {
    form.value.route = selectedRoute.value;
  }

  if (submitRunDistance.value) {
    form.value.distance = Number(submitRunDistance.value);
  } else {
    onRandomFill();
  }

  syncDurationToDistance();
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
  background: #fff;
  border: 1px solid #e3e6e8;
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
  color: #4f6d7a;
  cursor: pointer;
  transition: all 0.2s;
}

.route-option.selected,
.route-option:hover {
  background: #f0f7ff;
  color: #3b9eff;
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
  to {
    transform: rotate(360deg);
  }
}

select {
  -webkit-appearance: none;
  -moz-appearance: none;
  background: transparent;
}

option {
  background-color: #ffffff;
  color: #1f2937;
}
</style>
