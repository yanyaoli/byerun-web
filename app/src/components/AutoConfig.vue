<template>
  <div
    v-if="props.inline || props.visible"
    :class="ui.wrapper"
    @click.self="!props.inline && close()"
  >
    <div :class="ui.panel">
      <button
        v-if="!props.inline"
        type="button"
        class="absolute top-3 right-3 w-8 h-8 rounded-full auto-config-close"
        @click="close"
      >
        <i class="ri-close-line"></i>
      </button>

      <div v-if="!props.inline" class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="text-sm font-semibold theme-text-primary">校园跑定时任务</h3>
          <p v-if="screen === 'ready'" class="mt-1 text-xs theme-text-secondary truncate">{{ mapNameText }}</p>
        </div>
        <span
          v-if="screen === 'ready'"
          class="h-7 px-3 rounded-full border text-xs inline-flex items-center shrink-0 max-w-[130px]"
          :class="badgeClass"
        >
          <span class="truncate">{{ badgeText }}</span>
        </span>
      </div>

      <div v-if="screen === 'loading'" class="flex-1 flex flex-col items-center justify-center gap-3 py-14">
        <i class="ri-cloud-line theme-text-primary text-3xl animate-bounce"></i>
        <p class="text-[10px] theme-text-secondary font-black tracking-[0.3em] uppercase">
          连接服务中
        </p>
      </div>

      <div v-else-if="screen === 'error'" class="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-14">
        <div class="relative">
          <i class="ri-error-warning-line text-red-500 text-4xl animate-pulse"></i>
          <div class="absolute -inset-2 bg-red-500/20 blur-xl rounded-full"></div>
        </div>
        <div class="text-center">
          <p class="theme-text-primary text-xs font-bold">连接失败</p>
          <p class="theme-text-secondary text-[10px] mt-1 line-clamp-2">{{ loadError }}</p>
        </div>
        <button
          type="button"
          class="px-4 py-2 theme-button-primary text-[10px] font-bold rounded-xl transition-colors"
          @click="retry"
        >
          重新尝试
        </button>
      </div>

      <div v-else-if="screen === 'ready'" class="mt-4 space-y-4">
        <div>
          <div class="field-label">选择跑步地图</div>
          <select v-model="mapId" class="control">
            <option value="">请选择地图</option>
            <option v-for="m in maps" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>

        <div>
          <div class="field-label">任务定时</div>
          <input v-model="prefTime" type="time" class="control" />
        </div>

        <button type="button" class="flex w-full items-center justify-between gap-3 text-left" @click="toggleEnabled">
          <span class="min-w-0">
            <span class="block text-sm font-medium theme-text-primary">启用每日定时任务</span>
          </span>
          <span class="switch" :class="enabled ? 'switch-on' : ''"><i></i></span>
        </button>

        <div class="rounded-xl theme-card-soft p-3">
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <span class="text-[11px] font-semibold theme-text-tertiary tracking-wide">执行记录与状态</span>
            <div class="flex items-center gap-2">
              <span class="text-[10px] theme-text-tertiary">{{ lastRunLabel }}</span>
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

          <!-- 情况 1：今日已完成 / 执行失败（无论当前定时任务是否启用，只要今天执行过均展示） -->
          <div v-if="runtime.todayExecuted" class="space-y-2">
            <div class="flex items-start gap-2">
              <i
                :class="runtime.todaySuccess ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'"
                class="text-lg mt-0.5 shrink-0"
                :style="{ color: runtime.todaySuccess ? 'var(--success-color, #22c55e)' : 'var(--danger-color, #ef4444)' }"
              ></i>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold theme-text-primary">
                  今日已于 <span class="font-mono">{{ executedTimeText }}</span>
                  {{ runtime.todaySuccess ? '执行成功' : '执行失败' }}
                </p>
                <p v-if="!enabled" class="mt-0.5 text-[10px] text-amber-500/90">
                  当前定时任务已停用，明日将不再自动提交
                </p>
              </div>
            </div>

            <!-- 执行结果详情/报错信息展示与一键复制 -->
            <div
              v-if="runtime.msg"
              class="rounded-lg p-2.5 bg-black/10 dark:bg-white/5 border border-white/10 text-xs flex items-start justify-between gap-2"
            >
              <div class="min-w-0 flex-1">
                <div class="text-[10px] theme-text-tertiary mb-0.5">执行结果</div>
                <div
                  class="font-mono text-[11px] break-all select-all leading-relaxed"
                  :class="runtime.todaySuccess ? 'theme-success' : 'theme-danger'"
                >
                  {{ runtime.msg }}
                </div>
              </div>
              <button
                type="button"
                class="shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="复制结果信息"
                @click="copyResultText(runtime.msg)"
              >
                <i class="ri-file-copy-line text-xs"></i>
              </button>
            </div>
          </div>

          <!-- 情况 2：今日尚未执行，已启用定时任务（已预约） -->
          <div v-else-if="enabled" class="space-y-2">
            <div class="flex items-start gap-2">
              <i class="ri-time-line text-lg mt-0.5 shrink-0" style="color: #38bdf8"></i>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold theme-text-primary">已预约</p>
                <p class="mt-0.5 text-[11px] theme-text-secondary leading-relaxed">
                  今日预计执行时间：<span class="font-mono">{{ windowText }}</span>
                </p>
              </div>
            </div>

            <!-- 调度状态或提示 -->
            <div
              v-if="runtime.msg && !runtime.msg.includes('之间执行')"
              class="rounded-lg p-2.5 bg-black/10 dark:bg-white/5 border border-white/10 text-xs flex items-start justify-between gap-2"
            >
              <div class="min-w-0 flex-1">
                <div class="text-[10px] theme-text-tertiary mb-0.5">调度信息：</div>
                <div class="font-mono text-[11px] break-all select-all leading-relaxed theme-text-secondary">
                  {{ runtime.msg }}
                </div>
              </div>
              <button
                type="button"
                class="shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="复制调度信息"
                @click="copyResultText(runtime.msg)"
              >
                <i class="ri-file-copy-line text-xs"></i>
              </button>
            </div>
          </div>

          <!-- 情况 3：今日尚未执行，未启用定时任务 -->
          <div v-else class="space-y-1.5">
            <p class="text-[11px] theme-text-tertiary">
              未启用时不会自动提交跑步，可随时保存修改。
            </p>
            <div
              v-if="runtime.msg && runtime.msg !== '未启用定时任务' && runtime.msg !== '定时任务已停用'"
              class="rounded-lg p-2 bg-black/5 dark:bg-white/5 text-[11px] font-mono theme-text-tertiary break-all select-all flex items-start justify-between gap-2"
            >
              <span>上次结果：{{ runtime.msg }}</span>
              <button
                type="button"
                class="shrink-0 p-0.5 hover:opacity-80 transition-opacity"
                title="复制"
                @click="copyResultText(runtime.msg)"
              >
                <i class="ri-file-copy-line text-xs"></i>
              </button>
            </div>
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
              :key="`run-rec-${rec.id}-${rec.created_at}`"
              class="flex items-start justify-between gap-2 p-1.5 rounded bg-black/5 dark:bg-white/5 text-[11px]"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 text-[10px] mb-0.5">
                  <span
                    class="w-1.5 h-1.5 rounded-full shrink-0"
                    :class="rec.success ? 'bg-emerald-500' : 'bg-rose-500'"
                  ></span>
                  <span class="font-medium px-1 rounded bg-black/10 dark:bg-white/10 text-[9px]">
                    {{ rec.success ? '成功' : '失败' }}
                  </span>
                  <span v-if="rec.map_id" class="theme-text-secondary truncate max-w-[120px]">
                    地图: {{ rec.map_id }}
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
                @click="copyResultText(rec.message)"
              >
                <i class="ri-file-copy-line text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="w-full h-9 rounded-xl text-xs font-semibold transition-colors save-btn"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? '保存中...' : '保存配置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { getAutorunClient } from '@/sdk/autorun';
