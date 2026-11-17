<template>
  <div
    class="min-h-full h-full flex flex-col bg-[var(--canvas)] text-[var(--text)] select-none theme-transition overflow-y-auto"
    :style="{ paddingBottom: 'calc(var(--sab, env(safe-area-inset-bottom, 0px)) + 24px)' }"
  >
    <!-- 顶部返回导航栏（适配移动端状态栏安全区） -->
    <header
      class="sticky top-0 z-30 w-full px-3 flex items-center justify-between border-b border-[var(--border)] bg-[var(--canvas)]/90 backdrop-blur-md shrink-0"
      :style="{
        paddingTop: 'var(--sat, env(safe-area-inset-top, 0px))',
        height: 'calc(var(--sat, env(safe-area-inset-top, 0px)) + 48px)',
      }"
    >
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="goBack"
          class="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text)] hover:bg-[var(--surface-soft)] active:scale-95 transition-all cursor-pointer"
          aria-label="返回系统设置"
        >
          <i class="ri-arrow-left-line text-lg"></i>
        </button>
        <h1 class="text-sm font-bold text-[var(--text)]">服务器配置</h1>
      </div>
      <div class="flex items-center gap-1">
        <button
          type="button"
          @click="testAllNodes"
          class="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--brand)] hover:bg-[var(--surface-soft)] active:scale-95 transition-all cursor-pointer"
          title="重新检测所有节点延迟"
        >
          <i :class="['text-base', isTestingAny ? 'ri-loader-4-line animate-spin' : 'ri-refresh-line']"></i>
        </button>
        <button
          type="button"
          @click="handleResetDefault"
          class="text-xs text-[var(--muted)] hover:text-[var(--brand)] transition-colors cursor-pointer px-2 py-1 rounded-lg"
        >
          恢复默认
        </button>
      </div>
    </header>

    <!-- 主体设置内容（扁平化平铺） -->
    <main class="flex-1 w-full max-w-md mx-auto px-4 py-4 space-y-4">
      <!-- 自动回退状态激活提示 -->
      <div
        v-if="isFallbackActive"
        class="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2"
      >
        <i class="ri-alert-line text-sm shrink-0"></i>
        <span>当前代理源暂不可达，已临时自动回退至官方源保障连通。</span>
      </div>

      <!-- 服务节点平铺列表 -->
      <section>
        <div class="text-xs font-medium text-[var(--muted)] px-3 mb-1.5">服务节点</div>
        <div class="bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden shadow-2xs">
          <!-- 1. 代理源（默认） -->
          <div
            @click="handleSelectSource('proxy')"
            class="p-3.5 hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer"
          >
            <div class="flex items-start gap-3">
              <!-- 前置单选圆点 -->
              <div class="pt-0.5 shrink-0">
                <span
                  class="w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200"
                  :class="sourceType === 'proxy' ? 'border-[var(--brand)] bg-[var(--brand)] shadow-xs' : 'border-[var(--border)] bg-transparent'"
                >
                  <span v-if="sourceType === 'proxy'" class="w-1.5 h-1.5 rounded-full bg-white"></span>
                </span>
              </div>

              <!-- 主体信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
                    <span class="text-sm font-medium text-[var(--text)]">代理源</span>
                    <!-- 代理源徽标：推荐 -->
                    <span class="px-1.5 py-0.5 rounded text-[10px] bg-[var(--brand)]/10 text-[var(--brand)] font-medium">
                      推荐
                    </span>
                    <!-- 代理源徽标：支持云定时任务 -->
                    <span class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                      支持云定时任务
                    </span>
                  </div>

                  <!-- 最右侧耗时徽标 -->
                  <span
                    class="px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors shrink-0 ml-1.5"
                    :class="getLatencyBadgeClass(latencies.proxy)"
                  >
                    {{ getLatencyBadgeText(latencies.proxy) }}
                  </span>
                </div>
                <div class="text-xs font-mono text-[var(--muted)] mt-1 truncate">
                  {{ PROXY_SERVER_URL }}
                </div>
              </div>
            </div>
          </div>

          <!-- 2. 官方源 -->
          <div
            @click="handleSelectSource('official')"
            class="p-3.5 hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer"
          >
            <div class="flex items-start gap-3">
              <!-- 前置单选圆点 -->
              <div class="pt-0.5 shrink-0">
                <span
                  class="w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200"
                  :class="sourceType === 'official' ? 'border-[var(--brand)] bg-[var(--brand)] shadow-xs' : 'border-[var(--border)] bg-transparent'"
                >
                  <span v-if="sourceType === 'official'" class="w-1.5 h-1.5 rounded-full bg-white"></span>
                </span>
              </div>

              <!-- 主体信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
                    <span class="text-sm font-medium text-[var(--text)]">官方源</span>
                    <!-- 官方源徽标：原生接口 -->
                    <span class="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                      原生接口
                    </span>
                  </div>

                  <!-- 最右侧耗时徽标 -->
                  <span
                    class="px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors shrink-0 ml-1.5"
                    :class="getLatencyBadgeClass(latencies.official)"
                  >
                    {{ getLatencyBadgeText(latencies.official) }}
                  </span>
                </div>
                <div class="text-xs font-mono text-[var(--muted)] mt-1 truncate">
                  {{ OFFICIAL_SERVER_URL }}
                </div>
                <!-- 官方源说明：网页端不支持 -->
                <div class="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1 font-medium">
                  <i class="ri-error-warning-line text-xs shrink-0"></i>
                  <span>网页端不支持（受浏览器跨域 CORS 策略限制，仅在 APP 移动端可用）</span>
                </div>
                <!-- 自动回退说明 -->
                <div class="text-[11px] text-[var(--muted)] flex items-center gap-1 mt-1">
                  <i class="ri-shield-check-line text-xs shrink-0 text-emerald-500"></i>
                  <span>代理源异常或不可用时，系统将自动无缝回退至官方源保障连通</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. 自定义源 -->
          <div
            @click="handleSelectSource('custom')"
            class="p-3.5 hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer"
          >
            <div class="flex items-start gap-3">
              <!-- 前置单选圆点 -->
              <div class="pt-0.5 shrink-0">
                <span
                  class="w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200"
                  :class="sourceType === 'custom' ? 'border-[var(--brand)] bg-[var(--brand)] shadow-xs' : 'border-[var(--border)] bg-transparent'"
                >
                  <span v-if="sourceType === 'custom'" class="w-1.5 h-1.5 rounded-full bg-white"></span>
                </span>
              </div>

              <!-- 主体信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
                    <span class="text-sm font-medium text-[var(--text)]">自定义源</span>
                    <span class="text-xs text-[var(--muted)]">私有中继或反向代理网关</span>
                  </div>

                  <!-- 最右侧耗时徽标（仅在配置了自定义地址时显示） -->
                  <span
                    v-if="customUrl"
                    class="px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors shrink-0 ml-1.5"
                    :class="getLatencyBadgeClass(latencies.custom)"
                  >
                    {{ getLatencyBadgeText(latencies.custom) }}
                  </span>
                </div>

                <div v-if="customUrl && sourceType !== 'custom'" class="text-xs font-mono text-[var(--muted)] mt-1 truncate">
                  {{ customUrl }}
                </div>

                <!-- 自定义输入框（仅选中时显示） -->
                <div v-if="sourceType === 'custom'" class="mt-2.5 flex gap-2" @click.stop>
                  <input
                    type="url"
                    v-model="customInput"
                    placeholder="https://api.yourdomain.com"
                    class="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--brand)]"
                  />
                  <button
                    type="button"
                    class="px-3 py-1.5 text-xs font-medium rounded-xl bg-[var(--brand)] text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                    @click="handleSaveCustom"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 消息节点配置 -->
      <section>
        <div class="text-xs font-medium text-[var(--muted)] px-3 mb-1.5">消息节点</div>
        <div class="bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xs p-3.5">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span class="text-sm font-medium text-[var(--text)]">消息服务节点</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold font-mono">
                Beta
              </span>
            </div>

            <!-- 最右侧耗时徽标 -->
            <span
              class="px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors shrink-0 ml-1.5"
              :class="getLatencyBadgeClass(latencies.message)"
            >
              {{ getLatencyBadgeText(latencies.message) }}
            </span>
          </div>
          <div class="text-xs font-mono text-[var(--muted)] mt-1.5 break-all select-text">
            {{ MESSAGE_SERVER_URL }}
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  useServerConfig,
  OFFICIAL_SERVER_URL,
  PROXY_SERVER_URL,
  MESSAGE_SERVER_URL,
  type ServerSourceType,
} from '@/composables/useServerConfig';
import { useMessage } from '@/composables/useMessage';

