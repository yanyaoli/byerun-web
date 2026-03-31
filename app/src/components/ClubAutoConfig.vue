<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[998] flex items-center justify-center p-4 bg-black/85"
    @click.self="close"
  >
    <div
      class="relative w-full max-w-[340px] rounded-3xl border border-white/8 bg-stone-950 p-5 shadow-2xl"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-white">俱乐部定时任务</h3>
          <p class="mt-1 text-xs text-gray-400 truncate">{{ task.activityName || '暂无活动' }}</p>
        </div>
        <span
          class="h-7 px-3 rounded-full border text-xs inline-flex items-center"
          :class="
            enabled
              ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200'
              : 'border-amber-400/50 bg-amber-500/15 text-amber-200'
          "
        >
          {{ enabled ? '已启用' : '未启用' }}
        </span>
      </div>

      <div v-if="loading" class="mt-4 space-y-3">
        <div class="h-4 w-1/2 rounded-xl bg-white/15 animate-pulse"></div>

        <div class="grid grid-cols-2 gap-2">
          <div class="h-7 rounded-xl bg-white/10 animate-pulse"></div>
          <div class="h-7 rounded-xl bg-white/10 animate-pulse"></div>
          <div class="h-7 rounded-xl bg-white/10 animate-pulse"></div>
          <div class="h-7 rounded-xl bg-white/10 animate-pulse"></div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="h-7 rounded-xl bg-white/10 animate-pulse"></div>
          <div class="h-7 rounded-xl bg-white/10 animate-pulse"></div>
          <div class="h-7 col-span-2 rounded-xl bg-white/10 animate-pulse"></div>
          <div class="h-7 col-span-2 rounded-xl bg-white/10 animate-pulse"></div>
        </div>
      </div>

      <div v-else class="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-300">
        <div class="meta-pill col-span-2">
          <i class="ri-time-line"></i>
          <span class="truncate">活动时间：{{ taskTimeText }}</span>
        </div>
        <div class="meta-pill">
          <i class="ri-login-circle-line"></i>
          <span class="truncate">签到：{{ signInStateText }}</span>
        </div>
        <div class="meta-pill">
          <i class="ri-logout-circle-r-line"></i>
          <span class="truncate">签退：{{ signOutStateText }}</span>
        </div>
        <div class="meta-pill col-span-2">
          <i class="ri-login-circle-line"></i>
          <span class="truncate">签到时间：{{ formatDisplayDateTime(task.signInTimeText) }}</span>
        </div>
        <div class="meta-pill col-span-2">
          <i class="ri-logout-circle-r-line"></i>
          <span class="truncate"
            >签退时间：{{ formatDisplayDateTime(task.signBackLimitTimeText) }}</span
          >
        </div>
        <div class="meta-pill col-span-2">
          <i class="ri-checkbox-circle-line"></i>
          <span class="truncate">任务执行：{{ executedSignInText }}</span>
        </div>
        <div class="meta-pill col-span-2">
          <i class="ri-checkbox-circle-line"></i>
          <span class="truncate">任务执行：{{ executedSignOutText }}</span>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          :class="[
            'h-8 px-3 rounded-lg text-xs font-medium bg-cyan-500 text-white hover:bg-cyan-400 transition-colors',
            (loading || submitting || triggering) && 'opacity-70 cursor-not-allowed',
          ]"
          :disabled="loading || submitting || triggering"
          @click="triggerNow"
        >
          {{ triggering ? '测试中...' : '测试签到' }}
        </button>
        <button
          type="button"
          class="h-8 px-3 rounded-lg text-xs font-medium"
          :class="
            enabled
              ? 'bg-rose-500 text-white hover:bg-rose-400'
              : 'bg-emerald-500 text-white hover:bg-emerald-400'
          "
          :disabled="loading || submitting || triggering"
          @click="toggleEnabled"
        >
          {{ submitting ? (enabled ? '停用中...' : '启用中...') : enabled ? '停用' : '启用' }}
        </button>
      </div>

      <p class="mt-3 text-[11px] text-gray-500">
        默认策略：签到前 {{ signInLeadMinutes }} 分钟，签退后 {{ signOutDelayMinutes }} 分钟
      </p>

      <button
        type="button"
        class="absolute top-3 right-3 w-8 h-8 rounded-full text-gray-500 hover:text-white hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
        :disabled="submitting || triggering"
        @click="close"
      >
        <i class="ri-close-line"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, reactive, ref, watch } from 'vue';
import { AutorunClient, scheduledTaskConfig } from '@/sdk/autorun';
import { useDataStore } from '@/composables/useDataStore';

const props = defineProps({
  visible: { type: Boolean, default: false },
});
const emit = defineEmits(['update:visible', 'saved']);

const showMessage = inject('showMessage', (message) => alert(message));
const { token } = useDataStore();

const apiBase = (scheduledTaskConfig.apiBaseUrl || '').replace(/\/$/, '');
const autorunClient = apiBase ? new AutorunClient({ baseURL: apiBase }) : null;

