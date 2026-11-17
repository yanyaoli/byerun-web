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
        <h1 class="text-sm font-bold text-[var(--text)]">外观主题</h1>
      </div>
    </header>

    <!-- 主题选项列表（参考 byerun-app AppearancePage） -->
    <main class="flex-1 w-full max-w-md mx-auto px-4 py-4 space-y-4">
      <section class="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-xs overflow-hidden">
        <div role="radiogroup" aria-label="选择外观主题" class="divide-y divide-[var(--border)]">
          <!-- 1. 自动 -->
          <button
            type="button"
            role="radio"
            :aria-checked="themeStore.preference === 'auto'"
            @click="themeStore.setPreference('auto')"
            class="w-full min-h-[56px] px-4 py-3 flex items-center justify-between transition-colors text-left hover:bg-[var(--surface-soft)] cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center">
                <i class="ri-computer-line text-lg"></i>
              </div>
              <div>
                <span class="text-xs font-bold text-[var(--text)] block">自动</span>
                <span class="text-[11px] text-[var(--muted)]">跟随系统模式自动切换</span>
              </div>
            </div>
            <i
              v-if="themeStore.preference === 'auto'"
              class="ri-check-line text-lg text-[var(--brand)] font-bold"
            ></i>
          </button>

          <!-- 2. 深色模式 -->
          <button
            type="button"
            role="radio"
            :aria-checked="themeStore.preference === 'dark'"
            @click="themeStore.setPreference('dark')"
            class="w-full min-h-[56px] px-4 py-3 flex items-center justify-between transition-colors text-left hover:bg-[var(--surface-soft)] cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-100 flex items-center justify-center">
                <i class="ri-moon-line text-lg"></i>
              </div>
              <div>
                <span class="text-xs font-bold text-[var(--text)] block">深色</span>
                <span class="text-[11px] text-[var(--muted)]">始终保持暗黑配色与柔和夜间视觉</span>
              </div>
            </div>
            <i
              v-if="themeStore.preference === 'dark'"
              class="ri-check-line text-lg text-[var(--brand)] font-bold"
            ></i>
          </button>

          <!-- 3. 浅色模式 -->
          <button
            type="button"
            role="radio"
            :aria-checked="themeStore.preference === 'light'"
            @click="themeStore.setPreference('light')"
            class="w-full min-h-[56px] px-4 py-3 flex items-center justify-between transition-colors text-left hover:bg-[var(--surface-soft)] cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <i class="ri-sun-line text-lg"></i>
              </div>
              <div>
                <span class="text-xs font-bold text-[var(--text)] block">浅色</span>
                <span class="text-[11px] text-[var(--muted)]">明亮清爽的经典视觉</span>
              </div>
            </div>
            <i
              v-if="themeStore.preference === 'light'"
              class="ri-check-line text-lg text-[var(--brand)] font-bold"
            ></i>
          </button>
        </div>
      </section>

      <!-- 提示说明 -->
      <p class="text-xs text-[var(--muted)] px-2 leading-relaxed">
        选择「自动」模式时，应用将实时监听您的手机系统或浏览器系统深浅色偏好并自动同步切换。
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useThemeStore } from '@/composables/useTheme';

const router = useRouter();
const themeStore = useThemeStore();

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: 'settings' });
  }
};
</script>
