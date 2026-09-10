<template>
  <div>
    <header
      ref="headerRef"
      class="fixed top-1 left-0 right-0 z-999 flex justify-center pointer-events-none transition-all duration-300"
    >
      <div
        :class="[
          'flex items-center h-9 max-w-[360px] w-[calc(100%_-_24px)] px-4 rounded-full border pointer-events-auto transition-all duration-300 overflow-hidden backdrop-blur-xs bg-[var(--card-bg-strong)]/80 border-[var(--card-border)]',
          props.scrolled ? 'shadow-lg' : '',
          props.transparent ? 'app-header--transparent' : '',
        ]"
      >
        <div class="relative z-[1] flex items-center w-full h-full">
          <slot name="content">
            <template v-if="props.iconsOnly">
              <div class="flex items-center justify-between w-full h-full pointer-events-auto">
                <div class="h-4 w-4 flex items-center justify-center opacity-80">
                  <img
                    src="/logo.png"
                    alt="App Logo"
                    class="max-h-full max-w-full object-contain"
                    :class="isDark ? 'header-logo-mono-dark' : 'header-logo-mono-light'"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="inline-flex items-center justify-center h-5 w-5 transition-colors rounded-md header-action-btn"
                    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                    @click="themeStore.toggle()"
                  >
                    <i v-if="isDark" class="ri-sun-fill text-[14px]"></i>
                    <i v-else class="ri-moon-clear-fill text-[14px]"></i>
                  </button>
                </div>
              </div>
            </template>

            <template v-else>
              <div
                class="flex items-center flex-1 min-w-0 h-5 overflow-hidden gap-2 pointer-events-auto"
              >
                <div
                  class="welcome-sequence"
                  :class="isDark ? 'welcome-sequence--dark' : 'welcome-sequence--light'"
                >
                  <div
                    class="welcome-sequence-logo h-4 w-4 flex items-center justify-center"
                    :class="{ 'is-visible': welcomePhase !== 'text' }"
                  >
                    <img
                      src="/logo.png"
                      alt="App Logo"
                      class="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <span
                    class="welcome-sequence-text"
                    :class="{ 'is-visible': welcomePhase === 'text' }"
                  >
                    {{ welcomeText }}
                  </span>
                </div>
              </div>

              <div class="flex items-center shrink-0 gap-2 pointer-events-auto">
                <button
                  type="button"
                  class="inline-flex items-center justify-center h-5 w-5 transition-colors rounded-md header-action-btn"
                  :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                  @click="themeStore.toggle()"
                >
                  <i v-if="isDark" class="ri-sun-fill text-[14px]"></i>
                  <i v-else class="ri-moon-clear-fill text-[14px]"></i>
                </button>
              </div>
            </template>
          </slot>
        </div>
      </div>
    </header>

    <ConfirmDialog ref="confirmDialogRef" />
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance, watch, onUnmounted } from 'vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import { useDataStore } from '@/composables/useDataStore';
import { useChatStore } from '@/composables/useChatStore';
import { useThemeStore } from '@/composables/useTheme';

const props = defineProps({
  scrolled: { type: Boolean, default: false },
  showGithub: { type: Boolean, default: true },
  transparent: { type: Boolean, default: false },
  iconsOnly: { type: Boolean, default: false },
});

const emit = defineEmits(['logout']);

const headerRef = ref(null);
const confirmDialogRef = ref(null);
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);
const { userInfo, clearAllData } = useDataStore();
const { clearChatData } = useChatStore();

const welcomePhase = ref('logo');
const hasPlayedWelcome = ref(false);
const timers = [];

const displayName = computed(() => {
  const name = userInfo.value?.studentName;
  if (typeof name === 'string' && name.trim()) return name.trim();
  return '同学';
});

const welcomeText = computed(() => `Hi，${displayName.value}`);

const clearSequenceTimers = () => {
  while (timers.length) {
    clearTimeout(timers.pop());
  }
};

