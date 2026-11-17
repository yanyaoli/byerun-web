<template>
  <div class="min-h-full h-full flex flex-col bg-[var(--canvas)] text-[var(--text)] select-none theme-transition overflow-y-auto">
    <!-- 顶部返回导航栏 -->
    <header class="sticky top-0 z-30 h-12 w-full px-3 flex items-center justify-between border-b border-[var(--border)] bg-[var(--canvas)]/90 backdrop-blur-md shrink-0">
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="goBack"
          class="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text)] hover:bg-[var(--surface-soft)] active:scale-95 transition-all cursor-pointer"
          aria-label="返回上一页"
        >
          <i class="ri-arrow-left-line text-lg"></i>
        </button>
        <h1 class="text-sm font-bold text-[var(--text)]">系统设置</h1>
      </div>
    </header>

    <!-- 主体设置选项 -->
    <main class="flex-1 w-full max-w-md mx-auto px-4 py-4 space-y-4">
      <!-- 1. 系统偏好设置 -->
      <section class="bg-[var(--surface)] text-[var(--text)] p-4 rounded-3xl border border-[var(--border)] shadow-xs space-y-1">
        <h3 class="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider px-2 py-1">系统偏好</h3>

        <!-- 外观主题二级子页面入口 -->
        <div
          @click="router.push({ name: 'appearance-settings' })"
          class="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[var(--surface-soft)] cursor-pointer transition-colors group"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center shrink-0">
              <i class="ri-palette-line text-base"></i>
            </div>
            <div class="min-w-0">
              <span class="text-xs font-semibold text-[var(--text)] block">外观主题</span>
              <span class="text-[10px] text-[var(--muted)]">浅色 / 自动 / 深色模式</span>
            </div>
          </div>
          <div class="flex items-center gap-1 text-xs text-[var(--muted)] group-hover:text-[var(--text)]">
            <span class="font-medium">{{ themeLabel }}</span>
            <i class="ri-arrow-right-s-line text-base"></i>
          </div>
        </div>

        <div class="border-t border-[var(--border)] my-1"></div>

        <!-- 服务器配置二级子页面入口 -->
        <div
          @click="router.push({ name: 'server-settings' })"
          class="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[var(--surface-soft)] cursor-pointer transition-colors group"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <i class="ri-server-line text-base"></i>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-xs font-semibold text-[var(--text)]">服务器配置</span>
                <span
                  v-if="isFallbackActive"
                  class="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9px] font-bold"
                >
                  已回退官方源
                </span>
              </div>
              <span class="text-[10px] text-[var(--muted)]">代理源 · 官方源 · 自定义源</span>
            </div>
          </div>
          <div class="flex items-center gap-1 text-xs text-[var(--muted)] group-hover:text-[var(--text)]">
            <span class="font-medium">{{ serverLabel }}</span>
            <i class="ri-arrow-right-s-line text-base"></i>
          </div>
        </div>
      </section>

      <!-- 2. 关于信息 -->
      <section class="p-4 rounded-3xl bg-[var(--surface-soft)] border border-[var(--border)] text-center text-xs text-[var(--muted)] space-y-1.5">
        <div class="flex items-center justify-center gap-1.5 font-bold text-[var(--text)]">
          <i class="ri-information-line text-[var(--brand)] text-base"></i>
          <span>Byerun Web v26.3.24</span>
        </div>
        <p class="text-[11px] leading-relaxed">
          免费开源 · 基于 Vue 3 与 Capacitor 构建 · 多端一体
        </p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeStore } from '@/composables/useTheme';
import { useServerConfig } from '@/composables/useServerConfig';

const router = useRouter();
const themeStore = useThemeStore();
const { sourceType, isFallbackActive } = useServerConfig();

const themeLabel = computed(() => {
  if (themeStore.preference === 'auto') return '自动 (跟随系统)';
  if (themeStore.preference === 'dark') return '深色';
  return '浅色';
});

const serverLabel = computed(() => {
  if (isFallbackActive.value) return '已回退官方源';
  if (sourceType.value === 'proxy') return '代理源 (推荐)';
  if (sourceType.value === 'official') return '官方源';
  return '自定义源';
});

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: 'home' });
  }
};
</script>
