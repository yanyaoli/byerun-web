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
        <h1 class="text-sm font-bold text-[var(--text)]">服务器设置</h1>
      </div>
      <button
        type="button"
        @click="handleResetDefault"
        class="text-xs text-[var(--muted)] hover:text-[var(--brand)] transition-colors cursor-pointer px-2 py-1 rounded-lg"
      >
        恢复默认
      </button>
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

      <!-- 服务器源平铺列表 -->
      <section>
        <div class="text-xs font-medium text-[var(--muted)] px-3 mb-1.5">服务节点</div>
        <div class="bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden shadow-2xs">
          <!-- 1. 代理源（默认） -->
          <div
            @click="setSourceType('proxy')"
            class="p-3.5 hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-sm font-medium text-[var(--text)]">代理源 (推荐)</span>
                <!-- 代理源徽标：支持云定时任务 -->
                <span class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                  支持云定时任务
                </span>
              </div>
              <i
                v-if="sourceType === 'proxy'"
                class="ri-check-line text-xl text-[var(--brand)] font-bold shrink-0"
              ></i>
            </div>
            <div class="text-xs font-mono text-[var(--muted)] mt-1 truncate">
              {{ PROXY_SERVER_URL }}
            </div>
          </div>

          <!-- 2. 官方源 -->
          <div
            @click="setSourceType('official')"
            class="p-3.5 hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-sm font-medium text-[var(--text)]">官方源</span>
                <!-- 官方源徽标：原生接口 -->
                <span class="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                  原生接口
                </span>
              </div>
              <i
                v-if="sourceType === 'official'"
                class="ri-check-line text-xl text-[var(--brand)] font-bold shrink-0"
              ></i>
            </div>
            <div class="text-xs font-mono text-[var(--muted)] mt-1 truncate">
              {{ OFFICIAL_SERVER_URL }}
            </div>
            <!-- 官方源说明：网页端不支持 -->
            <div class="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1 font-medium">
              <i class="ri-error-warning-line text-xs shrink-0"></i>
              <span>网页端不支持（受浏览器跨域 CORS 策略限制，仅在 APP 移动端可用）</span>
            </div>
          </div>

          <!-- 3. 自定义源 -->
          <div
            @click="setSourceType('custom')"
            class="p-3.5 hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-sm font-medium text-[var(--text)]">自定义源</span>
                <span class="text-xs text-[var(--muted)]">私有中继或反向代理网关</span>
              </div>
              <i
                v-if="sourceType === 'custom'"
                class="ri-check-line text-xl text-[var(--brand)] font-bold shrink-0"
              ></i>
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
      </section>

      <!-- 连通性测试区 -->
      <section>
        <div class="text-xs font-medium text-[var(--muted)] px-3 mb-1.5">服务连通性</div>
        <div class="bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden shadow-2xs">
          <div class="flex items-center justify-between p-3.5">
            <div class="flex items-center gap-2.5">
              <i class="ri-pulse-line text-lg text-[var(--muted)]"></i>
              <span class="text-sm font-medium text-[var(--text)]">当前服务测试</span>
            </div>
            <button
              type="button"
              class="px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--border)] hover:bg-[var(--surface-soft)] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              :disabled="testing"
              @click="handleTestPing"
            >
              <i :class="['text-xs', testing ? 'ri-loader-4-line animate-spin' : 'ri-refresh-line']"></i>
              <span>{{ testing ? '测试中...' : '测试连接' }}</span>
            </button>
          </div>

          <div
            v-if="testResult"
            class="px-4 py-2.5 text-xs flex items-center gap-2"
            :class="testResult.ok ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500'"
          >
            <i :class="testResult.ok ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'" class="text-sm shrink-0"></i>
            <span>{{ testResult.ok ? `连接成功！响应延迟: ${testResult.latency}ms` : `连接异常: ${testResult.message}` }}</span>
          </div>
        </div>
      </section>

      <p class="text-xs text-[var(--muted)] px-3 leading-relaxed">
        提示：默认为代理源。当网络波动、代理异常或连接不可用时，系统将自动无缝回退至官方源保障连通。
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  useServerConfig,
  OFFICIAL_SERVER_URL,
  PROXY_SERVER_URL,
} from '@/composables/useServerConfig';
import { useMessage } from '@/composables/useMessage';

const router = useRouter();
const { showMessage } = useMessage();

const {
  sourceType,
  customUrl,
  activeBaseUrl,
  isFallbackActive,
  setSourceType,
  setCustomUrl,
  resetToDefault,
  testConnection,
} = useServerConfig();

const customInput = ref(customUrl.value);
const testing = ref(false);
const testResult = ref<{ ok: boolean; latency: number; message: string } | null>(null);

const handleSaveCustom = () => {
  const clean = customInput.value.trim().replace(/\/+$/, '');
  if (!clean) {
    showMessage('请输入有效的自定义服务地址', 'warning');
    return;
  }
  setCustomUrl(clean);
  showMessage('已保存并切换至自定义服务地址', 'success');
};

const handleResetDefault = () => {
  resetToDefault();
  customInput.value = '';
  testResult.value = null;
  showMessage('已恢复默认配置（代理源）', 'info');
};

const handleTestPing = async () => {
  testing.value = true;
  testResult.value = null;
  try {
    const res = await testConnection(activeBaseUrl.value);
    testResult.value = res;
    if (res.ok) {
      showMessage(`连接正常！延迟: ${res.latency}ms`, 'success');
    } else {
      showMessage(`连接异常: ${res.message}`, 'error');
    }
  } finally {
    testing.value = false;
  }
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: 'settings' });
  }
};
</script>
