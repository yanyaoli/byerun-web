import { ref } from 'vue';

const isSettingsOpen = ref(false);

export const useSettings = () => {
  const openSettings = () => {
    isSettingsOpen.value = true;
  };

  const closeSettings = () => {
    isSettingsOpen.value = false;
  };

  const toggleSettings = () => {
    isSettingsOpen.value = !isSettingsOpen.value;
  };

  return {
    isSettingsOpen,
    openSettings,
    closeSettings,
    toggleSettings,
  };
};
