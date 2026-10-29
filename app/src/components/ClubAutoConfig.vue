<template>
  <section class="theme-card rounded-xl p-4">
    <!-- 头部：标题、状态指示与 Switch 开关 -->
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0 flex items-center gap-2">
        <h3 class="text-sm font-semibold theme-text-primary leading-tight">俱乐部定时任务</h3>
        <span
          class="h-5 px-2 rounded-full text-[10px] font-medium inline-flex items-center border"
          :class="
            enabled
              ? 'theme-success-border theme-success-bg theme-success'
              : 'badge-neutral'
          "
        >
          {{ enabled ? '已启用' : '未启用' }}
        </span>
        <button
          type="button"
          class="w-5 h-5 rounded flex items-center justify-center theme-text-tertiary hover:theme-text-primary transition-colors disabled:opacity-50"
          :disabled="loading || submitting || !!actionPending"
          title="刷新定时任务状态"
          @click="loadStatus"
        >
          <i class="ri-refresh-line text-xs" :class="{ 'animate-spin': loading }"></i>
        </button>
      </div>

      <!-- Switch 开关 -->
      <button
        type="button"
        class="switch"
        :class="{ 'switch-on': enabled, 'opacity-60 cursor-not-allowed': submitting }"
        :disabled="submitting || loading || !!actionPending"
        role="switch"
        :aria-checked="enabled"
        aria-label="俱乐部定时任务"
        :title="enabled ? '点击停用定时任务' : '点击启用定时任务'"
        @click="toggleEnabled"
      >
        <i :class="{ 'animate-spin': submitting }"></i>
      </button>
    </div>

    <!-- 当前活动与操作放在一起，状态始终以文字和颜色共同表达 -->
    <div class="activity-panel mt-3">
      <template v-if="task.hasTask">
        <div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <div class="min-w-0 flex-1">
            <div class="text-[11px] theme-text-tertiary">当前活动</div>
            <div class="mt-1 text-sm font-semibold theme-text-primary break-words">{{ task.activityName || '活动详情待同步' }}</div>
            <div class="mt-1.5 flex items-start gap-1.5 text-xs theme-text-secondary">
              <i class="ri-time-line mt-px shrink-0" aria-hidden="true"></i>
              <span class="break-words">{{ taskTimeText }}</span>
            </div>
          </div>
          <span class="status-badge shrink-0" :class="activityStatusClass">{{ activityStatusText }}</span>
        </div>

        <div class="activity-footer mt-3 pt-3 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap gap-1.5" aria-label="签到签退状态">
            <span class="status-badge" :class="task.signInStatus === 1 ? 'status-success' : 'badge-neutral'">
              <i :class="task.signInStatus === 1 ? 'ri-checkbox-circle-fill' : 'ri-login-circle-line'" aria-hidden="true"></i>
              {{ signInStateText }}
            </span>
            <span class="status-badge" :class="task.signBackStatus === 1 ? 'status-success' : 'badge-neutral'">
              <i :class="task.signBackStatus === 1 ? 'ri-checkbox-circle-fill' : 'ri-logout-circle-r-line'" aria-hidden="true"></i>
              {{ signOutStateText }}
            </span>
          </div>
          <div v-if="task.activityId > 0" class="flex flex-wrap gap-2">
            <button
              v-if="task.signInStatus === 0 && task.signBackStatus !== 1"
              type="button"
              class="action-button action-cancel"
              :disabled="loading || submitting || !!actionPending"
              @click="emit('action', { type: 'cancel', activityId: task.activityId })"
            >
              {{ actionPending === 'cancel' ? '取消中...' : '取消报名' }}
            </button>
            <button
              v-if="task.signInStatus !== null && task.signBackStatus !== 1"
              type="button"
              class="action-button action-primary"
              :disabled="loading || submitting || !!actionPending"
              @click="emit('action', { type: task.signInStatus === 1 ? '2' : '1', activityId: task.activityId })"
            >
              <i :class="task.signInStatus === 1 ? 'ri-logout-circle-r-line' : 'ri-login-circle-line'" aria-hidden="true"></i>
              {{ actionPending === '1' ? '签到中...' : actionPending === '2' ? '签退中...' : task.signInStatus === 1 ? '签退' : '签到' }}
            </button>
          </div>
        </div>
      </template>
      <div v-else class="flex items-center gap-2 py-1 text-xs theme-text-secondary">
        <i class="ri-calendar-line text-base theme-text-tertiary" aria-hidden="true"></i>
        <span>{{ emptyActivityText }}</span>
      </div>
    </div>

    <!-- 定时任务执行记录（默认显示最新一条，支持展开完整历史） -->
    <div class="mt-2.5 p-2.5 rounded-lg bg-black/10 dark:bg-white/5 border border-white/10 text-xs">
      <div class="flex items-center justify-between text-[10px] theme-text-tertiary mb-1.5">
        <span class="flex items-center gap-1 font-medium">
          <i class="ri-history-line"></i>
          执行记录
        </span>
        <div class="flex items-center gap-2">
          <span v-if="status.last_attempt_at" class="font-mono opacity-80">
            {{ formatDisplayDateTime(status.last_attempt_at) }}
          </span>
          <button
            type="button"
            class="text-[10px] text-sky-500 hover:text-sky-400 inline-flex items-center gap-0.5 transition-colors"
            @click="toggleHistory"
          >
            <span>{{ showHistory ? '收起历史' : '查看历史' }}</span>
            <i :class="showHistory ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
          </button>
        </div>
      </div>

      <!-- 最新一次执行反馈展示与一键复制 -->
      <div class="flex items-start justify-between gap-2">
        <div
          class="font-mono text-[11px] break-all select-all leading-relaxed flex-1"
          :class="resultStatusClass"
        >
          {{ displayResultText }}
        </div>
        <button
          type="button"
          class="shrink-0 p-1 -mt-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          title="复制结果反馈给开发者"
          @click="copyResult(displayResultText)"
        >
          <i class="ri-file-copy-line text-xs"></i>
        </button>
      </div>

      <!-- 历史流水列表（展开时显示） -->
      <div v-if="showHistory" class="mt-2.5 pt-2 border-t border-white/10 space-y-1.5">
        <div v-if="loadingHistory" class="text-center py-2 text-[11px] theme-text-tertiary">
          <i class="ri-loader-4-line animate-spin"></i> 加载记录中...
        </div>
        <div v-else-if="historyRecords.length === 0" class="text-center py-2 text-[11px] theme-text-tertiary">
          暂无历史执行记录
        </div>
        <div
          v-for="rec in historyRecords"
          :key="`club-rec-${rec.id}-${rec.created_at}`"
          class="flex items-start justify-between gap-2 p-1.5 rounded bg-black/5 dark:bg-white/5 text-[11px]"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 text-[10px] mb-0.5">
              <span
                class="w-1.5 h-1.5 rounded-full shrink-0"
                :class="rec.success ? 'bg-emerald-500' : 'bg-rose-500'"
              ></span>
              <span class="font-medium px-1 rounded bg-black/10 dark:bg-white/10 text-[9px]">
                {{ rec.action_text || '任务' }}
              </span>
              <span v-if="rec.activity_name" class="theme-text-secondary truncate max-w-[120px]">
                {{ rec.activity_name }}
              </span>
              <span class="theme-text-tertiary font-mono ml-auto shrink-0">
                {{ formatDisplayDateTime(rec.created_at) }}
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
            @click="copyResult(rec.message)"
          >
            <i class="ri-file-copy-line text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { getAutorunClient } from '@/sdk/autorun';
