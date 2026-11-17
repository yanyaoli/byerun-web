<template>
  <div class="min-h-full h-full flex flex-col bg-[var(--canvas)] text-[var(--text)] select-none theme-transition overflow-y-auto">
    <!-- 顶部返回导航栏 -->
    <header class="sticky top-0 z-30 h-12 w-full px-3 flex items-center justify-between border-b border-[var(--border)] bg-[var(--canvas)]/90 backdrop-blur-md shrink-0">
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

    <!-- 主体设置内容 -->
    <main class="flex-1 w-full max-w-md mx-auto px-4 py-4 space-y-4">
      <!-- 说明提示 -->
      <section class="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--muted)] space-y-1.5 leading-relaxed">
        <div class="flex items-center gap-1.5 font-bold text-[var(--text)]">
          <i class="ri-shield-check-line text-[var(--brand)] text-sm"></i>
          <span>服务器配置与智能容灾机制</span>
        </div>
        <p class="text-[11px]">
          系统<strong class="text-[var(--text)]">默认为代理源</strong>。当网络波动、代理节点异常或连接不可用时，系统将<strong class="text-[var(--brand)]">自动无缝回退至官方源</strong>以保障核心功能正常运行。
        </p>
      </section>

      <!-- 自动回退状态激活提示 -->
      <div
        v-if="isFallbackActive"
        class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2"
      >
        <i class="ri-alert-line text-base shrink-0"></i>
        <span>当前主源暂不可达，已临时自动回退至官方源保障连通。</span>
      </div>

      <!-- 服务器源单选列表 -->
      <section class="space-y-2.5">
        <!-- 1. 代理源（默认） -->
        <div
          @click="setSourceType('proxy')"
          :class="[
            'p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1',
            sourceType === 'proxy'
              ? 'border-[var(--brand)] bg-[var(--brand-soft)]/20 shadow-xs'
              : 'border-[var(--border)] bg-[var(--surface)] hover:border-zinc-400 dark:hover:border-zinc-600',
          ]"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
                :class="sourceType === 'proxy' ? 'border-[var(--brand)] bg-[var(--brand)] text-white' : 'border-zinc-400'"
              >
                <i v-if="sourceType === 'proxy'" class="ri-check-line text-[10px]"></i>
              </div>
              <span class="text-xs font-bold text-[var(--text)]">代理源 (推荐)</span>
            </div>
            <!-- 代理源徽标：支持云定时任务 -->
            <Chip size="sm" class="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] px-2 py-0.5">
              支持云定时任务
            </Chip>
          </div>
          <div class="pl-6 text-[11px] text-[var(--muted)] font-mono truncate">
            {{ PROXY_SERVER_URL }}
          </div>
        </div>

        <!-- 2. 官方源 -->
        <div
          @click="setSourceType('official')"
          :class="[
            'p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5',
            sourceType === 'official'
              ? 'border-[var(--brand)] bg-[var(--brand-soft)]/20 shadow-xs'
              : 'border-[var(--border)] bg-[var(--surface)] hover:border-zinc-400 dark:hover:border-zinc-600',
          ]"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
                :class="sourceType === 'official' ? 'border-[var(--brand)] bg-[var(--brand)] text-white' : 'border-zinc-400'"
              >
                <i v-if="sourceType === 'official'" class="ri-check-line text-[10px]"></i>
              </div>
              <span class="text-xs font-bold text-[var(--text)]">官方源</span>
            </div>
            <!-- 官方源徽标：原生接口 -->
            <Chip size="sm" class="bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold text-[10px] px-2 py-0.5">
              原生接口
            </Chip>
          </div>
          <div class="pl-6 text-[11px] text-[var(--muted)] font-mono truncate">
            {{ OFFICIAL_SERVER_URL }}
          </div>

          <!-- 官方源说明：网页端不支持 -->
          <div class="pl-6 pt-0.5">
            <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-[11px] leading-tight font-medium">
              <i class="ri-error-warning-line text-xs shrink-0"></i>
              <span>网页端不支持（受浏览器跨域 CORS 策略限制，仅在 APP 移动端可用）</span>
            </div>
          </div>
        </div>

        <!-- 3. 自定义源 -->
        <div
          @click="setSourceType('custom')"
          :class="[
            'p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2',
            sourceType === 'custom'
              ? 'border-[var(--brand)] bg-[var(--brand-soft)]/20 shadow-xs'
              : 'border-[var(--border)] bg-[var(--surface)] hover:border-zinc-400 dark:hover:border-zinc-600',
          ]"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div
              class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
              :class="sourceType === 'custom' ? 'border-[var(--brand)] bg-[var(--brand)] text-white' : 'border-zinc-400'"
            >
              <i v-if="sourceType === 'custom'" class="ri-check-line text-[10px]"></i>
            </div>
            <div>
              <span class="text-xs font-bold text-[var(--text)]">自定义源</span>
              <p class="text-[10px] text-[var(--muted)]">配置您的私有中继或反向代理网关</p>
            </div>
          </div>

          <!-- 自定义输入框（仅选中时聚焦） -->
          <div v-if="sourceType === 'custom'" class="pl-6" @click.stop>
            <div class="flex gap-2">
              <input
                type="url"
                v-model="customInput"
                placeholder="https://api.yourdomain.com"
                class="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--brand)]"
              />
              <Button
                size="sm"
                variant="primary"
                class="text-xs px-3 rounded-xl bg-[var(--brand)] text-white cursor-pointer"
                @click="handleSaveCustom"
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      </section>

      <!-- 连通性测试区 -->
      <section class="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[var(--text)]">连通性测试</span>
          <Button
            size="sm"
            variant="secondary"
            class="text-xs flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-[var(--border)] cursor-pointer"
            :disabled="testing"
            @click="handleTestPing"
          >
            <i :class="['text-xs', testing ? 'ri-loader-4-line animate-spin' : 'ri-pulse-line']"></i>
            <span>{{ testing ? '测试中...' : '测试当前连接' }}</span>
          </Button>
        </div>

        <div v-if="testResult" class="p-2.5 rounded-xl border text-xs flex items-center gap-2" :class="testResult.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'">
          <i :class="testResult.ok ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'" class="text-sm shrink-0"></i>
          <span>{{ testResult.ok ? `连接成功！响应延迟: ${testResult.latency}ms` : `连接异常: ${testResult.message}` }}</span>
        </div>
      </section>
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
import { Button, Chip } from '@/components/ui';

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