const loading = ref(false);
const submitting = ref(false);
const triggering = ref(false);
const status = reactive({
  enabled: 0,
  sign_in_lead_minutes: 10,
  sign_out_delay_minutes: 10,
  should_sign_in: false,
  should_sign_out: false,
  sign_in_done: false,
  sign_out_done: false,
  last_attempt_at: '',
  last_result: '',
  last_action: '',
  last_success_at: '',
});

const task = reactive({
  hasTask: false,
  activityId: 0,
  activityName: '',
  startTime: '',
  endTime: '',
  signInStatus: 0,
  signBackStatus: 0,
  signInTimeText: '',
  signBackLimitTimeText: '',
});

const enabled = computed(() => Number(status.enabled) === 1 || status.enabled === true);
const signInLeadMinutes = computed(() => Number(status.sign_in_lead_minutes) || 10);
const signOutDelayMinutes = computed(() => Number(status.sign_out_delay_minutes) || 10);
const signInStateText = computed(() =>
  task.signInStatus === 1 || hasText(task.signInTimeText) ? '已签到' : '未签到',
);
const signOutStateText = computed(() =>
  task.signBackStatus === 1 || hasText(task.signBackLimitTimeText) ? '已签退' : '未签退',
);
const taskTimeText = computed(() => {
  const start = formatDisplayDateTime(task.startTime);
  const end = formatDisplayDateTime(task.endTime);
  return `${start} - ${end}`;
});

const executedSignInText = computed(() => {
  if (status.last_action === 'sign_in' && hasText(status.last_success_at)) {
    return `已执行签到（${formatDisplayDateTime(status.last_success_at)}）`;
  }
  return '未执行签到';
});

const executedSignOutText = computed(() => {
  if (status.last_action === 'sign_out' && hasText(status.last_success_at)) {
    return `已执行签退（${formatDisplayDateTime(status.last_success_at)}）`;
  }
  return '未执行签退';
});

function applyStatus(data = {}) {
  status.enabled = data.enabled ?? 0;
  status.sign_in_lead_minutes = data.sign_in_lead_minutes ?? 10;
  status.sign_out_delay_minutes = data.sign_out_delay_minutes ?? 10;
  status.should_sign_in = !!data.should_sign_in;
  status.should_sign_out = !!data.should_sign_out;
  status.sign_in_done = !!data.sign_in_done;
  status.sign_out_done = !!data.sign_out_done;
  status.last_attempt_at = String(data.last_attempt_at || '');
  status.last_result = String(data.last_result || '');
  status.last_action = String(data.last_action || '');
  status.last_success_at = String(data.last_success_at || '');
}

function applyTask(data = {}) {
  task.hasTask = data.has_task === true;
  task.activityId = Number(data.activity_id || 0);
  task.activityName = String(data.activity_name || '');
  task.startTime = String(data.start_time || '');
  task.endTime = String(data.end_time || '');
  task.signInStatus = Number(data.sign_in_status || 0);
  task.signBackStatus = Number(data.sign_back_status || 0);
  task.signInTimeText = String(data.sign_in_time_text || '');
  task.signBackLimitTimeText = String(data.sign_back_limit_time_text || '');
}

async function loadStatus() {
  if (!autorunClient || loading.value) return;
  if (!token.value) return;

  loading.value = true;
  try {
    const statusEnvelope = await autorunClient.getClubAutoStatus(token.value);
    const data = statusEnvelope?.data || {};
    applyStatus(data);
    applyTask(data);
  } catch (error) {
    showMessage(error?.message || '加载俱乐部定时任务状态失败', 'error');
  } finally {
    loading.value = false;
  }
}

async function toggleEnabled() {
  if (!autorunClient || submitting.value) return;
  if (!token.value) return;

  submitting.value = true;
  try {
    const nextEnabled = !enabled.value;
    await autorunClient.setClubAutoConfig(token.value, { enabled: nextEnabled ? 1 : 0 });
    await loadStatus();
    showMessage(nextEnabled ? '俱乐部定时任务已开启' : '俱乐部定时任务已关闭', 'success');
    emit('saved');
  } catch (error) {
    showMessage(error?.message || '保存俱乐部定时任务配置失败', 'error');
  } finally {
    submitting.value = false;
  }
}

async function triggerNow() {
  if (!autorunClient || triggering.value) return;
  if (!token.value) return;

  triggering.value = true;
  try {
    const envelope = await autorunClient.triggerClubAuto(token.value);
    const message = envelope?.data?.result?.message || '执行完成';
    showMessage(message, 'success');
    await loadStatus();
    emit('saved');
  } catch (error) {
    showMessage(error?.message || '执行俱乐部定时任务失败', 'error');
  } finally {
    triggering.value = false;
  }
}

function close() {
  emit('update:visible', false);
}

function formatDisplayDateTime(value) {
  const text = String(value || '').trim();
  return text || '--';
}

function hasText(value) {
  return String(value || '').trim() !== '';
}

watch(
  () => props.visible,
  (next) => {
    if (next) loadStatus();
  },
  { immediate: true },
);
</script>

<style scoped>
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
</style>
