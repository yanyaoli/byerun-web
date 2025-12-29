<template>
  <div class="flex-1 flex flex-col h-full relative w-full box-border">
    <div class="bg-white rounded-xl p-5 mb-5 border border-gray-200 w-full box-border">
      <div class="flex justify-between items-center bg-white border-b border-gray-200 pb-2">
        <div class="text-sm font-semibold text-gray-800">完成情况</div>
        <div class="text-sm text-gray-500">
          <i class="fa-solid fa-hourglass-end"></i> {{ semesterEndDateText }}
        </div>
      </div>
      <!-- 三个卡片表格布局 -->
      <div class="flex gap-2 pt-2 w-full">
        <div class="flex-1 bg-gray-100 rounded-xl p-3 flex flex-col items-center club-activity">
          <div class="text-lg font-semibold text-gray-800 mb-1">
            {{
              totalActivities === 0
                ? '0%'
                : Math.round(clubCompletionRate) + '%'
            }}
          </div>
          <div class="text-sm font-medium text-gray-800 mb-1 truncate">
            俱乐部活动
          </div>
          <div class="text-sm text-gray-500 mb-2">
            {{ completedActivities + '/' + totalActivities }}
          </div>
        </div>
        <div class="flex-1 bg-gray-100 rounded-xl p-3 flex flex-col items-center run-completion">
          <div class="text-lg font-semibold text-gray-800 mb-1">
            {{ runCompletionRate }}%
          </div>
          <div class="text-sm font-medium text-gray-800 mb-1">跑步次数</div>
          <div class="text-sm text-gray-500 mb-2">
            {{ completedRuns }}/{{ totalRequiredRuns }}
          </div>
        </div>
        <div class="flex-1 bg-gray-100 rounded-xl p-3 flex flex-col items-center distance-stats">
          <div class="text-lg font-semibold text-gray-800 mb-1">
            {{ Math.round(distancePercentage) }}%
          </div>
          <div class="text-sm font-medium text-gray-800 mb-1">跑步里程</div>
          <div class="text-sm text-gray-500 mb-2">
            {{ totalDistanceKm }}/{{
              Number(targetDistanceKm) ? targetDistanceKm : '0'
            }}
          </div>
        </div>
      </div>
    </div>

    <!-- 数据输入表单 -->
    <form @submit.prevent="handleSubmit">
      <div class="bg-white rounded-xl p-5 mb-5 border border-gray-200 w-full box-border">
        <div class="flex justify-between items-center bg-white border-b border-gray-200 pb-2">
          <div class="text-sm font-semibold text-gray-800">提交记录</div>
          <div class="text-sm text-gray-500">
            <button type="button" class="text-gray-600 cursor-pointer hover:text-gray-800"
              :class="{ active: showAutoModal }" @click="showAutoModal = !showAutoModal" :aria-pressed="showAutoModal"
              title="定时任务配置">
              <i class="fa-solid fa-alarm-clock"></i>
            </button>
          </div>
        </div>
        <!-- 跑步路线选择 -->
        <div class="form-group mt-4">
          <label class="block text-sm text-gray-500 mb-2 font-medium">选择地图</label>
          <div
            class="route-dropdown bg-gray-100 border border-gray-200 rounded-md p-2 cursor-pointer relative w-full box-border"
            @click="
              mapsLoaded && !submitting
                ? (showRouteOptions = !showRouteOptions)
                : null
              ">
            <div class="selected-route flex items-center justify-between text-sm text-gray-800"
              :class="{ disabled: !mapsLoaded || submitting }">
              <span v-if="!mapsLoaded">加载地图中...</span>
              <span v-else>{{ getRouteName(form.route) }}</span>
              <div class="dropdown-arrow" :class="{ active: showRouteOptions && mapsLoaded }" v-if="mapsLoaded"></div>
            </div>
            <transition name="dropdown">
              <div v-show="showRouteOptions && mapsLoaded" class="route-options">
                <div v-for="(name, value) in routeOptions" :key="value" class="route-option"
                  :class="{ selected: form.route === value }" @click.stop="selectRoute(value)">
                  {{ name }}
                </div>
                <div v-if="Object.keys(routeOptions).length === 0" class="route-option disabled">
                  无可用地图
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- 跑步里程输入 -->
        <div class="form-group">
          <label class="block text-sm text-gray-500 mt-2 mb-2 font-medium">跑步里程</label>
          <div class="input-container flex items-center">
            <div class="input-wrapper flex-1 flex items-center bg-gray-100 border border-gray-200 rounded-md px-3">
              <input v-model.number="form.distance" type="number" step="1" placeholder="输入里程" required
                class="flex-1 py-2 text-sm bg-transparent outline-none pr-2" />
              <span class="unit text-sm text-gray-500 pl-2">米</span>
            </div>
            <button type="button"
              class="ml-3 px-3 py-2 bg-gray-100 text-sm text-gray-600 cursor-pointer hover:bg-gray-200 disabled:opacity-50 rounded-md"
              @click="onRandomFill" :disabled="submitting" aria-label="随机里程">
              <i class="fa-solid fa-dice"></i>
            </button>
          </div>
        </div>

        <div class="flex gap-3 mt-5">
          <button type="submit"
            class="w-full p-2 text-gray-600 bg-gray-200 rounded-full hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-200"
            :disabled="submitting || !paceLimit || !isDistanceValid" :class="{ submitting: submitting }">
            <i v-if="!submitting" class="fa-solid fa-check"></i>
            <span class="loader" v-else></span>
            {{ submitting ? '提交中...' : '提交记录' }}
          </button>
        </div>
      </div>
    </form>

    <!-- 路线预览部分 -->
    <div class="bg-white rounded-xl p-5 mb-5 border border-gray-200 w-full box-border">
      <div class="flex justify-between items-center bg-white border-b border-gray-200 pb-2">
        <div class="text-sm font-semibold text-gray-800">路线预览</div>
        <div class="text-sm text-gray-500"></div>
      </div>
      <MapPreview :track="generatedTrack" :ready="mapReady" class="pt-2 w-full" />
    </div>

    <AutoConfig :visible="showAutoModal" @update:visible="updateAutoVisible" @saved="onAutoSaved" />
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
  nextTick,
} from 'vue';
import { submitRun as submitRunApi } from '@/composables/useRunSubmission';
import { computeDurationFromDistance, isPaceWithinLimits } from '@/utils/distance';
import { randomIntNonThousand } from '@/utils/random';
import { useRouteGenerator } from '@/composables/useRouteGenerator';

