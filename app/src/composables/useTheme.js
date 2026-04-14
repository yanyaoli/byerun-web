import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

const THEME_STORAGE_KEY = 'byerun.theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
}

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(getInitialTheme());

  const applyTheme = (dark) => {
    if (typeof document === 'undefined') return;

    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  };

  watch(isDark, (dark) => applyTheme(dark), { immediate: true });

  const toggle = () => {
    isDark.value = !isDark.value;
  };

  const setDark = (dark) => {
    isDark.value = Boolean(dark);
  };

  return { isDark, toggle, setDark };
});
