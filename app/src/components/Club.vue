<template>
  <div class="club-page min-h-full pb-4">
    <section class="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="tab in MAIN_TABS"
          :key="tab.key"
          type="button"
          :class="[
            'h-9 rounded-xl border text-xs font-medium transition-colors',
            activeMainTab === tab.key
              ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-200'
              : 'border-white/10 bg-white/5 text-gray-300',
          ]"
          @click="activeMainTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="activeMainTab === 'activities'" class="mt-3 grid grid-cols-2 gap-2">
        <button
          v-for="tab in ACTIVITY_SUB_TABS"
          :key="tab.key"
          type="button"
          :class="[
            'h-8 rounded-xl border text-xs font-medium transition-colors',
            activeActivityTab === tab.key
              ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-200'
              : 'border-white/10 bg-white/5 text-gray-300',
          ]"
          @click="activeActivityTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="activeMainTab === 'history'" class="mt-3 grid grid-cols-2 gap-2">
        <button
          v-for="tab in HISTORY_SUB_TABS"
          :key="tab.key"
          type="button"
          :class="[
            'h-8 rounded-xl border text-xs font-medium transition-colors',
            activeHistoryTab === tab.key
              ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-200'
              : 'border-white/10 bg-white/5 text-gray-300',
          ]"
          @click="activeHistoryTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="mt-3 flex items-start gap-2">
        <div
          v-if="activeMainTab === 'activities' && activeActivityTab === 'list'"
          ref="datePickerRef"
          class="relative flex-1"
        >
          <button
            type="button"
            class="w-full h-9 px-3 rounded-xl border border-white/10 bg-white/5 text-xs text-gray-100 inline-flex items-center justify-between"
            @click="showDateDropdown = !showDateDropdown"
          >
            <span class="truncate">{{ selectedDateLabel }}</span>
            <i
              :class="showDateDropdown ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"
              class="text-sm"
            ></i>
          </button>

          <transition name="fade-slide">
            <div
              v-if="showDateDropdown"
              class="absolute left-0 right-0 top-11 z-30 rounded-xl border border-white/10 bg-stone-900/95 backdrop-blur max-h-44 overflow-y-auto"
            >
              <button
                v-for="day in dateOptions"
                :key="day.value"
                type="button"
                :class="[
                  'w-full h-9 px-3 text-left text-xs border-b border-white/5 last:border-b-0 transition-colors',
                  selectedQueryDate === day.value
                    ? 'text-cyan-200 bg-cyan-400/10'
                    : 'text-gray-200 hover:bg-white/5',
                ]"
                @click="selectQueryDate(day.value)"
              >
                {{ day.label }} {{ day.shortDate }}
              </button>
            </div>
          </transition>
        </div>

        <button
          type="button"
          class="h-9 px-3 rounded-xl border border-white/10 bg-white/5 text-gray-200 text-xs font-medium flex items-center gap-1.5"
          @click="showFilters = !showFilters"
        >
          <i class="ri-equalizer-line text-sm"></i>
          <span>筛选</span>
        </button>
      </div>

      <transition name="fade-slide">
        <div v-show="showFilters" class="mt-3 space-y-2">
          <div class="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              type="button"
              :class="[
                'shrink-0 h-8 px-3 rounded-full border text-xs transition-colors',
                selectedStatus === option.value
                  ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-200'
                  : 'border-white/10 bg-white/5 text-gray-300',
              ]"
              @click="selectedStatus = option.value"
            >
              {{ option.label }}
            </button>
          </div>

          <div
            v-if="activeMainTab === 'activities'"
            class="flex items-center gap-2 overflow-x-auto pb-1"
          >
            <button
              v-for="item in itemFilterOptions"
              :key="item.value"
              type="button"
              :class="[
                'shrink-0 h-8 px-3 rounded-full border text-xs transition-colors',
                selectedItemId === item.value
                  ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-200'
                  : 'border-white/10 bg-white/5 text-gray-300',
              ]"
              @click="selectedItemId = item.value"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </transition>
    </section>

    <section v-if="activeMainTab === 'history'" class="mt-3 grid grid-cols-2 gap-2">
      <div class="rounded-xl border border-white/10 bg-white/5 p-3">
        <div class="text-[11px] text-gray-400">累计报名</div>
        <div class="mt-1 text-xl font-semibold text-white">{{ summary.joinNum }}</div>
      </div>
      <div class="rounded-xl border border-white/10 bg-white/5 p-3">
        <div class="text-[11px] text-gray-400">有效签到</div>
        <div class="mt-1 text-xl font-semibold text-emerald-300">{{ summary.validNum }}</div>
      </div>
    </section>

    <section
      v-if="activeMainTab === 'activities'"
      class="mt-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3"
    >
      <div v-if="signTask" class="space-y-2 text-sm text-cyan-50">
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm font-semibold leading-5 text-cyan-100">
            {{ signTask.activityName || '未命名活动' }}
          </p>
          <div class="shrink-0 flex flex-col items-end gap-2">
            <span :class="signTaskPanelStatus.badgeClass">{{ signTaskPanelStatus.label }}</span>
            <button
              type="button"
              :disabled="!signTaskAction || signTaskAction.disabled || signPendingType !== ''"
              :class="[
                'h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors',
                signTaskAction?.buttonClass || 'bg-white/10 text-gray-300',
                (!signTaskAction || signTaskAction.disabled || signPendingType !== '') &&
                  'opacity-70 cursor-not-allowed',
              ]"
              @click="handleSignTaskAction(signTaskAction?.type || '')"
            >
              <i v-if="signPendingType" class="ri-loader-4-line animate-spin"></i>
              <span>{{
                signPendingType
                  ? signTaskAction?.pendingLabel || '提交中'
                  : signTaskAction?.label || '无可执行操作'
              }}</span>
            </button>
          </div>
        </div>
        <p class="text-xs text-cyan-100/80 leading-5">
          活动时间：{{ signTask.startTime || '--:--' }} - {{ signTask.endTime || '--:--' }}
        </p>
        <p class="text-xs text-cyan-100/80 leading-5">
          活动地点：{{ signTask.addressDetail || signTask.address || '地点待定' }}
        </p>
        <p class="text-xs text-cyan-100/80 leading-5">
          签到时间：{{ signTask.signInTime || '--' }}
        </p>
        <p class="text-xs text-cyan-100/80 leading-5">
          签退时间：{{ signTask.signBackTime || signTask.signBackLimitTime || '--' }}
        </p>
      </div>

      <div v-else class="mt-3 text-xs text-cyan-100/80">当前没有可执行签到/签退任务</div>
    </section>

    <section class="mt-3 flex items-center justify-between text-xs text-gray-400">
      <span>{{ currentListTitle }}</span>
      <span>共 {{ filteredList.length }} 条</span>
    </section>

    <section class="mt-2 space-y-3">
      <template v-if="loading">
        <div
          v-for="idx in 4"
          :key="`skeleton-${idx}`"
          class="rounded-2xl border border-white/10 bg-white/5 p-3 animate-pulse"
        >
          <div class="h-4 w-2/3 bg-white/10 rounded"></div>
          <div class="mt-3 h-3 w-full bg-white/10 rounded"></div>
          <div class="mt-2 h-3 w-4/5 bg-white/10 rounded"></div>
        </div>
      </template>

      <div
        v-else-if="cards.length === 0"
        class="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-gray-400"
      >
        {{ emptyMessage }}
      </div>

      <article
        v-for="card in cards"
        :key="card.key"
        class="rounded-2xl border border-white/10 bg-white/5 p-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-semibold text-white truncate">{{ card.title }}</h3>
            <p class="mt-1 text-xs text-gray-400 truncate">{{ card.subTitle }}</p>
          </div>
          <span :class="card.badgeClass">{{ card.badgeText }}</span>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-300">
          <div class="meta-pill">
            <i class="ri-time-line"></i>
            <span class="truncate">{{ card.timeText }}</span>
          </div>
          <div class="meta-pill">
            <i :class="card.metaSecondaryIcon"></i>
            <span class="truncate">{{ card.metaSecondaryText }}</span>
          </div>
          <div v-if="card.metaTertiaryText" class="meta-pill col-span-2">
            <i :class="card.metaTertiaryIcon"></i>
            <span class="truncate">{{ card.metaTertiaryText }}</span>
          </div>
        </div>

        <p v-if="card.showIntro" class="mt-3 text-xs text-gray-400 leading-5 intro-text">
          {{ card.introText }}
        </p>

        <div v-if="card.action" class="mt-3 flex items-center justify-end">
          <button
            type="button"
            :disabled="card.action.disabled || isCardActionPending(card)"
            :class="[
              'h-8 px-3 rounded-lg text-xs font-medium text-white transition-colors inline-flex items-center gap-1.5',
              card.action.buttonClass,
              (card.action.disabled || isCardActionPending(card)) &&
                'opacity-70 cursor-not-allowed',
            ]"
            @click="handleCardAction(card)"
          >
            <i v-if="isCardActionPending(card)" class="ri-loader-4-line animate-spin"></i>
            <span>{{
              isCardActionPending(card) ? card.action.pendingLabel : card.action.label
            }}</span>
          </button>
        </div>
      </article>

      <div
        v-if="
          activeMainTab === 'history' &&
          activeHistoryTab === 'record' &&
          cards.length > 0 &&
          historyHasMore
        "
        class="pt-1"
      >
        <button
          type="button"
          class="w-full h-9 rounded-xl border border-white/10 bg-white/5 text-xs text-gray-200 inline-flex items-center justify-center gap-1.5"
          :disabled="historyLoadingMore"
          @click="loadMoreHistoryRecords"
        >
          <i v-if="historyLoadingMore" class="ri-loader-4-line animate-spin"></i>
          <span>{{ historyLoadingMore ? '加载中...' : '加载更多' }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';
import { api } from '@/composables/useApi';
import { useDataStore } from '@/composables/useDataStore';

const MAIN_TABS = [
  { key: 'activities', label: '活动列表' },
  { key: 'history', label: '历史记录' },
];

const ACTIVITY_SUB_TABS = [
  { key: 'list', label: '活动列表' },
  { key: 'myTask', label: '我的任务' },
];

const HISTORY_SUB_TABS = [
  { key: 'record', label: '签到记录' },
  { key: 'semester', label: '学期记录' },
];

const STATUS_OPTIONS_MAP = {
  pending: [
    { value: 'all', label: '全部' },
    { value: 'joined', label: '已报名' },
    { value: 'joinable', label: '可报名' },
    { value: 'full', label: '报名已满' },
    { value: 'blocked', label: '无法报名' },
  ],
  semester: [
    { value: 'all', label: '全部' },
    { value: 'completed', label: '已完成' },
    { value: 'pending', label: '未完成' },
  ],
  history: [
    { value: 'all', label: '全部' },
    { value: 'completed', label: '已完成' },
    { value: 'unsigned', label: '未签到' },
    { value: 'notSignOut', label: '未签退' },
  ],
};

const WEEKDAY_TEXT = {
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
  7: '日',
};

const showMessage = inject('showMessage', () => {});
const { userInfo, token, loading: userLoading, fetchUserData } = useDataStore();

const activeMainTab = ref('activities');
const activeActivityTab = ref('list');
const activeHistoryTab = ref('record');
const selectedQueryDate = ref(formatDate(new Date()));
const selectedStatus = ref('all');
const selectedItemId = ref('all');
const showFilters = ref(false);
const showDateDropdown = ref(false);

const pendingActivities = ref([]);
const myPendingActivities = ref([]);
const semesterActivities = ref([]);
const historyRecords = ref([]);
const itemOptions = ref([]);
const itemOptionsLoaded = ref(false);
const itemOptionsLoading = ref(false);
const summary = ref({ joinNum: 0, validNum: 0 });

const HISTORY_PAGE_SIZE = 15;
const historyPageNo = ref(1);
const historyHasMore = ref(false);
const historyLoadingMore = ref(false);

const signTask = ref(null);
const signPendingType = ref('');

const loading = ref(false);
const clubActionPendingMap = ref({});
const datePickerRef = ref(null);

let ensureAuthPromise = null;

const studentId = computed(() => {
  const value = Number(userInfo.value?.studentId || 0);
  return Number.isFinite(value) && value > 0 ? value : null;
});

const schoolId = computed(() => {
  const value = Number(userInfo.value?.schoolId || 0);
  return Number.isFinite(value) && value > 0 ? value : null;
});

const dateOptions = computed(() => buildDateOptions());
const currentQueryDate = computed(() => selectedQueryDate.value || formatDate(new Date()));
const selectedDateLabel = computed(() => {
  const selected = dateOptions.value.find((item) => item.value === currentQueryDate.value);
  if (selected) return `${selected.label} ${selected.shortDate}`;
  const now = new Date();
  return `周${WEEKDAY_TEXT[resolveWeekDayNumber(now)]} ${formatMonthDay(now)}`;
});
const statusOptions = computed(() => {
  if (activeMainTab.value === 'activities') return STATUS_OPTIONS_MAP.pending;
  return activeHistoryTab.value === 'semester'
    ? STATUS_OPTIONS_MAP.semester
    : STATUS_OPTIONS_MAP.history;
});

const itemFilterOptions = computed(() => {
  const options = [{ value: 'all', label: '全部项目' }];
  itemOptions.value.forEach((item) => {
    options.push({ value: String(item.itemId), label: item.itemName || `项目${item.itemId}` });
  });
  return options;
});

const sourceList = computed(() => {
  if (activeMainTab.value === 'activities') {
    return activeActivityTab.value === 'myTask'
      ? myPendingActivities.value
      : pendingActivities.value;
  }
  return activeHistoryTab.value === 'semester' ? semesterActivities.value : historyRecords.value;
});

const filteredList = computed(() => {
  let list = sourceList.value;
  if (activeMainTab.value === 'activities' && selectedItemId.value !== 'all') {
    list = list.filter((item) => String(item.activityItemId || '') === selectedItemId.value);
  }

  if (selectedStatus.value !== 'all') {
    list = list.filter((item) => resolveStatusBucket(item) === selectedStatus.value);
  }

  return list;
});

const cards = computed(() =>
  filteredList.value.map((item, index) => {
    const activityId = resolveActivityId(item);
    const key = String(activityId || item.configurationId || item.yymmdd || 'club') + '-' + index;
    const badge = resolveBadge(item);
    const isHistoryRecord =
      activeMainTab.value === 'history' && activeHistoryTab.value === 'record';

    return {
      key,
      item,
      activityId,
      action:
        activeMainTab.value === 'activities' && Number.isFinite(activityId) && activityId > 0
          ? resolveClubAction(item)
          : null,
      title: item.activityName || '活动 #' + (activityId || index + 1),
      subTitle: resolveCardSubTitle(item, isHistoryRecord),
      badgeText: badge.text,
      badgeClass: badge.className,
      timeText: formatTimeRange(item),
      metaSecondaryIcon: isHistoryRecord ? 'ri-calendar-line' : 'ri-team-line',
      metaSecondaryText: isHistoryRecord ? formatHistoryWeekDate(item) : formatCapacity(item),
      metaTertiaryIcon: isHistoryRecord ? '' : 'ri-map-pin-line',
      metaTertiaryText: isHistoryRecord ? '' : item.addressDetail || item.address || '地点待定',
      showIntro: false,
      introText: '',
    };
  }),
);

const currentListTitle = computed(() => {
  if (activeMainTab.value === 'activities') {
    if (activeActivityTab.value === 'myTask') return '我的任务';
    return `活动列表（${currentQueryDate.value}）`;
  }
  if (activeHistoryTab.value === 'semester') return '学期记录（queryMySemesterClubActivity）';
  return '历史记录';
});

const emptyMessage = computed(() => {
  if (activeMainTab.value === 'activities') {
    return activeActivityTab.value === 'myTask' ? '暂无我的任务数据' : '暂无活动列表数据';
  }
  if (activeHistoryTab.value === 'semester') return '暂无学期记录';
  return '暂无历史记录';
});

const signTaskPhase = computed(() => resolveSignTaskPhase(signTask.value));
const signTaskPanelStatus = computed(() => {
  switch (signTaskPhase.value) {
    case 'joined':
      return createBadge('已报名', 'bg-amber-500/20 text-amber-200');
    case 'signedIn':
      return createBadge('已签到', 'bg-emerald-500/20 text-emerald-200');
    case 'completed':
      return createBadge('已完成', 'bg-sky-500/20 text-sky-200');
    default:
      return createBadge('未签到', 'bg-white/10 text-gray-300');
  }
});

const signTaskAction = computed(() => {
  const task = signTask.value;
  if (!task) return null;

  if (signTaskPhase.value === 'completed') {
    return {
      type: '',
      label: '已完成',
      pendingLabel: '已完成',
      disabled: true,
      buttonClass: 'bg-emerald-500/20 text-emerald-200',
    };
  }

  if (signTaskPhase.value === 'signedIn') {
    return {
      type: '2',
      label: '签退',
      pendingLabel: '签退中',
      disabled: false,
      buttonClass: 'bg-amber-500/85 text-white',
    };
  }

  if (signTaskPhase.value === 'joined') {
    return {
      type: 'cancel',
      label: '取消报名',
      pendingLabel: '取消中',
      disabled: false,
      buttonClass: 'bg-rose-500/85 text-white',
    };
  }

  return {
    type: '1',
    label: '签到',
    pendingLabel: '签到中',
    disabled: false,
    buttonClass: 'bg-emerald-500/85 text-white',
  };
});

watch(activeMainTab, async () => {
  selectedStatus.value = 'all';
  showFilters.value = false;
  showDateDropdown.value = false;

  if (activeMainTab.value === 'activities') {
    await Promise.all([loadCurrentList(), loadSignTask()]);
    return;
  }

  selectedItemId.value = 'all';
  await Promise.all([loadCurrentList(), loadSummary()]);
});

watch(activeActivityTab, async () => {
  if (activeMainTab.value !== 'activities') return;
  selectedStatus.value = 'all';
  selectedItemId.value = 'all';
  await loadCurrentList();
});

watch(activeHistoryTab, async () => {
  if (activeMainTab.value !== 'history') return;
  selectedStatus.value = 'all';
  await loadCurrentList();
});

watch(
  dateOptions,
  (options) => {
    if (!Array.isArray(options) || options.length === 0) return;
    if (options.some((item) => item.value === selectedQueryDate.value)) return;
    selectedQueryDate.value = options[0].value;
  },
  { immediate: true },
);

watch(selectedQueryDate, async () => {
  if (activeMainTab.value !== 'activities' || activeActivityTab.value !== 'list') return;
  await loadCurrentList();
});

watch(showFilters, async (next) => {
  if (!next || activeMainTab.value !== 'activities') return;
  if (itemOptionsLoaded.value || itemOptionsLoading.value) return;
  await loadItemOptions();
});

onMounted(async () => {
  document.addEventListener('click', handleDocumentClick);
  await Promise.all([loadCurrentList(), loadSignTask()]);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
});

function handleDocumentClick(event) {
  if (!showDateDropdown.value) return;
  const root = datePickerRef.value;
  if (!root || root.contains(event.target)) return;
  showDateDropdown.value = false;
}

function selectQueryDate(value) {
  selectedQueryDate.value = value;
  showDateDropdown.value = false;
}

function isApiSuccess(data) {
  const code = Number(data?.code);
  return code === 10000 || code === 1000;
}

function resolveResponseMessage(data, fallback) {
  const candidates = [data?.response?.message, data?.response, data?.message, data?.msg];
  for (const item of candidates) {
    if (typeof item === 'string' && item.trim()) return item.trim();
  }
  return fallback;
}

function extractList(response) {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== 'object') return [];

  const keys = ['records', 'list', 'rows', 'items', 'activityList'];
  for (const key of keys) {
    if (Array.isArray(response[key])) return response[key];
  }
  return [];
}