interface LatencyInfo {
  loading: boolean;
  latency?: number;
  ok?: boolean;
  message?: string;
}

const router = useRouter();
const { showMessage } = useMessage();

const {
  sourceType,
  customUrl,
  isFallbackActive,
  setSourceType,
  setCustomUrl,
  resetToDefault,
  testConnection,
  testMessageServerConnection,
} = useServerConfig();

const customInput = ref(customUrl.value);
const isTestingAny = ref(false);

const latencies = ref<{
  proxy: LatencyInfo;
  official: LatencyInfo;
  custom: LatencyInfo;
  message: LatencyInfo;
}>({
  proxy: { loading: true },
  official: { loading: true },
  custom: { loading: false },
  message: { loading: true },
});

const getLatencyBadgeClass = (info?: LatencyInfo) => {
  if (!info || info.loading) {
    return 'bg-slate-500/10 text-slate-400 font-mono animate-pulse';
  }
  if (!info.ok) {
    return 'bg-rose-500/10 text-rose-500 dark:text-rose-400 font-mono font-medium';
  }
  if (info.latency !== undefined) {
    if (info.latency < 300) {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-medium';
    }
    if (info.latency <= 800) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-medium';
    }
    return 'bg-rose-500/10 text-rose-500 dark:text-rose-400 font-mono font-medium';
  }
  return 'bg-slate-500/10 text-slate-400 font-mono';
};

