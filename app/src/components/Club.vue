<template>
  <div class="club-page min-h-full pb-4">
    <section
      :class="['mt-3 rounded-2xl theme-card p-3', showDateDropdown ? 'club-toolbar-elevated' : '']"
    >
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="tab in MAIN_TABS"
          :key="tab.key"
          type="button"
          :class="[
            'h-9 rounded-xl border text-xs font-medium transition-colors',
            activeMainTab === tab.key
              ? 'theme-accent-border theme-accent-bg theme-accent'
              : 'theme-card-soft theme-text-secondary',
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
              ? 'theme-accent-border theme-accent-bg theme-accent'
              : 'theme-card-soft theme-text-secondary',
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
              ? 'theme-accent-border theme-accent-bg theme-accent'
              : 'theme-card-soft theme-text-secondary',
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
            class="w-full h-9 px-3 rounded-xl theme-card-soft text-xs theme-text-primary inline-flex items-center justify-between"
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
              class="absolute left-0 right-0 z-50 rounded-xl theme-card-strong max-h-80 overflow-y-auto"
            >
              <button
                v-for="day in dateOptions"
                :key="day.value"
                type="button"
                :class="[
                  'w-full h-9 px-3 text-left text-xs border-b theme-card-divider last:border-b-0 transition-colors',
                  selectedQueryDate === day.value
                    ? 'theme-accent theme-accent-bg'
                    : 'theme-text-primary club-dropdown-option-idle',
                ]"
                @click="selectQueryDate(day.value)"
              >
                {{ day.label }} {{ day.value }}
              </button>
            </div>
          </transition>
        </div>

        <button
          type="button"
          class="h-9 px-3 rounded-xl theme-card-soft theme-text-primary text-xs font-medium flex items-center gap-1.5"
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
                  ? 'theme-accent-border theme-accent-bg theme-accent'
                  : 'theme-card-soft theme-text-secondary',
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
                  ? 'theme-accent-border theme-accent-bg theme-accent'
                  : 'theme-card-soft theme-text-secondary',
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
      <div class="rounded-xl theme-card-soft p-3">
        <div class="text-[11px] theme-text-secondary">累计报名</div>
        <div class="mt-1 text-xl font-semibold theme-text-primary">{{ summary.joinNum }}</div>
      </div>
      <div class="rounded-xl theme-card-soft p-3">
        <div class="text-[11px] theme-text-secondary">有效签到</div>
        <div class="mt-1 text-xl font-semibold theme-success">{{ summary.validNum }}</div>
      </div>
    </section>

    <section v-if="activeMainTab === 'activities'" class="mt-3">
      <article v-if="signTaskCard" class="rounded-2xl theme-accent-border theme-accent-bg p-3">
        <div class="flex items-start gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <h3 class="text-sm font-semibold theme-accent truncate">
                  {{ signTaskCard.title }}
                  <span v-if="signTaskCard.location" class="font-normal theme-accent opacity-70"
                    >· {{ signTaskCard.location }}</span
                  >
                </h3>
                <p class="mt-1 text-xs theme-accent opacity-80 truncate">
                  {{ signTaskCard.subTitle }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'h-6 px-2 rounded-full text-[11px] inline-flex items-center border',
                    clubAutoConfigEnabled
                      ? 'theme-success-bg theme-success-border theme-success'
                      : 'badge-neutral',
                  ]"
                >
                  {{ clubAutoConfigEnabled ? '已启用定时任务' : '未启用定时任务' }}
                </span>
                <span :class="signTaskCard.badgeClass">{{ signTaskCard.badgeText }}</span>
              </div>
            </div>

            <div class="mt-3 grid grid-cols-2 gap-2 text-xs theme-accent opacity-90">
              <div
                v-for="meta in signTaskCard.metaList"
                :key="meta.key"
                :class="['meta-pill', meta.spanClass]"
              >
                <i :class="meta.icon"></i>
                <span class="truncate">{{ meta.label }}</span>
              </div>
            </div>

            <div
              v-if="signTaskButtons.length > 0"
              class="mt-3 flex items-center justify-between gap-2"
            >
              <button
                type="button"
                :disabled="clubAutoConfigToggling"
                :class="[
                  'h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors',
                  clubAutoConfigEnabled
                    ? 'theme-danger-bg theme-danger-border theme-danger hover:theme-danger-bg'
                    : 'theme-success-bg theme-success-border theme-success hover:theme-success-bg',
                  clubAutoConfigToggling && 'opacity-70 cursor-not-allowed',
                ]"
                @click="toggleClubAutoConfig"
              >
                <i
                  :class="[
                    clubAutoConfigToggling
                      ? 'ri-loader-4-line animate-spin'
                      : clubAutoConfigEnabled
                        ? 'ri-indeterminate-circle-line'
                        : 'ri-checkbox-circle-line',
                  ]"
                ></i>
                <span>{{
                  clubAutoConfigToggling
                    ? clubAutoConfigEnabled
                      ? '停用中...'
                      : '启用中...'
                    : clubAutoConfigEnabled
                      ? '停用定时任务'
                      : '启用定时任务'
                }}</span>
              </button>

              <div class="flex flex-wrap justify-end gap-2">
                <button
                  v-for="action in signTaskButtons"
                  :key="action.key"
                  type="button"
                  :disabled="isSignTaskActionDisabled(action)"
                  :class="[
                    'h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors',
                    action.buttonClass,
                    isSignTaskActionDisabled(action) && 'opacity-70 cursor-not-allowed',
                  ]"
                  @click="handleSignTaskAction(action.type)"
                >
                  <i
                    v-if="isSignTaskActionPending(action)"
                    class="ri-loader-4-line animate-spin"
                  ></i>
                  <span>{{
                    isSignTaskActionPending(action) ? action.pendingLabel : action.label
                  }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <div
        v-else
        class="rounded-2xl theme-accent-border theme-accent-bg p-4 text-xs theme-accent opacity-80"
      >
        当前没有可执行签到/签退任务
      </div>
    </section>

    <section
      v-if="activeMainTab === 'activities' && clubRushTasks.length > 0"
      class="mt-3 rounded-2xl theme-warning-border theme-warning-bg p-3"
    >
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-xs font-semibold theme-warning">已安排抢选任务</h3>
        <span class="text-[11px] theme-warning opacity-70">{{ clubRushTasks.length }} 条</span>
      </div>

      <div class="mt-2 space-y-2">
        <div
          v-for="task in clubRushTasks"
          :key="`rush-${task.id}`"
          class="rounded-xl theme-warning-border theme-card-soft px-3 py-2"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs theme-warning">活动ID {{ task.activityId }}</span>
            <div class="flex items-center gap-2">
              <button
                v-if="task.canCancel"
                type="button"
                :disabled="isClubActionPending(task.cancelPendingKey)"
                class="h-6 px-2 rounded-md text-[11px] inline-flex items-center gap-1 theme-danger-bg theme-danger text-white hover:theme-danger-bg disabled:opacity-70 disabled:cursor-not-allowed"
                @click="cancelRushTask(task)"
              >
                <i
                  v-if="isClubActionPending(task.cancelPendingKey)"
                  class="ri-loader-4-line animate-spin"
                ></i>
                <span>{{ isClubActionPending(task.cancelPendingKey) ? '取消中' : '取消' }}</span>
              </button>
              <span :class="task.statusClass">{{ task.statusText }}</span>
            </div>
          </div>
          <div class="mt-1 text-[11px] theme-warning opacity-80">
            执行时间：{{ task.executeAt }}
          </div>
          <div v-if="task.lastResult" class="mt-1 text-[11px] theme-warning opacity-70">
            结果：{{ task.lastResult }}
          </div>
        </div>
      </div>
    </section>

    <section class="mt-3 flex items-center justify-between text-xs theme-text-secondary">
      <span>{{ currentListTitle }}</span>
      <span>共 {{ filteredList.length }} 条</span>
    </section>

    <section class="mt-2 space-y-3">
      <template v-if="loading">
        <div
          v-for="idx in 4"
          :key="`skeleton-${idx}`"
          class="rounded-2xl theme-card-soft p-3 animate-pulse"
        >
          <div class="h-4 w-2/3 club-skeleton-line rounded"></div>
          <div class="mt-3 h-3 w-full club-skeleton-line rounded"></div>
          <div class="mt-2 h-3 w-4/5 club-skeleton-line rounded"></div>
        </div>
      </template>

      <div
        v-else-if="cards.length === 0"
        class="rounded-2xl theme-card p-6 text-center text-sm theme-text-secondary"
      >
        {{ emptyMessage }}
      </div>

      <article v-for="card in cards" :key="card.key" class="rounded-2xl theme-card p-3">
        <template v-if="card.isHistoryRecord">
          <div class="flex items-start justify-between gap-3">
            <h3 class="min-w-0 flex-1 text-sm font-semibold theme-text-primary truncate">
              {{ card.title }}
            </h3>
            <span :class="card.badgeClass">{{ card.badgeText }}</span>
          </div>
          <div class="mt-1 flex items-center justify-between gap-2">
            <span class="min-w-0 flex-1 text-xs theme-text-secondary truncate">{{
              card.subTitle || '--'
            }}</span>
            <span class="shrink-0 text-xs theme-text-tertiary">{{ card.historyDateTimeText }}</span>
          </div>
        </template>

        <template v-else>
          <div class="flex items-start justify-between gap-3">
            <h3 class="min-w-0 flex-1 text-sm font-semibold theme-text-primary truncate">
              {{ card.title }}
            </h3>
            <span :class="card.badgeClass">{{ card.badgeText }}</span>
          </div>

          <div class="mt-1 flex items-center justify-between gap-2">
            <span class="min-w-0 flex-1 text-xs theme-text-secondary truncate">
              {{ card.subTitle }}{{ card.metaTertiaryText ? ` · ${card.metaTertiaryText}` : '' }}
            </span>
            <span class="shrink-0 text-xs theme-text-tertiary text-right">{{
              card.metaSecondaryText
            }}</span>
          </div>

          <div class="mt-3 flex items-center justify-between gap-2 text-xs theme-text-tertiary">
            <div class="meta-pill">
              <i class="ri-time-line"></i>
              <span class="truncate">{{ card.timeText }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="card.rushAction"
                type="button"
                :disabled="card.rushAction.disabled || isRushActionPending(card)"
                :class="[
                  'h-8 px-3 rounded-lg text-xs font-medium text-white transition-colors inline-flex items-center gap-1.5',
                  card.rushAction.buttonClass,
                  (card.rushAction.disabled || isRushActionPending(card)) &&
                    'opacity-70 cursor-not-allowed',
                ]"
                @click="handleRushCardAction(card)"
              >
                <i v-if="isRushActionPending(card)" class="ri-loader-4-line animate-spin"></i>
                <span>{{
                  isRushActionPending(card) ? card.rushAction.pendingLabel : card.rushAction.label
                }}</span>
              </button>

              <button
                v-if="card.action"
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
          </div>

          <p v-if="card.showIntro" class="mt-3 text-xs theme-text-secondary leading-5 intro-text">
            {{ card.introText }}
          </p>
        </template>
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
          class="w-full h-9 rounded-xl theme-card-soft text-xs theme-text-primary inline-flex items-center justify-center gap-1.5"
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
import { api, appConfig } from '@/sdk/app';
import { AutorunClient, scheduledTaskConfig } from '@/sdk/autorun';
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
const autorunApiBase = (scheduledTaskConfig.apiBaseUrl || '').replace(/\/$/, '');
const autorunClient = autorunApiBase ? new AutorunClient({ baseURL: autorunApiBase }) : null;

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
const clubAutoConfigEnabled = ref(false);
const clubAutoConfigToggling = ref(false);
const clubAutoSignInStatus = ref('');
const clubAutoSignOutStatus = ref('');
const clubAutoSignInLeadMinutes = ref(10);
const clubAutoSignOutDelayMinutes = ref(10);
const clubAutoSignInWindowAt = ref('');
const clubAutoSignOutWindowAt = ref('');
const clubAutoLastAction = ref('');
const clubAutoLastSuccessAt = ref('');
const clubRushTasks = ref([]);

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
  if (selected) return `${selected.label} ${selected.value}`;
  const now = new Date();
  return `周${WEEKDAY_TEXT[resolveWeekDayNumber(now)]} ${formatDate(now)}`;
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
      isHistoryRecord,
      activityId,
      action:
        activeMainTab.value === 'activities' && Number.isFinite(activityId) && activityId > 0
          ? resolveClubAction(item)
          : null,
      rushAction:
        activeMainTab.value === 'activities' && Number.isFinite(activityId) && activityId > 0
          ? resolveRushAction(item)
          : null,
      title: item.activityName || '活动 #' + (activityId || index + 1),
      subTitle: item.teacherName ? item.teacherName : '',
      badgeText: badge.text,
      badgeClass: badge.className,
      timeText: formatTimeRange(item),
      metaSecondaryIcon: isHistoryRecord ? 'ri-calendar-line' : 'ri-team-line',
      metaSecondaryText: isHistoryRecord ? formatHistoryWeekDate(item) : formatCapacity(item),
      metaTertiaryIcon: isHistoryRecord ? '' : 'ri-map-pin-line',
      metaTertiaryText: isHistoryRecord ? '' : item.addressDetail || item.address || '地点待定',
      historyDateTimeText: isHistoryRecord
        ? `${item.yymmdd || '--'} ${(item.startTime || '--:--') + ' - ' + (item.endTime || '--:--')}`
        : '',
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
      return createBadge('已报名', 'theme-warning-bg theme-warning-border theme-warning');
    case 'signedIn':
      return createBadge('已签到', 'theme-success-bg theme-success-border theme-success');
    case 'completed':
      return createBadge('已完成', 'theme-accent-bg theme-accent-border theme-accent');
    default:
      return createBadge('未签到', 'badge-neutral');
  }
});

