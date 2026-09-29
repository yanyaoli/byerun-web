<template>
  <section class="theme-card rounded-xl p-3.5">
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
          :disabled="loading || submitting"
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
        :disabled="submitting || loading"
        :title="enabled ? '点击停用定时任务' : '点击启用定时任务'"
        @click="toggleEnabled"
      >
        <i :class="{ 'animate-spin': submitting }"></i>
      </button>
    </div>

    <!-- 状态信息：当前活动与签到签退状态 -->
    <div class="mt-2.5 grid grid-cols-2 gap-2 text-xs theme-text-secondary">
      <div v-if="task.hasTask || task.activityName" class="meta-pill col-span-2">
        <i class="ri-calendar-line"></i>
        <span class="truncate">当前活动：{{ task.activityName }}（{{ taskTimeText }}）</span>
      </div>
      <div v-else class="meta-pill col-span-2">
        <i class="ri-time-line"></i>
        <span class="truncate">今日活动监控中（暂无进行中活动）</span>
      </div>

      <div class="meta-pill">
        <i
          :class="
            task.signInStatus === 1 || hasText(task.signInTimeText)
              ? 'ri-checkbox-circle-line theme-success'
              : 'ri-login-circle-line'
          "
        ></i>
        <span class="truncate">签到：{{ signInStateText }}</span>
      </div>
      <div class="meta-pill">
        <i
          :class="
            task.signBackStatus === 1 || hasText(task.signBackLimitTimeText)
              ? 'ri-checkbox-circle-line theme-success'
              : 'ri-logout-circle-r-line'
          "
        ></i>
        <span class="truncate">签退：{{ signOutStateText }}</span>
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
});

const emit = defineEmits(['update:modelValue', 'change', 'updated']);

const { token } = useDataStore();

const loading = ref(false);
const submitting = ref(false);

const status = reactive({
  enabled: 0,
  last_attempt_at: '',
  msg: '',
});

const task = reactive({
  hasTask: false,
  activityName: '',
  startTime: '',
  endTime: '',
  signInStatus: 0,
  signBackStatus: 0,
});

const enabled = computed(() => Number(status.enabled) === 1 || status.enabled === true);

const signInStateText = computed(() => (task.signInStatus === 1 ? '已签到' : '未签到'));

const signOutStateText = computed(() => (task.signBackStatus === 1 ? '已签退' : '未签退'));

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

function applyData(data = {}) {
  const nextEnabled = Number(data.enabled) === 1 || data.enabled === true;
  status.enabled = data.enabled ?? 0;
  status.last_attempt_at = String(data.last_attempt_at || '');
  status.msg = String(data.msg || '');

  task.hasTask = data.has_task === true;
  task.activityName = String(data.activity_name || '');
  task.startTime = String(data.start_time || '');
  task.endTime = String(data.end_time || '');
  task.signInStatus = Number(data.sign_in_status || 0);
  task.signBackStatus = Number(data.sign_back_status || 0);

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
    const statusEnvelope = await client.getClubAutoStatus(token.value);
    const data = statusEnvelope?.data || {};
    applyData(data);
  } catch (error) {
    console.error('getClubAutoStatus failed:', error);
  } finally {
    loading.value = false;
  }
}

async function toggleEnabled() {
  const client = getAutorunClient();
  if (!client || submitting.value || !token.value) return;

  submitting.value = true;
  try {
    const nextEnabled = !enabled.value;
    // 单次请求合并完成：保存配置并立即返回最新 status，消除二次往返
    const statusEnvelope = await client.getClubAutoStatus(token.value, { enabled: nextEnabled ? 1 : 0 });
    const data = statusEnvelope?.data || {};
    applyData(data);
    showMessage(nextEnabled ? '俱乐部定时任务已开启' : '俱乐部定时任务已关闭', 'success');
    emit('change', nextEnabled);
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

function hasText(value) {
  return String(value || '').trim() !== '';
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
