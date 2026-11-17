import { defineStore } from 'pinia';
import { ref, computed, type Ref, type ComputedRef } from 'vue';

export type ThemePreference = 'auto' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const PREFERENCE_STORAGE_KEY = 'byerun.theme_preference';
const LEGACY_THEME_STORAGE_KEY = 'byerun.theme';

function getInitialPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'auto';
  try {
    const saved = localStorage.getItem(PREFERENCE_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      return saved;
    }
    // 兼容历史单一 light/dark 缓存
    const legacy = localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    if (legacy === 'dark' || legacy === 'light') {
      return legacy;
    }
  } catch {}
  return 'auto';
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useThemeStore = defineStore('theme', () => {
  const preference: Ref<ThemePreference> = ref(getInitialPreference());
  const systemTheme: Ref<ResolvedTheme> = ref(getSystemTheme());

  // 监听系统深色模式媒体查询变化
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      systemTheme.value = e.matches ? 'dark' : 'light';
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handler);
    }
  }

  // 计算当前解析后的实际主题
  const theme: ComputedRef<ResolvedTheme> = computed(() => {
    return preference.value === 'auto' ? systemTheme.value : preference.value;
  });

  const isDark: ComputedRef<boolean> = computed(() => theme.value === 'dark');

  // 将主题应用到 DOM 与 Meta
  const applyThemeToDOM = (activeTheme: ResolvedTheme) => {
    if (typeof document === 'undefined') return;
    const isDarkTheme = activeTheme === 'dark';
    const root = document.documentElement;

    root.setAttribute('data-theme', activeTheme);
    root.classList.toggle('dark', isDarkTheme);
    root.classList.toggle('light', !isDarkTheme);
    root.style.colorScheme = activeTheme;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDarkTheme ? '#0d1117' : '#eef0f4');
    }
  };

  // 设置偏好
  const setPreference = (newPref: ThemePreference): void => {
    preference.value = newPref;
    try {
      localStorage.setItem(PREFERENCE_STORAGE_KEY, newPref);
      localStorage.setItem(LEGACY_THEME_STORAGE_KEY, theme.value);
    } catch {}
    applyThemeToDOM(theme.value);
  };

  // 快捷切换（用于旧代码兼容：在 light 和 dark 之间切换）
  const toggle = (): void => {
    if (isDark.value) {
      setPreference('light');
    } else {
      setPreference('dark');
    }
  };

  const setDark = (dark: boolean): void => {
    setPreference(dark ? 'dark' : 'light');
  };

  // 立即初始化生效
  applyThemeToDOM(theme.value);

  return {
    preference,
    theme,
    isDark,
    setPreference,
    toggle,
    setDark,
  };
});
