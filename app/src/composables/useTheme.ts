import { defineStore } from 'pinia';
import { ref, watch, type Ref } from 'vue';

const THEME_STORAGE_KEY = 'byerun.theme';

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
}

export const useThemeStore = defineStore('theme', () => {
  const isDark: Ref<boolean> = ref(getInitialTheme());

  const applyTheme = (dark: boolean): void => {
    if (typeof document === 'undefined') return;

    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  };

  watch(isDark, (dark) => applyTheme(dark), { immediate: true });

  const toggle = (): void => {
    isDark.value = !isDark.value;
  };

  const setDark = (dark: boolean): void => {
    isDark.value = Boolean(dark);
  };

  return { isDark, toggle, setDark };
});
