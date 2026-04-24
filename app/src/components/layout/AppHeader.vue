<template>
  <div>
    <header
      ref="headerRef"
      class="fixed top-1 left-0 right-0 z-999 flex justify-center pointer-events-none transition-all duration-300"
    >
      <div
        :class="[
          'flex items-center h-9 max-w-[360px] w-[calc(100%_-_24px)] backdrop-blur-2xl border rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] pointer-events-auto transition-all duration-300 overflow-hidden',
          'theme-card',
          'relative isolate bg-[var(--liquid-shell-bg)] backdrop-saturate-150 backdrop-blur-[22px]',
          messageVisible ? messageStyles[messageType].shell : '',
          props.transparent && !messageVisible ? 'app-header--transparent' : '',
          props.notifyOnly && !messageVisible
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
            v-if="messageVisible"
            key="message"
            class="relative z-[1] flex items-center w-full px-4 gap-2.5"
          >
            <i :class="['text-[14px] shrink-0', messageStyles[messageType].icon]"></i>
            <span :class="['text-[13px] leading-5 truncate', messageStyles[messageType].text]">
              {{ messageContent }}
            </span>
          </div>

          <div
            v-else-if="!props.notifyOnly"
            key="default"
            class="relative z-[1] flex items-center w-full h-full"
          >
            <slot name="content">
              <template v-if="props.iconsOnly">
                <div class="flex items-center justify-between w-full h-full px-3 pointer-events-auto">
                  <div class="h-5 w-5 flex items-center justify-center opacity-80">
                    <img
                      src="/logo.png"
                      alt="App Logo"
                      class="max-h-full max-w-full object-contain"
                      :class="isDark ? 'header-logo-mono-dark' : 'header-logo-mono-light'"
                    />
                  </div>
                  <div class="flex items-center gap-3">
                    <a
                      v-if="props.showGithub"
                      :href="githubUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center justify-center h-6 w-6 transition-colors rounded-md header-action-btn"
                      aria-label="GitHub"
                      title="GitHub"
                    >
                      <i class="ri-github-line text-[19px]"></i>
                    </a>
                  <button
                    type="button"
                    class="inline-flex items-center justify-center h-6 w-6 transition-colors rounded-md header-action-btn"
                    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                    @click="themeStore.toggle()"
                  >
                    <i v-if="isDark" class="ri-sun-fill text-[17px]"></i>
                    <i v-else class="ri-moon-clear-fill text-[17px]"></i>
                  </button>
                  </div>
                </div>
              </template>

              <template v-else>
                <div
                  class="flex items-center flex-1 min-w-0 h-6 pl-4 pr-2 overflow-hidden ml-auto mr-3 shrink-0 gap-3 pointer-events-auto"
                >
                  <div
                    class="welcome-sequence"
                    :class="isDark ? 'welcome-sequence--dark' : 'welcome-sequence--light'"
                  >
                    <div
                      class="welcome-sequence-logo h-5 w-5 flex items-center justify-center"
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

                <div class="flex items-center ml-auto mr-3 shrink-0 gap-3 pointer-events-auto">
                  <a
                    v-if="props.showGithub"
                    :href="githubUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center justify-center h-6 w-6 transition-colors rounded-md header-action-btn"
                    aria-label="GitHub"
                    title="GitHub"
                  >
                    <i class="ri-github-line text-[19px]"></i>
                  </a>
                  <button
                    type="button"
                    class="inline-flex items-center justify-center h-6 w-6 transition-colors rounded-md header-action-btn"
                    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                    @click="themeStore.toggle()"
                  >
                    <i v-if="isDark" class="ri-sun-fill text-[17px]"></i>
                    <i v-else class="ri-moon-clear-fill text-[17px]"></i>
                  </button>
                </div>
              </template>
            </slot>
          </div>

          <div v-else key="notify-placeholder" class="relative z-[1] w-full h-full"></div>
        </transition>
      </div>
    </header>

    <ConfirmDialog ref="confirmDialogRef" />
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance, watch, onUnmounted } from 'vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import { urls } from '@/sdk/app';
import { useDataStore } from '@/composables/useDataStore';
import { useChatStore } from '@/composables/useChatStore';
import { useThemeStore } from '@/composables/useTheme';

const githubUrl = urls.github || 'https://github.com/yanyaoli/byerun-web';

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
const welcomePhase = ref('logo');
const hasPlayedWelcome = ref(false);
const timers = [];
const messageVisible = ref(false);
const messageContent = ref('');
const messageType = ref('info');

const messageStyles = {
  success: {
    shell: '!bg-emerald-600 !border-emerald-500',
    icon: 'ri-checkbox-circle-fill text-black dark:text-white',
    text: 'text-black dark:text-white',
  },
  error: {
    shell: '!bg-rose-600 !border-rose-500',
    icon: 'ri-error-warning-fill text-black dark:text-white',
    text: 'text-black dark:text-white',
  },
  info: {
    shell: '!bg-blue-600 !border-blue-500',
    icon: 'ri-information-fill text-black dark:text-white',
    text: 'text-black dark:text-white',
  },
  warning: {
    shell: '!bg-amber-600 !border-amber-500',
    icon: 'ri-alert-fill text-black dark:text-white',
    text: 'text-black dark:text-white',
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

const show = (message, type = 'info') => {
  const normalizedType = messageStyles[type] ? type : 'info';
  const normalizedMessage = typeof message === 'string' ? message : String(message ?? '');
  if (!normalizedMessage) return;

  messageType.value = normalizedType;
  messageContent.value = normalizedMessage;
  messageVisible.value = true;

  if (messageTimer) clearTimeout(messageTimer);
  messageTimer = setTimeout(() => {
    messageVisible.value = false;
  }, 3000);
};

const getHeaderElement = () => headerRef.value;

onUnmounted(() => {
  clearSequenceTimers();
  if (messageTimer) clearTimeout(messageTimer);
});

defineExpose({
  show,
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
  color: var(--text-tertiary);
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
  border: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
</style>
