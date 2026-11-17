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
        <h1 class="text-sm font-bold text-[var(--text)]">外观主题</h1>
      </div>
    </header>

    <!-- 主题选项列表（扁平化平铺） -->
    <main class="flex-1 w-full max-w-md mx-auto px-4 py-4 space-y-4">
      <section>
        <div class="text-xs font-medium text-[var(--muted)] px-3 mb-1.5">模式选择</div>
        <div
          role="radiogroup"
          aria-label="选择外观主题"
          class="bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden shadow-2xs"
        >
          <!-- 1. 自动 -->
          <button
            type="button"
            role="radio"
            :aria-checked="themeStore.preference === 'auto'"
            @click="themeStore.setPreference('auto')"
            class="w-full min-h-[52px] px-4 py-3.5 flex items-center justify-between transition-colors text-left hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <i class="ri-computer-line text-lg text-[var(--muted)]"></i>
              <span class="text-sm font-medium text-[var(--text)]">自动 (跟随系统)</span>
            </div>
            <i
              v-if="themeStore.preference === 'auto'"
              class="ri-check-line text-xl text-[var(--brand)] font-bold"
            ></i>
          </button>

          <!-- 2. 深色模式 -->
          <button
            type="button"
            role="radio"
            :aria-checked="themeStore.preference === 'dark'"
            @click="themeStore.setPreference('dark')"
            class="w-full min-h-[52px] px-4 py-3.5 flex items-center justify-between transition-colors text-left hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <i class="ri-moon-line text-lg text-[var(--muted)]"></i>
              <span class="text-sm font-medium text-[var(--text)]">深色</span>
            </div>
            <i
              v-if="themeStore.preference === 'dark'"
              class="ri-check-line text-xl text-[var(--brand)] font-bold"
            ></i>
          </button>

          <!-- 3. 浅色模式 -->
          <button
            type="button"
            role="radio"
            :aria-checked="themeStore.preference === 'light'"
            @click="themeStore.setPreference('light')"
            class="w-full min-h-[52px] px-4 py-3.5 flex items-center justify-between transition-colors text-left hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <i class="ri-sun-line text-lg text-[var(--muted)]"></i>
              <span class="text-sm font-medium text-[var(--text)]">浅色</span>
            </div>
            <i
              v-if="themeStore.preference === 'light'"
              class="ri-check-line text-xl text-[var(--brand)] font-bold"
            ></i>
          </button>
        </div>
      </section>

      <!-- 提示说明 -->
      <p class="text-xs text-[var(--muted)] px-3 leading-relaxed">
        选择「自动」模式时，应用将实时跟随手机或电脑操作系统的深浅色偏好自动同步切换。
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
