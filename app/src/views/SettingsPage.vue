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

    <!-- 主体设置选项（扁平化平铺） -->
    <main class="flex-1 w-full max-w-md mx-auto px-4 py-4 space-y-5">
      <!-- 1. 系统偏好设置 -->
      <section>
        <div class="text-xs font-medium text-[var(--muted)] px-3 mb-1.5">系统偏好</div>
        <div class="bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden shadow-2xs">
          <!-- 外观主题二级子页面入口 -->
          <button
            type="button"
            @click="router.push({ name: 'appearance-settings' })"
            class="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3 min-w-0">
              <i class="ri-palette-line text-lg text-[var(--muted)] shrink-0"></i>
              <span class="text-sm font-medium text-[var(--text)]">外观主题</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-[var(--muted)] shrink-0">
              <span>{{ themeLabel }}</span>
              <i class="ri-arrow-right-s-line text-base text-[var(--muted)]/60"></i>
            </div>
          </button>

          <!-- 服务器配置二级子页面入口 -->
          <button
            type="button"
            @click="router.push({ name: 'server-settings' })"
            class="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3 min-w-0">
              <i class="ri-server-line text-lg text-[var(--muted)] shrink-0"></i>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-medium text-[var(--text)]">服务器配置</span>
                <span
                  v-if="isFallbackActive"
                  class="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium"
                >
                  已回退官方源
                </span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-[var(--muted)] shrink-0">
              <span>{{ serverLabel }}</span>
              <i class="ri-arrow-right-s-line text-base text-[var(--muted)]/60"></i>
            </div>
          </button>
        </div>
      </section>

      <!-- 2. 关于信息 -->
      <section>
        <div class="text-xs font-medium text-[var(--muted)] px-3 mb-1.5">关于</div>
        <div class="bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden shadow-2xs">
          <div class="flex items-center justify-between px-4 py-3.5 text-sm">
            <div class="flex items-center gap-3 text-[var(--text)] font-medium">
              <i class="ri-information-line text-lg text-[var(--muted)]"></i>
              <span>应用版本</span>
            </div>
            <span class="text-xs font-mono text-[var(--muted)]">v26.3.24</span>
          </div>

          <a
            href="https://github.com/yanyaoli/byerun-web"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3 text-[var(--text)] font-medium text-sm">
              <i class="ri-github-line text-lg text-[var(--muted)]"></i>
              <span>开源代码库</span>
            </div>
            <div class="flex items-center gap-1 text-xs text-[var(--muted)]">
              <span>GitHub</span>
              <i class="ri-external-link-line text-sm text-[var(--muted)]/60"></i>
            </div>
          </a>
        </div>
      </section>

      <p class="text-center text-[11px] text-[var(--muted)] pt-1">
        免费开源 · 校园跑步与生活生存工具
      </p>
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
  if (themeStore.preference === 'auto') return '自动';
  if (themeStore.preference === 'dark') return '深色';
  return '浅色';
});

const serverLabel = computed(() => {
  if (isFallbackActive.value) return '已回退官方源';
  if (sourceType.value === 'proxy') return '代理源';
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