// 注入全局消息方法
const showMessage = inject('showMessage');

// 异步组件
const MapPreview = defineAsyncComponent(() => import('./MapPreview.vue'));
const AutoConfig = defineAsyncComponent(() => import('./AutoConfig.vue'));

// Props
const props = defineProps({
  userInfo: { type: Object, default: null },
  runStandard: { type: Object, default: null },
  runInfo: { type: Object, default: null },
  activityInfo: { type: Object, default: null },
});

// Emits
const emit = defineEmits(['submitted']);

// 将表单状态与非接口逻辑写回组件（更简单、可控）
const form = ref({
  distance: null,
  duration: 0,
  route: '',
  date: new Date().toISOString().split('T')[0],
});
const submitting = ref(false);

const isDistanceValid = computed(() => {
  const d = Number(form.value.distance);
  return d >= 1000 && Number.isInteger(d);
});

const paceLimit = computed(() =>
  isPaceWithinLimits(form.value.distance, form.value.duration)
);

async function syncDurationToDistance() {
  form.value.duration = computeDurationFromDistance(form.value.distance);
  await nextTick();
}

function onRandomFill() {
  const min = 1000,
    max = 7500;
  form.value.distance = randomIntNonThousand(min, max);
  syncDurationToDistance();
}

// 持久化里程到 localStorage
watch(
  () => form.value.distance,
  (val) => {
    try {
      localStorage.setItem('unirun_submitRunDistance', String(val));
    } catch (e) { }
    syncDurationToDistance();
  }
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
  computed(() => form.value.route)
);

const showAutoModal = ref(false);
const showRouteOptions = ref(false);
const animateProgress = ref(false);
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
    const km = Number(props.runInfo.runValidDistance) / 1000;
    const truncated = Math.floor(km * 10) / 10;
    return truncated.toFixed(1);
  }
  return '0.0';
});

const targetDistanceKm = computed(() => {
  if (props.runStandard && props.userInfo) {
    const gender = props.userInfo.gender;
    if (gender === '1') {
      return (Number(props.runStandard.boyAllRunDistance) / 1000).toFixed(1);
    } else if (gender === '2') {
      return (Number(props.runStandard.girlAllRunDistance) / 1000).toFixed(1);
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
  const rs = props.runStandard || {};
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
  showMessage('定时任务配置已保存', 'success');
}

function selectRoute(route) {
  if (!Object.prototype.hasOwnProperty.call(routeOptions.value, route)) {
    return;
  }
  selectMapRoute(route);
  form.value.route = route;
  showRouteOptions.value = false;
}

// 主要业务函数
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
      const msg = res.msg === 'not_login' ? '请先登录' : (res.data?.msg || res.error?.message || '提交失败，请重试');
      showMessage(msg, 'error');
      return;
    }

    showMessage(res.data?.response?.resultDesc || '提交成功', 'success');
    triggerProgressAnimation();
    emit('submitted');

  } finally {
    submitting.value = false;
  }
};

// 监听 form 对象的深层变化，确保所有字段更新都能触发重新计算
watch(
  () => form.value,
  () => {
    // 触发响应式更新
  },
  { deep: true }
);

watch(
  () => [form.value.distance, form.value.duration],
  () => {
    triggerProgressAnimation();
  },
  { deep: true }
);

// Lifecycle
onMounted(async () => {
  try {
    await loadMaps();

    // composable 会在 load 时恢复 saved route 或选择第一个 route
    if (selectedRoute.value) {
      form.value.route = selectedRoute.value;
    } else if (Object.keys(routeOptions.value).length > 0) {
      form.value.route = Object.keys(routeOptions.value)[0];
    }

    // 恢复上次保存的里程（若存在），否则生成随机距离
    const saved = localStorage.getItem('unirun_submitRunDistance');
    if (saved) {
      form.value.distance = Number(saved);
      await syncDurationToDistance();
    } else {
      onRandomFill();
    }
  } catch (e) { }

  setTimeout(() => {
    animateProgress.value = true;
  }, 500);
});
</script>

<style scoped>
.route-dropdown {
  position: relative;
  user-select: none;
  box-sizing: border-box;
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

@media (max-width: 375px) {
  .route-dropdown {
    padding: 8px;
  }
}
</style>