import { useDataStore } from '@/composables/useDataStore';
import { showMessage } from '@/composables/useMessage';

const props = defineProps({
  visible: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
});
const emit = defineEmits(['update:visible', 'saved']);

const { token } = useDataStore();

const busy = ref(false);
const screen = ref('loading');
const loadError = ref('');
const saving = ref(false);
const maps = ref([]);
const mapId = ref('');
const prefTime = ref('07:00');
const enabled = ref(false);
const runtime = reactive({
  todayExecuted: false,
  todaySuccess: false,
  todayResult: '',
  msg: '',
  estimatedWindow: '',
  lastRunAt: '',
});

const mapNameText = computed(() => {
  if (!enabled.value && !mapId.value) return '未启用定时任务';
  const match = maps.value.find((m) => m.id === mapId.value);
  return match ? match.name : mapId.value || '未选择地图';
});

const badgeClass = computed(() => {
  if (runtime.todayExecuted) {
    return runtime.todaySuccess
      ? 'theme-success-border theme-success-bg theme-success'
      : 'theme-danger-border theme-danger-bg theme-danger';
  }
  return enabled.value
    ? 'theme-warning-border theme-warning-bg theme-warning'
    : 'theme-warning-border theme-warning-bg theme-warning';
});

const badgeText = computed(() => {
  if (runtime.todayExecuted) {
    return runtime.todaySuccess ? '今日已完成' : '执行失败';
  }
  return enabled.value ? '已预约' : '未启用';
});

const lastRunLabel = computed(() => {
  if (!runtime.lastRunAt) return '无历史';
  const parts = String(runtime.lastRunAt).split(' ');
  if (parts.length > 1) return parts[1];
  return runtime.lastRunAt;
});

const executedTimeText = computed(() => {
  if (!runtime.todayExecuted) return '';
  const parts = String(runtime.lastRunAt || '').split(' ');
  if (parts.length === 2 && parts[1]) return parts[1].substring(0, 5);
  return '今日';
});

// 已预约展示：优先用后端 estimated_window（如 "07:30 ~ 07:35 之间"），无则回退到用户偏好时刻
const windowText = computed(() => {
  const window = String(runtime.estimatedWindow || '').trim();
  if (window) return `${window} 之间`;
  return `${prefTime.value || '07:00'} 之间`;
});