const startWelcomeSequence = () => {
  clearSequenceTimers();
  welcomePhase.value = 'logo';

  timers.push(
    setTimeout(() => {
      welcomePhase.value = 'text';
    }, 620),
  );

  timers.push(
    setTimeout(() => {
      welcomePhase.value = 'logo';
    }, 4000),
  );
};

watch(
  () => userInfo.value?.studentName,
  (name) => {
    if (!hasPlayedWelcome.value && typeof name === 'string' && name.trim()) {
      hasPlayedWelcome.value = true;
      startWelcomeSequence();
    }
  },
  { immediate: true },
);

const handleLogout = async () => {
  const confirmed = await confirmDialogRef.value?.show({
    title: '退出登录',
    message: '确定要退出登录吗？',
  });

  if (confirmed) {
    const instance = getCurrentInstance();
    const hasListener = !!(
      instance &&
      instance.vnode &&
      instance.vnode.props &&
      (instance.vnode.props.onLogout || instance.vnode.props.onLogout === '')
    );
    if (hasListener) {
      emit('logout');
    } else {
      try {
        clearAllData();
        clearChatData();
      } catch (e) {}
      window.location.reload();
    }
  }
};

const getHeaderElement = () => headerRef.value;

onUnmounted(() => {
  clearSequenceTimers();
});

defineExpose({
  getHeaderElement,
});
</script>

<style scoped>
.welcome-sequence {
  position: relative;
  width: 100%;
  height: 24px;
  display: flex;
  align-items: center;
  --welcome-logo-filter-hidden: brightness(0) saturate(100%) invert(22%) sepia(10%) saturate(341%)
    hue-rotate(181deg) brightness(92%) contrast(89%) blur(5px);
  --welcome-logo-filter-visible: brightness(0) saturate(100%) invert(22%) sepia(10%) saturate(341%)
    hue-rotate(181deg) brightness(92%) contrast(89%) blur(0);
  --welcome-logo-opacity-visible: 0.82;
  --welcome-text-color: #4b5563;
}

.welcome-sequence--dark {
  --welcome-logo-filter-hidden: brightness(0) saturate(100%) invert(92%) sepia(6%) saturate(222%)
    hue-rotate(182deg) brightness(97%) contrast(93%) blur(5px);
  --welcome-logo-filter-visible: brightness(0) saturate(100%) invert(92%) sepia(6%) saturate(222%)
    hue-rotate(182deg) brightness(97%) contrast(93%) blur(0);
  --welcome-logo-opacity-visible: 0.72;
  --welcome-text-color: #979797;
}

.welcome-sequence-logo,
.welcome-sequence-text {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scale(0.86);
  opacity: 0;
  filter: blur(5px);
  transition:
    opacity var(--theme-transition-duration) var(--theme-transition-easing),
    transform var(--theme-transition-duration) var(--theme-transition-easing),
    filter var(--theme-transition-duration) var(--theme-transition-easing),
    color var(--theme-transition-duration) var(--theme-transition-easing);
}

.welcome-sequence-logo {
  opacity: 0;
  filter: var(--welcome-logo-filter-hidden);
}

.welcome-sequence-text {
  max-width: 100%;
  padding-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 500;
  color: var(--welcome-text-color);
}

.welcome-sequence-logo.is-visible {
  transform: translateY(-50%) scale(1);
  opacity: var(--welcome-logo-opacity-visible);
  filter: var(--welcome-logo-filter-visible);
}

.welcome-sequence-text.is-visible {
  transform: translateY(-50%) scale(1);
  opacity: 1;
  filter: blur(0);
}

.header-action-btn {
  color: var(--text-secondary);
}

.header-action-btn:hover {
  color: var(--text-primary);
  background-color: var(--action-hover-bg);
}

.header-logo-mono-light {
  filter: grayscale(1) brightness(0);
}

.header-logo-mono-dark {
  filter: grayscale(1) brightness(0) invert(1);
}

.app-header--transparent {
  background-color: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
</style>