const signTaskCard = computed(() => {
  const task = signTask.value;
  if (!task) return null;

  const source = mergeActivityData(task, findLinkedActivityById(task.activityId));
  const metaList = [
    {
      key: 'sign-in',
      icon: 'ri-login-circle-line',
      label: `签到时间：${source.signInTime || '--'}`,
    },
    {
      key: 'sign-out',
      icon: 'ri-logout-circle-r-line',
      label: `签退时间：${source.signBackTime || source.signBackLimitTime || '--'}`,
    },
  ];

  if (clubAutoConfigEnabled.value) {
    if (clubAutoSignInStatus.value === '未签到' && clubAutoSignInWindowAt.value) {
      metaList.push({
        key: 'auto-in-window',
        icon: 'ri-time-line',
        label: `预计签到：${clubAutoSignInWindowAt.value}`,
      });
    }
    if (clubAutoSignOutStatus.value === '未签退' && clubAutoSignOutWindowAt.value) {
      metaList.push({
        key: 'auto-out-window',
        icon: 'ri-time-line',
        label: `预计签退：${clubAutoSignOutWindowAt.value}`,
      });
    }
    metaList.push({
      key: 'auto-status',
      icon: 'ri-checkbox-circle-line',
      label: `签到状态：${clubAutoSignInStatus.value} · 签退状态：${clubAutoSignOutStatus.value}`,
    });
    const lastActionText =
      clubAutoLastAction.value === 'sign_in'
        ? '签到'
        : clubAutoLastAction.value === 'sign_out'
          ? '签退'
          : '无';
    const lastSuccessText = clubAutoLastSuccessAt.value ? `（${clubAutoLastSuccessAt.value}）` : '';
    metaList.push({
      key: 'auto-exec',
      icon: 'ri-history-line',
      label: `执行状态：已执行${lastActionText}${lastSuccessText}`,
    });
  }

  return {
    title: source.activityName || '未命名活动',
    subTitle: formatTimeRange(source),
    badgeText: signTaskPanelStatus.value.text,
    badgeClass: signTaskPanelStatus.value.className,
    location: source.addressDetail || source.address || '',
    autoEnabled: clubAutoConfigEnabled.value,
    metaList,
  };
});

