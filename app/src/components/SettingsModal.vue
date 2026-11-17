<template>
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isSettingsOpen"
      class="fixed inset-0 z-[10005] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      @click.self="closeSettings"
    >
      <div
        class="w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        :style="{ backgroundColor: isDark ? '#18181b' : '#ffffff' }"
      >
        <!-- 头部 -->
        <div class="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[var(--border)] shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center">
              <i class="ri-settings-3-fill text-lg"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-[var(--text)]">系统设置</h3>
              <p class="text-[11px] text-[var(--muted)]">外观主题与服务器网络配置</p>
            </div>
          </div>
          <button
            type="button"
            class="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-soft)] transition-colors cursor-pointer"
            aria-label="关闭设置"
            @click="closeSettings"
          >
            <i class="ri-close-line text-lg"></i>
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <!-- 1. 外观主题设置 -->
          <section class="space-y-2.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                <i class="ri-palette-line text-sm text-[var(--brand)]"></i>
                <span>外观主题</span>
              </label>
              <span class="text-[11px] text-[var(--muted)]">
                当前: {{ themeStore.preference === 'auto' ? '自动 (跟随系统)' : themeStore.preference === 'dark' ? '深色模式' : '浅色模式' }}
              </span>
            </div>

            <!-- 主题切换分段选择器（浅色 / 自动 / 深色） -->
            <div class="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)]">
              <button
                type="button"
                @click="themeStore.setPreference('light')"
                :class="[
                  'flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer',
                  themeStore.preference === 'light'
                    ? 'bg-white dark:bg-zinc-800 text-[var(--brand)] shadow-sm font-bold border border-[var(--brand)]/30'
                    : 'text-[var(--muted)] hover:text-[var(--text)]',
                ]"
              >
                <i class="ri-sun-line text-sm"></i>
                <span>浅色</span>
              </button>

              <button
                type="button"
                @click="themeStore.setPreference('auto')"
                :class="[
                  'flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer',
                  themeStore.preference === 'auto'
                    ? 'bg-white dark:bg-zinc-800 text-[var(--brand)] shadow-sm font-bold border border-[var(--brand)]/30'
                    : 'text-[var(--muted)] hover:text-[var(--text)]',
                ]"
              >
                <i class="ri-computer-line text-sm"></i>
                <span>自动</span>
              </button>

              <button
                type="button"
                @click="themeStore.setPreference('dark')"
                :class="[
                  'flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer',
                  themeStore.preference === 'dark'
                    ? 'bg-white dark:bg-zinc-800 text-[var(--brand)] shadow-sm font-bold border border-[var(--brand)]/30'
                    : 'text-[var(--muted)] hover:text-[var(--text)]',
                ]"
              >
                <i class="ri-moon-line text-sm"></i>
                <span>深色</span>
              </button>
            </div>
          </section>

          <!-- 2. 服务器配置 -->
          <section class="space-y-3 pt-2 border-t border-[var(--border)]">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                <i class="ri-server-line text-sm text-[var(--brand)]"></i>
                <span>服务器配置</span>
              </label>
              <button
                type="button"
                class="text-[11px] text-[var(--muted)] hover:text-[var(--brand)] transition-colors cursor-pointer"
                @click="handleResetDefault"
              >
                恢复默认
              </button>
            </div>

            <p class="text-[11px] text-[var(--muted)] leading-relaxed">
              默认为代理源；若代理源连接超时或异常，系统将<span class="text-[var(--brand)] font-semibold">自动无缝回退至官方源</span>保障核心功能。
            </p>

            <!-- 回退状态提示 -->
            <div
              v-if="isFallbackActive"
              class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2"
            >
              <i class="ri-alert-line text-sm shrink-0"></i>
              <span>当前主源暂不可用，已自动临时回退至官方源保障连通。</span>
            </div>

            <!-- 服务器源单选列表 -->
            <div class="space-y-2">
              <!-- 1. 代理源（默认） -->
              <div
                @click="setSourceType('proxy')"
                :class="[
                  'p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3',
                  sourceType === 'proxy'
                    ? 'border-[var(--brand)] bg-[var(--brand-soft)]/20 shadow-xs'
                    : 'border-[var(--border)] bg-[var(--surface-soft)]/50 hover:border-zinc-400 dark:hover:border-zinc-600',
                ]"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
                    :class="sourceType === 'proxy' ? 'border-[var(--brand)] bg-[var(--brand)] text-white' : 'border-zinc-400'"
                  >
                    <i v-if="sourceType === 'proxy'" class="ri-check-line text-[10px]"></i>
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-xs font-bold text-[var(--text)]">代理源 (推荐)</span>
                      <Chip size="sm" class="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] px-2 py-0.5">
                        支持云定时任务
                      </Chip>
                    </div>
                    <div class="text-[11px] text-[var(--muted)] font-mono truncate mt-0.5">
                      {{ PROXY_SERVER_URL }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. 官方源 -->
              <div
                @click="setSourceType('official')"
                :class="[
                  'p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3',
                  sourceType === 'official'
                    ? 'border-[var(--brand)] bg-[var(--brand-soft)]/20 shadow-xs'
                    : 'border-[var(--border)] bg-[var(--surface-soft)]/50 hover:border-zinc-400 dark:hover:border-zinc-600',
                ]"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
                    :class="sourceType === 'official' ? 'border-[var(--brand)] bg-[var(--brand)] text-white' : 'border-zinc-400'"
                  >
                    <i v-if="sourceType === 'official'" class="ri-check-line text-[10px]"></i>
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-xs font-bold text-[var(--text)]">官方源</span>
                      <Chip size="sm" class="bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold text-[10px] px-2 py-0.5">
                        原生接口
                      </Chip>
                    </div>
                    <div class="text-[11px] text-[var(--muted)] font-mono truncate mt-0.5">
                      {{ OFFICIAL_SERVER_URL }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 3. 自定义 -->
              <div
                @click="setSourceType('custom')"
                :class="[
                  'p-3 rounded-2xl border transition-all cursor-pointer space-y-2.5',
                  sourceType === 'custom'
                    ? 'border-[var(--brand)] bg-[var(--brand-soft)]/20 shadow-xs'
                    : 'border-[var(--border)] bg-[var(--surface-soft)]/50 hover:border-zinc-400 dark:hover:border-zinc-600',
                ]"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
                    :class="sourceType === 'custom' ? 'border-[var(--brand)] bg-[var(--brand)] text-white' : 'border-zinc-400'"
                  >
                    <i v-if="sourceType === 'custom'" class="ri-check-line text-[10px]"></i>
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="text-xs font-bold text-[var(--text)]">自定义源</span>
                    <p class="text-[10px] text-[var(--muted)]">配置您的专属中继或反向代理网关</p>
                  </div>
                </div>

                <!-- 自定义输入框（仅在选中时聚焦） -->
                <div v-if="sourceType === 'custom'" class="pl-7" @click.stop>
                  <input
                    type="url"
                    v-model="customInput"
                    @blur="handleSaveCustom"
                    placeholder="https://api.yourdomain.com"
                    class="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-white dark:bg-zinc-800 border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--brand)]"
                  />
                </div>
              </div>
            </div>

            <!-- 测试连通性按钮与测试结果反馈 -->
            <div class="space-y-2 pt-1">
              <div class="flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  class="text-xs flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-[var(--border)] cursor-pointer"
                  :disabled="testing"
                  @click="handleTestPing"
                >
                  <i :class="['text-xs', testing ? 'ri-loader-4-line animate-spin' : 'ri-pulse-line']"></i>
                  <span>{{ testing ? '连通性测试中...' : '测试当前服务器连接' }}</span>
                </Button>

                <div v-if="testResult" class="text-xs font-medium flex items-center gap-1 truncate">
                  <span
                    :class="testResult.ok ? 'text-emerald-500' : 'text-rose-500'"
                    class="flex items-center gap-1"
                  >
                    <i :class="testResult.ok ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"></i>
                    <span>{{ testResult.ok ? `${testResult.latency}ms 正常` : '连接失败' }}</span>
                  </span>
                </div>
              </div>

              <div
                v-if="testResult && !testResult.ok"
                class="p-2 rounded-xl bg-rose-500/10 text-rose-500 text-[11px] leading-tight"
              >
                {{ testResult.message }}
              </div>
            </div>
          </section>

          <!-- 3. 关于 -->
          <section class="pt-3 border-t border-[var(--border)] text-center text-[11px] text-[var(--muted)] space-y-1">
            <div class="font-semibold text-[var(--text)]">Byerun Web · 校园助手</div>
            <div>开源免费 · 多端运行支持</div>
          </section>
        </div>

        <!-- 底部确定按钮 -->
        <div class="px-6 py-3 border-t border-[var(--border)] bg-[var(--surface-soft)]/30 flex justify-end">
          <Button
            size="sm"
            class="px-5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--brand)] text-white hover:opacity-90 cursor-pointer"
            @click="closeSettings"
          >
            完成
          </Button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useThemeStore } from '@/composables/useTheme';
import {
  useServerConfig,
  OFFICIAL_SERVER_URL,
  PROXY_SERVER_URL,
  type ServerSourceType,
} from '@/composables/useServerConfig';
import { useSettings } from '@/composables/useSettings';
import { useMessage } from '@/composables/useMessage';
import { Button, Chip } from '@/components/ui';

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);
const { isSettingsOpen, closeSettings } = useSettings();
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
  setCustomUrl(clean);
  showMessage('已保存自定义服务地址', 'success');
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
      showMessage(`连接成功！延迟: ${res.latency}ms`, 'success');
    } else {
      showMessage(`连接异常: ${res.message}`, 'error');
    }
  } finally {
    testing.value = false;
  }
};
</script>