const getLatencyBadgeText = (info?: LatencyInfo) => {
  if (!info || info.loading) return '测速中...';
  if (!info.ok) return '不可用';
  return `${info.latency}ms`;
};

const testSingleNode = async (
  key: 'proxy' | 'official' | 'custom' | 'message',
  testFn: () => Promise<{ ok: boolean; latency: number; message: string }>
) => {
  latencies.value[key] = { loading: true };
  try {
    const res = await testFn();
    latencies.value[key] = {
      loading: false,
      ok: res.ok,
      latency: res.latency,
      message: res.message,
    };
  } catch (e: any) {
    latencies.value[key] = {
      loading: false,
      ok: false,
      message: e?.message || '连接失败',
    };
  }
};

const testAllNodes = async () => {
  isTestingAny.value = true;
  const tasks: Promise<void>[] = [
    testSingleNode('proxy', () => testConnection(PROXY_SERVER_URL)),
    testSingleNode('official', () => testConnection(OFFICIAL_SERVER_URL)),
    testSingleNode('message', () => testMessageServerConnection(MESSAGE_SERVER_URL)),
  ];

  if (customUrl.value && customUrl.value.trim()) {
    tasks.push(testSingleNode('custom', () => testConnection(customUrl.value)));
  }

  await Promise.allSettled(tasks);
  isTestingAny.value = false;
};

const handleSelectSource = (type: ServerSourceType) => {
  setSourceType(type);
};

const handleSaveCustom = () => {
  const clean = customInput.value.trim().replace(/\/+$/, '');
  if (!clean) {
    showMessage('请输入有效的自定义服务地址', 'warning');
    return;
  }
  setCustomUrl(clean);
  showMessage('已保存并切换至自定义服务地址', 'success');
  testSingleNode('custom', () => testConnection(clean));
};

const handleResetDefault = () => {
  resetToDefault();
  customInput.value = '';
  showMessage('已恢复默认配置（代理源）', 'info');
  testAllNodes();
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: 'settings' });
  }
};

onMounted(() => {
  testAllNodes();
});
</script>