import { useDataStore } from '@/composables/useDataStore';
import { showMessage } from '@/composables/useMessage';

const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  actionPending: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue', 'change', 'updated', 'action']);

const { token } = useDataStore();

const loading = ref(false);
const submitting = ref(false);
const statusError = ref(false);

const status = reactive({
  enabled: 0,
  last_attempt_at: '',
  msg: '',
});

const task = reactive({
  hasTask: false,
  activityId: 0,
  activityName: '',
  startTime: '',
  endTime: '',
  signInStatus: null,
  signBackStatus: null,
});

const enabled = computed(() => Number(status.enabled) === 1 || status.enabled === true);

const emptyActivityText = computed(() => {
  if (statusError.value) return '当前活动获取失败，请稍后重试';
  return loading.value ? '正在获取当前活动' : '暂无当前活动';
});

const signInStateText = computed(() => task.signInStatus === null ? '签到状态未知' : task.signInStatus === 1 ? '已签到' : '未签到');

const signOutStateText = computed(() => task.signBackStatus === null ? '签退状态未知' : task.signBackStatus === 1 ? '已签退' : '未签退');

const activityStatusText = computed(() => {
  if (task.signBackStatus === 1) return '已完成';
  if (task.signInStatus === 1) return '待签退';
  if (task.signInStatus === 0) return '待签到';
  return '状态未知';
});
const activityStatusClass = computed(() => task.signBackStatus === 1 ? 'status-success' : task.signInStatus === null ? 'badge-neutral' : 'status-pending');

