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
          props.notifyOnly
            ? 'opacity-0 scale-95 pointer-events-none !border-transparent !shadow-none !bg-transparent'
            : '',
        ]"
      >
        <transition
          mode="out-in"
          enter-active-class="transition-all duration-220 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-180 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="!props.notifyOnly"
            key="default"
            class="relative z-[1] flex items-center w-full h-full"
          >
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

          <div v-else key="notify-placeholder" class="relative z-[1] w-full h-full"></div>
        </transition>
      </div>
    </header>

    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="notificationVisible && currentNotification"
        class="fixed top-3 left-0 right-0 z-999 flex justify-center pointer-events-none"
      >
        <div
          :class="[
            'flex items-center h-9 max-w-[360px] w-[calc(100%_-_24px)] px-3 gap-2 rounded-full border shadow-lg pointer-events-auto',
            'backdrop-blur-2xl',
            notificationTypeStyles[currentNotification.type || 'info'].shell,
          ]"
        >
          <i
            :class="[
              'text-[14px] shrink-0',
              notificationTypeStyles[currentNotification.type || 'info'].icon,
            ]"
          ></i>
          <span
            :class="[
              'flex-1 text-[13px] leading-5 truncate',
              notificationTypeStyles[currentNotification.type || 'info'].text,
            ]"
          >
            {{ currentNotification.content }}
          </span>
          <button
            type="button"
            class="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full transition-colors opacity-60 hover:opacity-100"
            :class="notificationTypeStyles[currentNotification.type || 'info'].closeBtn"
            @click="dismissNotification"
          >
            <i class="ri-close-line text-[14px]"></i>
          </button>
        </div>
      </div>
    </transition>

    <ConfirmDialog ref="confirmDialogRef" />
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance, watch, onUnmounted } from 'vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import { useDataStore } from '@/composables/useDataStore';
import { useChatStore } from '@/composables/useChatStore';
import { useThemeStore } from '@/composables/useTheme';
import { useNotification } from '@/composables/useNotification';

const props = defineProps({
  scrolled: { type: Boolean, default: false },
  showGithub: { type: Boolean, default: true },
  notifyOnly: { type: Boolean, default: false },
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
const { currentNotification, notificationVisible, dismissNotification } = useNotification();
const welcomePhase = ref('logo');
const hasPlayedWelcome = ref(false);
const timers = [];

const notificationTypeStyles = {
  info: {
    shell: '!bg-blue-500/15 !border-blue-500/30 backdrop-blur-2xl',
    icon: 'ri-information-fill text-blue-500',
    text: 'text-blue-700 dark:text-blue-300',
    closeBtn: 'text-blue-600 dark:text-blue-300',
  },
  warning: {
    shell: '!bg-amber-500/15 !border-amber-500/30 backdrop-blur-2xl',
    icon: 'ri-alert-fill text-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
    closeBtn: 'text-amber-600 dark:text-amber-300',
  },
  error: {
    shell: '!bg-rose-500/15 !border-rose-500/30 backdrop-blur-2xl',
    icon: 'ri-error-warning-fill text-rose-500',
    text: 'text-rose-700 dark:text-rose-300',
    closeBtn: 'text-rose-600 dark:text-rose-300',
  },
};

let messageTimer = null;

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