const signTaskPrimaryAction = computed(() => {
  const task = signTask.value;
  if (!task) return null;

  if (signTaskPhase.value === 'completed') {
    return {
      key: 'completed',
      type: '',
      label: '已完成',
      pendingLabel: '已完成',
      disabled: true,
      buttonClass: 'badge-neutral',
    };
  }

  if (signTaskPhase.value === 'signedIn') {
    return {
      key: 'sign-out',
      type: '2',
      label: '签退',
      pendingLabel: '签退中',
      disabled: false,
      buttonClass: 'theme-warning-bg theme-warning text-white hover:theme-warning-bg',
    };
  }

  return {
    key: 'sign-in',
    type: '1',
    label: '签到',
    pendingLabel: '签到中',
    disabled: false,
    buttonClass: 'theme-success-bg theme-success text-white hover:theme-success-bg',
  };
});

const signTaskCancelAction = computed(() => {
  const task = signTask.value;
  if (!task || signTaskPhase.value !== 'joined') return null;

  return {
    key: 'cancel',
    type: 'cancel',
    label: '取消报名',
    pendingLabel: '取消中',
    disabled: false,
    buttonClass: 'theme-danger-bg theme-danger text-white hover:theme-danger-bg',
  };
});

const signTaskButtons = computed(() =>
  [signTaskCancelAction.value, signTaskPrimaryAction.value].filter(Boolean),
);

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
  await Promise.all([
    loadCurrentList(),
    loadSignTask(),
    loadClubRushStatus(),
    loadClubAutoConfigStatus(),
  ]);
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

  const end = new Date(start.getFullYear(), 11, 31);
  const result = [];

  const current = new Date(start);
  while (current <= end) {
    const weekDay = resolveWeekDayNumber(current);
    result.push({
      value: formatDate(current),
      label: `周${WEEKDAY_TEXT[weekDay]}`,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
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

  switch (resolveEffectiveOptionStatus(item)) {
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
      ? createBadge('已完成', 'theme-success-bg theme-success-border theme-success')
      : createBadge('未完成', 'badge-neutral');
  }

  if (activeMainTab.value === 'history') {
    const signStatus = String(item.signStatus);
    if (signStatus === '1')
      return createBadge('已完成', 'theme-success-bg theme-success-border theme-success');
    if (signStatus === '3')
      return createBadge('未签退', 'theme-warning-bg theme-warning-border theme-warning');
    return createBadge('未签到', 'badge-neutral');
  }

  if (activeMainTab.value === 'activities' && activeActivityTab.value === 'myTask') {
    switch (String(item.activityStatus)) {
      case '1':
        return createBadge('可报名', 'theme-accent-bg theme-accent-border theme-accent');
      case '2':
        return createBadge('进行中', 'bg-blue-500/20 text-blue-200');
      case '3':
        return createBadge('已结束', 'badge-neutral');
      default:
        return createBadge('待开放', 'badge-neutral');
    }
  }

  switch (resolveEffectiveOptionStatus(item)) {
    case '1':
      return createBadge('已报名', 'theme-warning-bg theme-warning-border theme-warning');
    case '2':
      return createBadge('进行中', 'bg-blue-500/20 text-blue-200');
    case '6':
      return createBadge('可报名', 'theme-accent-bg theme-accent-border theme-accent');
    case '7':
      return createBadge('人数已满', 'theme-danger-bg theme-danger-border theme-danger');
    case '3':
      return createBadge('已报名其他活动', 'badge-neutral');
    case '4':
      return createBadge('已完成', 'theme-success-bg theme-success-border theme-success');
    default:
      return createBadge('待开放', 'badge-neutral');
  }
}

function resolveClubAction(item) {
  const optionStatus = resolveEffectiveOptionStatus(item);

  if (optionStatus === '6') {
    return {
      type: 1,
      label: '报名',
      pendingLabel: '报名中',
      disabled: false,
      buttonClass: 'theme-accent-bg theme-accent',
    };
  }

  if (optionStatus === '1') {
    return {
      type: 2,
      label: '取消报名',
      pendingLabel: '取消中',
      disabled: false,
      buttonClass: 'theme-danger-bg theme-danger text-white hover:theme-danger-bg',
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
      buttonClass: 'theme-danger-bg theme-danger-border theme-danger',
    };
  }

  if (optionStatus === '3') {
    return {
      type: 0,
      label: '无法报名',
      pendingLabel: '无法报名',
      disabled: true,
      buttonClass: 'badge-neutral',
    };
  }

  if (optionStatus === '4') {
    return {
      type: 0,
      label: '已完成',
      pendingLabel: '已完成',
      disabled: true,
      buttonClass: 'badge-neutral',
    };
  }

  return {
    type: 0,
    label: '暂不可操作',
    pendingLabel: '暂不可操作',
    disabled: true,
    buttonClass: 'badge-neutral',
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
  const totalRaw = pickDisplayValue(item.maxStudent, item.studentNum);
  const total = Number(totalRaw);

  const signedText = Number.isFinite(signed) && signed >= 0 ? signed : '-';
  if (isUnlimitedSignup(item)) return `${signedText}/不限`;

  const totalText = totalRaw !== '' && Number.isFinite(total) && total >= 0 ? total : '-';

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

function getClubRushPendingKey(activityId) {
  return getClubActionPendingKey(activityId, 'rush');
}

function isRushActionPending(card) {
  if (!card || !card.rushAction) return false;
  return isClubActionPending(getClubRushPendingKey(card.activityId));
}

function isSignTaskActionPending(action) {
  if (!action) return false;
  return signPendingType.value !== '' && signPendingType.value === String(action.type || '');
}

function isSignTaskActionDisabled(action) {
  if (!action) return true;
  if (action.disabled) return true;
  return signPendingType.value !== '';
}

async function handleCardAction(card) {
  if (!card || !card.action) return;

  const type = Number(card.action.type);
  if (type <= 0) return;

  await handleClubAction(card.item, type);
}

async function handleRushCardAction(card) {
  if (!card || !card.rushAction) return;

  const activityId = Number(card.activityId);
  if (!Number.isFinite(activityId) || activityId <= 0) return;

  if (!autorunClient) {
    showMessage('未配置抢报服务地址', 'error');
    return;
  }

  const authReady = await ensureAuthReady();
  if (!authReady || !token.value) {
    showMessage('登录状态失效，请重新登录', 'error');
    return;
  }

  const pendingKey = getClubRushPendingKey(activityId);
  setClubActionPending(pendingKey, true);
  try {
    const activityDateText = normalizeDateOnlyText(card.item?.yymmdd || currentQueryDate.value);
    const envelope = await autorunClient.rushClub(token.value, {
      activity_id: activityId,
      activity_date: activityDateText || undefined,
      yymmdd: activityDateText || undefined,
    });
    const rushResult = envelope?.data?.result || {};
    const message = String(rushResult.message || '').trim() || '抢报请求已提交';
    showMessage(message, rushResult.performed || rushResult.scheduled ? 'success' : 'error');
    await Promise.all([loadCurrentList(), loadSignTask(), loadClubRushStatus()]);
  } catch (error) {
    console.error('handleRushCardAction failed:', error);
    showMessage(error?.message || '抢报操作异常', 'error');
  } finally {
    setClubActionPending(pendingKey, false);
  }
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

function pickDisplayValue(...values) {
  for (const value of values) {
    if (value === 0 || value === '0' || value === false) return value;
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    return value;
  }
  return '';
}

function mergeActivityData(primary, secondary) {
  if (!primary && !secondary) return null;

  const merged = { ...(secondary || {}), ...(primary || {}) };
  const preferredKeys = [
    'activityId',
    'clubActivityId',
    'configurationId',
    'activityName',
    'activityItemId',
    'itemName',
    'teacherName',
    'clubIntroduction',
    'address',
    'addressDetail',
    'yymmdd',
    'startTime',
    'endTime',
    'signInTime',
    'signBackTime',
    'signBackLimitTime',
    'joinStudentNum',
    'signInStudent',
    'maxStudent',
    'studentNum',
    'optionStatus',
    'signStatus',
    'signInStatus',
    'signBackStatus',
    'latitude',
    'longitude',
    'logoUrl',
    'logo',
    'itemLogo',
    'itemImg',
    'itemImage',
    'itemPic',
    'activityLogo',
    'activityImg',
    'activityImage',
    'activityPic',
    'cover',
    'coverUrl',
    'image',
    'imageUrl',
    'photo',
    'photoUrl',
  ];

  preferredKeys.forEach((key) => {
    merged[key] = pickDisplayValue(primary?.[key], secondary?.[key]);
  });

  return merged;
}

function findLinkedActivityById(activityId) {
  const normalizedId = Number(activityId);
  if (!Number.isFinite(normalizedId) || normalizedId <= 0) return null;

  return [...pendingActivities.value, ...myPendingActivities.value].find(
    (item) => resolveActivityId(item) === normalizedId,
  );
}

function isUnlimitedSignup(item) {
  const totalRaw = pickDisplayValue(item?.maxStudent, item?.studentNum);
  if (totalRaw === '') return false;
  const total = Number(totalRaw);
  return Number.isFinite(total) && total <= 0;
}

function resolveEffectiveOptionStatus(item) {
  const optionStatus = String(item?.optionStatus ?? '').trim();
  if (optionStatus === '7' && isUnlimitedSignup(item)) return '6';
  return optionStatus;
}

function resolveSignTaskSubTitle(item) {
  return item?.addressDetail || item?.address || item?.teacherName || '地点待定';
}

function normalizeMediaUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  if (/^(data:|blob:)/i.test(raw)) return raw;
  if (/^(https?:)?\/\//i.test(raw)) return raw;
  if (!raw.startsWith('/') && !raw.includes('/') && !raw.includes('.')) return '';

  const base = String(appConfig.api.baseUrl || '').replace(/\/$/, '');
  if (!base) return raw;
  if (raw.startsWith('/')) return `${base}${raw}`;
  return `${base}/${raw.replace(/^\/+/, '')}`;
}

function resolveSignTaskOptionStatus(task) {
  const directOptionStatus = String(task?.optionStatus ?? '').trim();
  if (directOptionStatus) return directOptionStatus;

  const activityId = Number(task?.activityId);
  if (Number.isFinite(activityId) && activityId > 0) {
    const linked = findLinkedActivityById(activityId);
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
    refreshTasks.push(loadClubRushStatus());
    if (activeMainTab.value === 'history') refreshTasks.push(loadSummary());

    await Promise.all(refreshTasks);
  } catch (error) {
    console.error('handleClubAction failed:', error);
    showMessage('娱乐部操作异常', 'error');
  } finally {
    setClubActionPending(actionKey, false);
  }
}

function resolveRushAction(item) {
  if (resolveEffectiveOptionStatus(item) !== '6') return null;
  if (!isFutureActivityItem(item)) return null;
  return {
    type: 'rush',
    label: '抢报',
    pendingLabel: '抢报中',
    disabled: false,
    buttonClass: 'theme-warning-bg theme-warning text-white hover:theme-warning-bg',
  };
}

function isFutureActivityItem(item) {
  const fallbackDate =
    activeMainTab.value === 'activities' && activeActivityTab.value === 'list'
      ? currentQueryDate.value
      : '';
  const dateText = normalizeDateOnlyText(
    item?.yymmdd || item?.activityDate || item?.dateText || fallbackDate,
  );
  if (!dateText) return false;

  const todayText = formatDate(new Date());
  return dateText > todayText;
}

function normalizeDateOnlyText(raw) {
  const text = String(raw || '')
    .trim()
    .replace(/\//g, '-');
  if (!text) return '';

  const datePart = text.split(' ')[0].split('T')[0];
  const match = datePart.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return '';

  const year = match[1];
  const month = match[2].padStart(2, '0');
  const day = match[3].padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function loadClubRushStatus() {
  if (!autorunClient || !token.value || activeMainTab.value !== 'activities') {
    clubRushTasks.value = [];
    return;
  }

  try {
    const envelope = await autorunClient.getClubRushStatus(token.value);
    const tasks = Array.isArray(envelope?.data?.tasks) ? envelope.data.tasks : [];
    clubRushTasks.value = tasks
      .map((item) => {
        const status = String(item?.status || '').trim();
        return {
          id: Number(item?.id || 0),
          activityId: Number(item?.activity_id || 0),
          executeAt: String(item?.execute_at || '--'),
          statusText: resolveRushTaskStatusText(status),
          statusClass: resolveRushTaskStatusClass(status),
          lastResult: String(item?.last_result || '').trim(),
          canCancel: status === 'pending',
          cancelPendingKey: getClubActionPendingKey(`rush-cancel-${item?.id || 0}`, 'cancel'),
        };
      })
      .filter((item) => item.id > 0 && item.activityId > 0);
  } catch (error) {
    console.error('loadClubRushStatus failed:', error);
    clubRushTasks.value = [];
  }
}

function resolveRushTaskStatusText(status) {
  switch (status) {
    case 'pending':
      return '待执行';
    case 'done':
      return '已完成';
    case 'failed':
      return '已失败';
    case 'cancelled':
      return '已取消';
    default:
      return status || '未知';
  }
}

function resolveRushTaskStatusClass(status) {
  switch (status) {
    case 'pending':
      return 'text-[11px] px-2 h-5 inline-flex items-center rounded-full theme-accent-bg theme-accent';
    case 'done':
      return 'text-[11px] px-2 h-5 inline-flex items-center rounded-full theme-success-bg theme-success';
    case 'failed':
      return 'text-[11px] px-2 h-5 inline-flex items-center rounded-full theme-danger-bg theme-danger';
    case 'cancelled':
      return 'text-[11px] px-2 h-5 inline-flex items-center rounded-full badge-neutral';
    default:
      return 'text-[11px] px-2 h-5 inline-flex items-center rounded-full badge-neutral';
  }
}

async function cancelRushTask(task) {
  if (!task || !task.canCancel) return;
  if (!autorunClient || !token.value) {
    showMessage('未配置抢报服务地址', 'error');
    return;
  }

  const pendingKey = task.cancelPendingKey;
  setClubActionPending(pendingKey, true);
  try {
    const envelope = await autorunClient.cancelClubRush(token.value, {
      activity_id: task.activityId,
    });
    const message = String(envelope?.data?.result?.message || '已取消待执行抢报任务').trim();
    showMessage(message, 'success');
    await loadClubRushStatus();
  } catch (error) {
    console.error('cancelRushTask failed:', error);
    showMessage(error?.message || '取消抢报失败', 'error');
  } finally {
    setClubActionPending(pendingKey, false);
  }
}

async function loadClubAutoConfigStatus() {
  if (!autorunClient || !token.value) {
    clubAutoConfigEnabled.value = false;
    clubAutoSignInStatus.value = '';
    clubAutoSignOutStatus.value = '';
    clubAutoSignInWindowAt.value = '';
    clubAutoSignOutWindowAt.value = '';
    clubAutoLastAction.value = '';
    clubAutoLastSuccessAt.value = '';
    return;
  }

  try {
    const envelope = await autorunClient.getClubAutoStatus(token.value);
    const data = envelope?.data || {};
    const isEnabled = Number(data.enabled) === 1 || data.enabled === true;
    clubAutoConfigEnabled.value = isEnabled;
    clubAutoSignInStatus.value = data.sign_in_status === 1 ? '已签到' : '未签到';
    clubAutoSignOutStatus.value = data.sign_back_status === 1 ? '已签退' : '未签退';
    clubAutoSignInWindowAt.value = String(data.sign_in_window_at || '');
    clubAutoSignOutWindowAt.value = String(data.sign_out_window_at || '');
    clubAutoLastAction.value = String(data.last_action || '');
    clubAutoLastSuccessAt.value = String(data.last_success_at || '');
  } catch (error) {
    console.error('loadClubAutoConfigStatus failed:', error);
    clubAutoConfigEnabled.value = false;
    clubAutoSignInStatus.value = '';
    clubAutoSignOutStatus.value = '';
    clubAutoSignInWindowAt.value = '';
    clubAutoSignOutWindowAt.value = '';
    clubAutoLastAction.value = '';
    clubAutoLastSuccessAt.value = '';
  }
}

async function toggleClubAutoConfig() {
  if (!autorunClient || clubAutoConfigToggling.value || !token.value) return;

  clubAutoConfigToggling.value = true;
  try {
    const nextEnabled = !clubAutoConfigEnabled.value;
    await autorunClient.setClubAutoConfig(token.value, { enabled: nextEnabled ? 1 : 0 });
    await loadClubAutoConfigStatus();
    showMessage(nextEnabled ? '定时任务已开启' : '定时任务已关闭', 'success');
  } catch (error) {
    console.error('toggleClubAutoConfig failed:', error);
    showMessage(error?.message || '操作失败', 'error');
  } finally {
    clubAutoConfigToggling.value = false;
  }
}

function handleClubAutoConfigSaved() {
  loadClubAutoConfigStatus();
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all var(--theme-transition-fast) var(--theme-transition-easing);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.meta-pill {
  height: 28px;
  border-radius: 10px;
  background: var(--card-soft-bg);
  border: 1px solid var(--card-border);
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.meta-pill.theme-success-bg {
  background: var(--success-bg);
  border-color: var(--success-border);
  color: var(--success-color);
}

.meta-pill.theme-warning-bg {
  background: var(--warning-bg);
  border-color: var(--warning-border);
  color: var(--warning-color);
}

.meta-pill.theme-danger-bg {
  background: var(--danger-bg);
  border-color: var(--danger-border);
  color: var(--danger-color);
}

.intro-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.club-dropdown-option-idle:hover {
  background-color: var(--action-hover-bg);
}

.badge-neutral {
  background-color: var(--card-soft-bg);
  color: var(--text-secondary);
  border: 1px solid var(--card-border);
}

.club-skeleton-line {
  background-color: var(--card-soft-bg);
}

.club-toolbar-elevated {
  position: relative;
  z-index: 40;
}
</style>