const taskTimeText = computed(() => {
  const start = formatDisplayDateTime(task.startTime);
  const end = formatDisplayDateTime(task.endTime);
  if (!start && !end) return '--';
  return `${start || '--'} - ${end || '--'}`;
});

const displayResultText = computed(() => {
  if (status.msg) return status.msg;
  if (task.hasTask) {
    if (task.signInStatus === 1 && task.signBackStatus === 1) {
      return '今日签到与签退均已完成';
    }
    if (task.signInStatus === 1) {
      return enabled.value ? '签到已完成，等待签退' : '签到已完成（定时任务已停用，需手动签退）';
    }
    if (task.signInStatus === null) return '等待活动签到状态';
    return enabled.value ? '等待自动签到' : '定时任务已停用（需手动签到）';
  }
  return enabled.value ? '已启用，等待下一次调度' : '定时任务已停用';
});

const isSuccessResult = computed(() => {
  const m = (displayResultText.value || '').toLowerCase();
  return m.includes('success') || m.includes('成功') || m.includes('完成');
});

const isWarningResult = computed(() => {
  const m = (displayResultText.value || '').toLowerCase();
  return (
    m.includes('fail') ||
    m.includes('失败') ||
    m.includes('error') ||
    m.includes('错误') ||
    m.includes('429') ||
    m.includes('超时') ||
    m.includes('20012')
  );
});

const resultStatusClass = computed(() => {
  if (isSuccessResult.value) return 'text-emerald-500 font-semibold';
  if (isWarningResult.value) return 'text-amber-500 font-medium';
  return 'theme-text-secondary';
});

function parseSignStatus(value) {
  if (value === null || value === undefined || value === '') return null;
  const status = Number(value);
  return status === 0 || status === 1 ? status : null;
}

function applyData(data = {}) {
  const nextEnabled = Number(data.enabled) === 1 || data.enabled === true;
  status.enabled = data.enabled ?? 0;
  status.last_attempt_at = String(data.last_attempt_at || '');
  status.msg = String(data.msg || '');

  task.hasTask = data.has_task === true;
  task.activityId = task.hasTask ? Number(data.activity_id || data.activityId || 0) : 0;
  task.activityName = task.hasTask ? String(data.activity_name || '') : '';
  task.startTime = task.hasTask ? String(data.start_time || '') : '';
  task.endTime = task.hasTask ? String(data.end_time || '') : '';
  task.signInStatus = task.hasTask ? parseSignStatus(data.sign_in_status) : null;
  task.signBackStatus = task.hasTask ? parseSignStatus(data.sign_back_status) : null;

  emit('update:modelValue', nextEnabled);
  emit('updated', { status, task });
}