function extractPagedList(response) {
  const list = extractList(response);
  if (!response || Array.isArray(response) || typeof response !== 'object') {
    return {
      list,
      total: list.length,
      hasTotal: false,
    };
  }

  const totalCandidate = Number(response.total ?? response.totalCount ?? response.count);
  const hasTotal = Number.isFinite(totalCandidate) && totalCandidate >= 0;
  return {
    list,
    total: hasTotal ? totalCandidate : list.length,
    hasTotal,
  };
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatMonthDay(date) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}-${d}`;
}

function resolveWeekDayNumber(date) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function buildDateOptions() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, offset) => {
    const current = new Date(start);
    current.setDate(start.getDate() + offset);
    const weekDay = resolveWeekDayNumber(current);
    return {
      value: formatDate(current),
      label: `周${WEEKDAY_TEXT[weekDay]}`,
      shortDate: formatMonthDay(current),
    };
  });
}

function resolveActivityId(item) {
  const candidates = [item.clubActivityId, item.activityId, item.configurationId, item.id];
  for (const raw of candidates) {
    const value = Number(raw);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return null;
}

function resolveStatusBucket(item) {
  if (activeMainTab.value === 'history') {
    if (activeHistoryTab.value === 'semester') {
      return String(item.signStatus) === '1' ? 'completed' : 'pending';
    }

    const signStatus = String(item.signStatus);
    if (signStatus === '1') return 'completed';
    if (signStatus === '3') return 'notSignOut';
    return 'unsigned';
  }

  switch (String(item.optionStatus)) {
    case '1':
      return 'joined';
    case '6':
      return 'joinable';
    case '7':
      return 'full';
    case '3':
      return 'blocked';
    default:
      return 'all';
  }
}

function createBadge(text, className) {
  return {
    text,
    className: 'shrink-0 h-6 px-2 rounded-full text-[11px] inline-flex items-center ' + className,
  };
}

function resolveBadge(item) {
  if (activeMainTab.value === 'history' && activeHistoryTab.value === 'semester') {
    return String(item.signStatus) === '1'
      ? createBadge('已完成', 'bg-emerald-500/20 text-emerald-200')
      : createBadge('未完成', 'bg-white/10 text-gray-300');
  }

  if (activeMainTab.value === 'history') {
    const signStatus = String(item.signStatus);
    if (signStatus === '1') return createBadge('已完成', 'bg-emerald-500/20 text-emerald-200');
    if (signStatus === '3') return createBadge('未签退', 'bg-amber-500/20 text-amber-200');
    return createBadge('未签到', 'bg-white/10 text-gray-300');
  }

  switch (String(item.optionStatus)) {
    case '1':
      return createBadge('已报名', 'bg-amber-500/20 text-amber-200');
    case '2':
      return createBadge('进行中', 'bg-blue-500/20 text-blue-200');
    case '6':
      return createBadge('可报名', 'bg-cyan-500/20 text-cyan-200');
    case '7':
      return createBadge('报名已满', 'bg-rose-500/20 text-rose-200');
    case '3':
      return createBadge('无法报名', 'bg-white/10 text-gray-300');
    case '4':
      return createBadge('已完成', 'bg-emerald-500/20 text-emerald-200');
    default:
      return createBadge('待开放', 'bg-white/10 text-gray-300');
  }
}

function resolveClubAction(item) {
  const optionStatus = String(item.optionStatus);

  if (optionStatus === '6') {
    return {
      type: 1,
      label: '报名',
      pendingLabel: '报名中',
      disabled: false,
      buttonClass: 'bg-cyan-500 hover:bg-cyan-400',
    };
  }

  if (optionStatus === '1') {
    return {
      type: 2,
      label: '取消报名',
      pendingLabel: '取消中',
      disabled: false,
      buttonClass: 'bg-rose-500 hover:bg-rose-400',
    };
  }

  if (optionStatus === '2') {
    return {
      type: 2,
      label: '活动进行中',
      pendingLabel: '活动进行中',
      disabled: false,
      buttonClass: 'bg-blue-500 hover:bg-blue-400',
    };
  }

  if (optionStatus === '7') {
    return {
      type: 0,
      label: '已满员',
      pendingLabel: '已满员',
      disabled: true,
      buttonClass: 'bg-white/10 text-gray-300',
    };
  }

  if (optionStatus === '3') {
    return {
      type: 0,
      label: '无法报名',
      pendingLabel: '无法报名',
      disabled: true,
      buttonClass: 'bg-white/10 text-gray-300',
    };
  }

  if (optionStatus === '4') {
    return {
      type: 0,
      label: '已完成',
      pendingLabel: '已完成',
      disabled: true,
      buttonClass: 'bg-white/10 text-gray-300',
    };
  }

  return {
    type: 0,
    label: '暂不可操作',
    pendingLabel: '暂不可操作',
    disabled: true,
    buttonClass: 'bg-white/10 text-gray-300',
  };
}

function resolveCardSubTitle(item, isHistoryRecord) {
  if (isHistoryRecord) return item.teacherName || '';

  const parts = [];
  if (item.teacherName) parts.push(item.teacherName);
  if (item.clubIntroduction) parts.push(item.clubIntroduction);
  return parts.join(' · ');
}

function formatTimeRange(item) {
  const start = item.startTime || '--:--';
  const end = item.endTime || '--:--';
  const hideDatePrefix = activeMainTab.value === 'history' && activeHistoryTab.value === 'record';
  const dateText = !hideDatePrefix && item.yymmdd ? item.yymmdd + ' ' : '';
  return dateText + start + ' - ' + end;
}

function formatCapacity(item) {
  const signed = Number(item.signInStudent ?? item.joinStudentNum);
  const total = Number(item.maxStudent ?? item.studentNum);

  const signedText = Number.isFinite(signed) && signed >= 0 ? signed : '-';
  const totalText = Number.isFinite(total) && total >= 0 ? total : '-';

  return `${signedText}/${totalText} 人`;
}

function formatHistoryWeekDate(item) {
  const weekValue = Number(item.weekDay);
  const weekLabel =
    Number.isFinite(weekValue) && WEEKDAY_TEXT[weekValue] ? '周' + WEEKDAY_TEXT[weekValue] : '周--';
  const dateText = item.yymmdd || '--';
  return dateText + ' ' + weekLabel;
}

function getClubActionPendingKey(activityId, type) {
  return `${activityId}-${type}`;
}

function isClubActionPending(key) {
  return clubActionPendingMap.value[key] === true;
}

function isCardActionPending(card) {
  if (!card || !card.action) return false;
  const type = Number(card.action.type);
  if (type !== 1 && type !== 2) return false;
  return isClubActionPending(getClubActionPendingKey(card.activityId, type));
}

async function handleCardAction(card) {
  if (!card || !card.action) return;

  const type = Number(card.action.type);
  if (type <= 0) return;

  await handleClubAction(card.item, type);
}

function setClubActionPending(key, pending) {
  const next = { ...clubActionPendingMap.value };
  if (pending) {
    next[key] = true;
  } else {
    delete next[key];
  }
  clubActionPendingMap.value = next;
}

function waitForUserLoadingIdle() {
  return new Promise((resolve) => {
    if (!userLoading.value) {
      resolve();
      return;
    }

    const stop = watch(
      () => userLoading.value,
      (next) => {
        if (next) return;
        stop();
        resolve();
      },
      { immediate: true },
    );
  });
}

async function ensureAuthReady() {
  if (userLoading.value) {
    await waitForUserLoadingIdle();
  }

  if (token.value && studentId.value) return true;

  if (!ensureAuthPromise) {
    ensureAuthPromise = fetchUserData({ background: false })
      .then((result) => !!result?.ok)
      .catch(() => false)
      .finally(() => {
        ensureAuthPromise = null;
      });
  }

  const ok = await ensureAuthPromise;
  return ok && !!token.value && !!studentId.value;
}

async function loadHistoryRecords({ append = false } = {}) {
  const targetPage = append ? historyPageNo.value + 1 : 1;
  const response = await api.queryMyClubRecord(studentId.value, targetPage, HISTORY_PAGE_SIZE);
  const data = response?.data;

  if (!isApiSuccess(data)) {
    if (!append) {
      historyRecords.value = [];
      historyPageNo.value = 1;
      historyHasMore.value = false;
    }
    showMessage(data?.msg || data?.message || '加载历史记录失败', 'error');
    return false;
  }

  const paged = extractPagedList(data.response);
  const nextList = append ? [...historyRecords.value, ...paged.list] : paged.list;
  historyRecords.value = nextList;
  historyPageNo.value = targetPage;
  historyHasMore.value = paged.hasTotal
    ? nextList.length < paged.total && paged.list.length > 0
    : paged.list.length >= HISTORY_PAGE_SIZE;
  return true;
}

async function loadMoreHistoryRecords() {
  if (historyLoadingMore.value || !historyHasMore.value || activeMainTab.value !== 'history')
    return;

  historyLoadingMore.value = true;
  try {
    await loadHistoryRecords({ append: true });
  } catch (error) {
    console.error('loadMoreHistoryRecords failed:', error);
    showMessage('加载更多历史记录异常', 'error');
  } finally {
    historyLoadingMore.value = false;
  }
}

async function loadCurrentList() {
  loading.value = true;
  try {
    const authReady = await ensureAuthReady();
    if (!authReady) {
      pendingActivities.value = [];
      myPendingActivities.value = [];
      semesterActivities.value = [];
      historyRecords.value = [];
      historyPageNo.value = 1;
      historyHasMore.value = false;
      return;
    }

    if (activeMainTab.value === 'history') {
      if (activeHistoryTab.value === 'semester') {
        historyPageNo.value = 1;
        historyHasMore.value = false;

        const semesterResponse = await api.queryMyClubTask();
        const semesterData = semesterResponse?.data;
        if (!isApiSuccess(semesterData)) {
          semesterActivities.value = [];
          showMessage(semesterData?.msg || semesterData?.message || '加载学期记录失败', 'error');
          return;
        }
        semesterActivities.value = extractList(semesterData.response);
        return;
      }

      await loadHistoryRecords({ append: false });
      return;
    }

    if (activeActivityTab.value === 'myTask') {
      const response = await api.queryMyPendingClub(studentId.value, 1, 15);
      const data = response?.data;
      if (!isApiSuccess(data)) {
        myPendingActivities.value = [];
        showMessage(data?.msg || data?.message || '加载我的任务失败', 'error');
        return;
      }

      myPendingActivities.value = extractList(data.response);
      return;
    }

    if (!schoolId.value) {
      pendingActivities.value = [];
      return;
    }

    const response = await api.queryClubInfo({
      pageNo: 1,
      pageSize: 15,
      queryTime: currentQueryDate.value,
      schoolId: schoolId.value,
      studentId: studentId.value,
    });

    const data = response?.data;
    if (!isApiSuccess(data)) {
      pendingActivities.value = [];
      showMessage(data?.msg || data?.message || '加载活动列表失败', 'error');
      return;
    }

    pendingActivities.value = extractList(data.response);
  } catch (error) {
    console.error('loadCurrentList failed:', error);
    if (activeMainTab.value === 'history') {
      if (activeHistoryTab.value === 'semester') {
        semesterActivities.value = [];
        historyPageNo.value = 1;
        historyHasMore.value = false;
        showMessage('加载学期记录异常', 'error');
      } else {
        historyRecords.value = [];
        historyPageNo.value = 1;
        historyHasMore.value = false;
        showMessage('加载历史记录异常', 'error');
      }
      return;
    }

    if (activeActivityTab.value === 'myTask') {
      myPendingActivities.value = [];
      showMessage('加载我的任务异常', 'error');
    } else {
      pendingActivities.value = [];
      showMessage('加载活动列表异常', 'error');
    }
  } finally {
    loading.value = false;
  }
}

async function loadSummary() {
  try {
    const authReady = await ensureAuthReady();
    if (!authReady) {
      summary.value = { joinNum: 0, validNum: 0 };
      return;
    }

    const response = await api.countValidSignUp(studentId.value);
    const data = response?.data;
    if (!isApiSuccess(data)) {
      summary.value = { joinNum: 0, validNum: 0 };
      return;
    }

    const list = extractList(data.response);
    const first = list[0] || (typeof data.response === 'object' ? data.response : {}) || {};
    summary.value = {
      joinNum: Number(first.joinNum || 0),
      validNum: Number(first.validNum || 0),
    };
  } catch (error) {
    console.error('loadSummary failed:', error);
    summary.value = { joinNum: 0, validNum: 0 };
  }
}

async function loadItemOptions() {
  if (itemOptionsLoading.value || itemOptionsLoaded.value) return;

  itemOptionsLoading.value = true;
  try {
    const authReady = await ensureAuthReady();
    if (!authReady || !schoolId.value) {
      itemOptions.value = [];
      selectedItemId.value = 'all';
      return;
    }

    const normalResponse = await api.queryMyClubItemList({
      schoolId: schoolId.value,
      studentId: studentId.value,
    });

    let data = normalResponse?.data;
    let list = isApiSuccess(data) ? extractList(data.response) : [];

    if (list.length === 0) {
      const fallbackResponse = await api.queryMyClubItemList({
        schoolId: schoolId.value,
        studentId: studentId.value,
        type: 2,
      });
      data = fallbackResponse?.data;
      list = isApiSuccess(data) ? extractList(data.response) : [];
    }

    itemOptions.value = list
      .map((item) => ({
        itemId: Number(item.itemId),
        itemName: item.itemName || '',
      }))
      .filter((item) => Number.isFinite(item.itemId) && item.itemId > 0);

    if (!itemOptions.value.some((item) => String(item.itemId) === selectedItemId.value)) {
      selectedItemId.value = 'all';
    }

    itemOptionsLoaded.value = true;
  } catch (error) {
    console.error('loadItemOptions failed:', error);
    itemOptions.value = [];
    selectedItemId.value = 'all';
  } finally {
    itemOptionsLoading.value = false;
  }
}

function normalizeSignTask(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const activityId = Number(payload.activityId);
  if (!Number.isFinite(activityId) || activityId <= 0) return null;

  return {
    ...payload,
    activityId,
    latitude: String(payload.latitude || ''),
    longitude: String(payload.longitude || ''),
    signStatus: payload.signStatus ?? null,
    signInStatus: payload.signInStatus ?? null,
    signBackStatus: payload.signBackStatus ?? null,
  };
}

function isSignedStatus(status) {
  return Number(status) === 1;
}

function resolveSignTaskOptionStatus(task) {
  const directOptionStatus = String(task?.optionStatus ?? '').trim();
  if (directOptionStatus) return directOptionStatus;

  const activityId = Number(task?.activityId);
  if (Number.isFinite(activityId) && activityId > 0) {
    const linked = [...pendingActivities.value, ...myPendingActivities.value].find(
      (item) => resolveActivityId(item) === activityId,
    );
    const linkedOptionStatus = String(linked?.optionStatus ?? '').trim();
    if (linkedOptionStatus) return linkedOptionStatus;
  }

  return String(task?.signStatus ?? '').trim();
}

function resolveSignTaskPhase(task) {
  if (!task) return 'unsigned';

  if (isSignedStatus(task.signInStatus) && isSignedStatus(task.signBackStatus)) {
    return 'completed';
  }

  if (isSignedStatus(task.signInStatus)) {
    return 'signedIn';
  }

  return resolveSignTaskOptionStatus(task) === '1' ? 'joined' : 'unsigned';
}

async function loadSignTask() {
  try {
    const authReady = await ensureAuthReady();
    if (!authReady) {
      signTask.value = null;
      return;
    }

    const response = await api.queryClubSignStatus(studentId.value);
    const data = response?.data;

    if (!isApiSuccess(data)) {
      signTask.value = null;
      return;
    }

    signTask.value = normalizeSignTask(data.response);
  } catch (error) {
    signTask.value = null;
    console.error('loadSignTask failed:', error);
  }
}

async function handleSignTaskAction(actionType) {
  const normalizedActionType = String(actionType || '').trim();
  if (!normalizedActionType) return;

  if (normalizedActionType === 'cancel') {
    const task = signTask.value;
    if (!task) return;

    signPendingType.value = normalizedActionType;
    try {
      await handleClubAction(task, 2);
    } finally {
      signPendingType.value = '';
    }
    return;
  }

  await handleSignTask(normalizedActionType);
}

async function handleSignTask(signType) {
  const task = signTask.value;
  const normalizedSignType = String(signType) === '2' ? '2' : String(signType) === '1' ? '1' : '';

  if (!task || !normalizedSignType) {
    showMessage('当前没有可操作的签到/签退任务', 'warning');
    return;
  }

  const authReady = await ensureAuthReady();
  if (!authReady) {
    showMessage('登录状态失效，请重新登录', 'error');
    return;
  }

  if (!task.latitude || !task.longitude) {
    showMessage('签到坐标缺失，暂无法执行操作', 'error');
    return;
  }

  signPendingType.value = normalizedSignType;

  try {
    const response = await api.signInOrSignBack({
      activityId: task.activityId,
      latitude: task.latitude,
      longitude: task.longitude,
      signType: normalizedSignType,
      studentId: studentId.value,
    });

    const data = response?.data;
    const actionText = normalizedSignType === '1' ? '签到' : '签退';
    if (!isApiSuccess(data)) {
      showMessage(data?.msg || data?.message || `${actionText}失败`, 'error');
      return;
    }

    showMessage(resolveResponseMessage(data, `${actionText}成功`), 'success');
    await Promise.all([loadSignTask(), loadCurrentList()]);
  } catch (error) {
    console.error('handleSignTask failed:', error);
    showMessage('签到/签退操作异常', 'error');
  } finally {
    signPendingType.value = '';
  }
}

async function handleClubAction(item, type) {
  const activityId = resolveActivityId(item);
  if (!Number.isFinite(activityId) || activityId <= 0) {
    showMessage('活动标识缺失，无法执行操作', 'error');
    return;
  }

  const authReady = await ensureAuthReady();
  if (!authReady) {
    showMessage('登录状态失效，请重新登录', 'error');
    return;
  }

  const actionType = Number(type) === 2 ? 2 : 1;
  const actionKey = getClubActionPendingKey(activityId, actionType);
  setClubActionPending(actionKey, true);

  try {
    const response =
      actionType === 1
        ? await api.joinClub(activityId, studentId.value)
        : await api.cancelClub(activityId, studentId.value);

    const data = response?.data;
    if (!isApiSuccess(data)) {
      showMessage(data?.msg || data?.message || '娱乐部操作失败', 'error');
      return;
    }

    const fallback = actionType === 1 ? '报名成功' : '取消报名成功';
    showMessage(resolveResponseMessage(data, fallback), 'success');

    const refreshTasks = [loadCurrentList(), loadSignTask()];
    if (activeMainTab.value === 'history') refreshTasks.push(loadSummary());

    await Promise.all(refreshTasks);
  } catch (error) {
    console.error('handleClubAction failed:', error);
    showMessage('娱乐部操作异常', 'error');
  } finally {
    setClubActionPending(actionKey, false);
  }
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 180ms ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.meta-pill {
  height: 28px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.intro-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