const ui = computed(() =>
  props.inline
    ? {
        wrapper: 'w-full h-full flex flex-col',
        panel: 'relative w-full h-full flex-1 flex flex-col p-4 overflow-y-auto',
      }
    : {
        wrapper:
          'fixed inset-0 z-[998] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm',
        panel: 'relative w-full max-w-[360px] rounded-2xl theme-card p-5 shadow-2xl',
      },
);

const toggleEnabled = () => {
  enabled.value = !enabled.value;
};

const applyStatus = (data = {}) => {
  const nextEnabled = Number(data.enabled) === 1 || data.enabled === true;
  enabled.value = nextEnabled;
  prefTime.value = String(data.preferred_time || '07:00').trim() || '07:00';
  mapId.value = String(data.map_id || '');

  runtime.todayExecuted = !!data.today_executed;
  runtime.todaySuccess = !!data.today_success;
  runtime.todayResult = String(data.today_result || data.msg || '');
  runtime.msg = String(data.msg || data.today_result || data.last_result || '');
  runtime.estimatedWindow = String(data.estimated_window || '');
  runtime.lastRunAt = String(data.last_run_at || '');
};

const copyResultText = async (text) => {
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

const load = async (silent = false) => {
  if (busy.value) return;

  const client = getAutorunClient();
  if (!client) {
    if (!silent) {
      screen.value = 'error';
      loadError.value = '自动任务服务未配置';
    }
    return;
  }
  if (!token.value) {
    if (!silent) {
      screen.value = 'error';
      loadError.value = '尚未登录，无法获取定时任务配置';
    }
    return;
  }

  if (!silent) screen.value = 'loading';
  busy.value = true;
  try {
    const [mapsEnvelope, statusEnvelope] = await Promise.all([
      client.getMaps(),
      client.getStatus(token.value),
    ]);
    maps.value = Array.isArray(mapsEnvelope?.data?.maps) ? mapsEnvelope.data.maps : [];
    applyStatus(statusEnvelope?.data || {});
    screen.value = 'ready';
  } catch (error) {
    const message = error?.message || '连接服务失败';
    if (silent) {
      showMessage(message, 'error');
    } else {
      screen.value = 'error';
      loadError.value = message;
    }
  } finally {
    busy.value = false;
  }
};

const historyRecords = ref([]);
const showHistory = ref(false);
const loadingHistory = ref(false);

const loadHistory = async () => {
  const client = getAutorunClient();
  if (!client || !token.value || loadingHistory.value) return;

  loadingHistory.value = true;
  try {
    const res = await client.getRunHistory(token.value, { limit: 15 });
    historyRecords.value = Array.isArray(res?.data?.records) ? res.data.records : [];
  } catch (error) {
    console.error('getRunHistory failed:', error);
  } finally {
    loadingHistory.value = false;
  }
};

const toggleHistory = () => {
  showHistory.value = !showHistory.value;
  if (showHistory.value && historyRecords.value.length === 0) {
    loadHistory();
  }
};

const retry = () => {
  load(false);
};

const refresh = () => {
  load(true);
};

const save = async () => {
  const client = getAutorunClient();
  if (!client || saving.value) return;
  if (!token.value) return;

  const willEnable = enabled.value;
  if (willEnable && !mapId.value) {
    showMessage('请先选择跑步地图', 'error');
    return;
  }

  saving.value = true;
  try {
    // 单次请求合并完成：保存配置并立即返回最新 status，减少网络往返与多次DB连接
    const statusEnvelope = await client.getStatus(token.value, {
      map_id: mapId.value,
      preferred_time: prefTime.value || '07:00',
      enabled: willEnable ? 1 : 0,
    });
    applyStatus(statusEnvelope?.data || {});
    showMessage('保存成功', 'success');
    emit('saved');
    if (showHistory.value) {
      loadHistory();
    }
  } catch (error) {
    showMessage(error?.message || '保存定时任务配置失败', 'error');
  } finally {
    saving.value = false;
  }
};

const close = () => {
  emit('update:visible', false);
};

watch(
  () => [props.inline, props.visible],
  ([inline, visible]) => {
    if (inline || visible) load();
  },
  { immediate: true },
);
</script>

<style scoped>
.auto-config-close {
  color: var(--text-tertiary);
}

.auto-config-close:hover {
  color: var(--text-primary);
  background-color: var(--action-hover-bg);
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  margin-bottom: 6px;
}

.control {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  font-size: 13px;
  color: var(--input-text-color, var(--text-primary));
  background: var(--card-soft-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s;
}

.control:focus {
  border-color: var(--input-focus-border-color, var(--card-border));
}

input.control[type='time'] {
  color-scheme: light dark;
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
  background: var(--success-color);
}

.switch-on i {
  transform: translateX(18px);
}

.save-btn {
  background: var(--accent-bg);
  color: var(--accent-color);
  border: 1px solid var(--accent-border);
}

.save-btn:hover {
  filter: brightness(1.06);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