const historyRecords = ref([]);
const showHistory = ref(false);
const loadingHistory = ref(false);

async function loadHistory() {
  const client = getAutorunClient();
  if (!client || !token.value || loadingHistory.value) return;

  loadingHistory.value = true;
  try {
    const res = await client.getClubAutoHistory(token.value, { limit: 15 });
    historyRecords.value = Array.isArray(res?.data?.records) ? res.data.records : [];
  } catch (error) {
    console.error('getClubAutoHistory failed:', error);
  } finally {
    loadingHistory.value = false;
  }
}

function toggleHistory() {
  showHistory.value = !showHistory.value;
  if (showHistory.value && historyRecords.value.length === 0) {
    loadHistory();
  }
}

async function loadStatus() {
  const client = getAutorunClient();
  if (!client || !token.value || loading.value) return;

  loading.value = true;
  try {
    const currentToken = token.value;
    const statusEnvelope = await client.getClubAutoStatus(currentToken);
    if (token.value !== currentToken) return;
    const data = statusEnvelope?.data || {};
    applyData(data);
    statusError.value = false;
  } catch (error) {
    statusError.value = true;
    console.error('getClubAutoStatus failed:', error);
  } finally {
    loading.value = false;
  }
}

async function toggleEnabled() {
  const client = getAutorunClient();
  if (!client || submitting.value || !token.value) return;

  const nextEnabled = !enabled.value;
  submitting.value = true;
  try {
    const payload = {
      enabled: nextEnabled ? 1 : 0,
    };
    const statusEnvelope = await client.getClubAutoStatus(token.value, payload);
    const data = statusEnvelope?.data || {};
    applyData(data);
    const actualEnabled = Number(data.enabled) === 1 || data.enabled === true;
    if (nextEnabled && !actualEnabled) {
      showMessage(data.msg || '俱乐部定时任务未开启', 'warning');
    } else {
      showMessage(actualEnabled ? '俱乐部定时任务已开启' : '俱乐部定时任务已关闭', 'success');
    }
    emit('change', actualEnabled);
    if (showHistory.value) {
      loadHistory();
    }
  } catch (error) {
    showMessage(error?.message || '设置定时任务失败', 'error');
  } finally {
    submitting.value = false;
  }
}

async function copyResult(text) {
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
}

function formatDisplayDateTime(value) {
  const text = String(value || '').trim();
  return text || '';
}

onMounted(() => {
  if (token.value) {
    loadStatus();
  }
});

watch(token, (newToken) => {
  if (newToken) {
    loadStatus();
  }
});

defineExpose({
  refresh: loadStatus,
  loadStatus,
  enabled,
});
</script>

<style scoped>
.activity-panel {
  background: var(--card-soft-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 12px;
}

.activity-footer {
  border-top: 1px solid var(--card-border);
}

.status-badge {
  min-height: 24px;
  padding: 2px 8px;
  border: 1px solid transparent;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.2;
}

.status-success {
  background: var(--success-bg);
  color: var(--success-color);
  border-color: var(--success-border);
}

.status-pending {
  background: var(--warning-bg);
  color: var(--warning-color);
  border-color: var(--warning-border);
}

.action-button {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button:focus-visible, .switch:focus-visible {
  outline: 2px solid var(--success-color);
  outline-offset: 2px;
}

.action-cancel {
  background: var(--danger-bg);
  color: var(--danger-color);
}

.action-primary {
  background: var(--success-bg);
  color: var(--success-color);
}

.badge-neutral {
  background-color: var(--card-soft-bg);
  color: var(--text-secondary);
  border: 1px solid var(--card-border);
}

.switch {
  width: 44px;
  height: 26px;
  border-radius: 13px;
  background: var(--bg-tertiary);
  position: relative;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
}

.switch i {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

.switch-on {
  background: var(--success-color, #22c55e);
}

.switch-on i {
  transform: translateX(18px);
}
</style>
