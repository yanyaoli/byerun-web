<template>
  <div class="w-full">
    <header
      ref="headerRef"
      class="fixed top-0 left-0 right-0 z-[1000] w-full app-header"
      :class="[
        props.transparent
          ? 'app-header--transparent'
          : props.scrolled
            ? 'app-header--scrolled'
            : 'app-header--top',
      ]"
    >
      <div class="w-full max-w-[540px] mx-auto h-11 px-7 sm:px-8 flex items-end justify-between pb-2">
        <slot name="content">
          <template v-if="props.iconsOnly">
            <div class="flex items-center justify-between w-full h-7 pointer-events-auto">
              <div class="h-7 w-7 flex items-center justify-center opacity-85">
                <img
                  src="/logo.png"
                  alt="App Logo"
                  class="h-5 w-5 object-contain block"
                  :class="isDark ? 'header-logo-mono-dark' : 'header-logo-mono-light'"
                />
              </div>
              <div class="flex items-center gap-2.5 h-7">
                <button
                  type="button"
                  class="inline-flex items-center justify-center h-7 w-7 transition-colors rounded-lg header-action-btn"
                  :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                  @click="themeStore.toggle()"
                >
                  <i v-if="isDark" class="ri-sun-fill text-[19px]"></i>
                  <i v-else class="ri-moon-clear-fill text-[19px]"></i>
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <div
              class="flex items-center flex-1 min-w-0 h-7 overflow-hidden gap-2 pointer-events-auto"
            >
              <div
                class="welcome-sequence h-7"
                :class="isDark ? 'welcome-sequence--dark' : 'welcome-sequence--light'"
              >
                <div
                  class="welcome-sequence-logo h-7 w-7 flex items-center justify-center"
                  :class="{ 'is-visible': welcomePhase !== 'text' }"
                >
                  <img
                    src="/logo.png"
                    alt="App Logo"
                    class="h-5 w-5 object-contain block"
                  />
                </div>

                <span
                  class="welcome-sequence-text h-7 flex items-center"
                  :class="{ 'is-visible': welcomePhase === 'text' }"
                >
                  {{ welcomeText }}
                </span>
              </div>
            </div>

            <div class="flex items-center shrink-0 gap-2.5 h-7 pointer-events-auto">
              <!-- 系统设置图标按钮（收纳主题与服务器配置） -->
              <button
                type="button"
                class="inline-flex items-center justify-center h-7 w-7 transition-colors rounded-lg header-action-btn cursor-pointer"
                title="系统设置"
                @click="openSettings"
              >
                <i class="ri-settings-3-line text-[19px]"></i>
              </button>

              <!-- 用户账号图标与下拉菜单（account-circle-fill） -->
              <div class="relative inline-block" v-if="hasUserInfo">
                <button
                  type="button"
                  class="inline-flex items-center justify-center h-7 w-7 transition-colors rounded-lg header-action-btn"
                  :class="{ 'bg-[var(--action-hover-bg)] text-[var(--text-primary)]': dropdownOpen }"
                  aria-label="用户菜单"
                  @click="dropdownOpen = !dropdownOpen"
                >
                  <i class="ri-account-circle-fill text-[19px]"></i>
                </button>

                <!-- 点击外部遮罩层：收起菜单 -->
                <div
                  v-if="dropdownOpen"
                  class="fixed inset-0 z-[1001] bg-transparent cursor-default"
                  @click="dropdownOpen = false"
                ></div>

                <!-- 浮动纯色实心下拉面板：彻底不透明 -->
                <transition
                  enter-active-class="transition duration-150 ease-out"
                  enter-from-class="transform scale-95 opacity-0"
                  enter-to-class="transform scale-100 opacity-100"
                  leave-active-class="transition duration-100 ease-in"
                  leave-from-class="transform scale-100 opacity-100"
                  leave-to-class="transform scale-95 opacity-0"
                >
                  <div
                    v-if="dropdownOpen"
                    class="absolute right-0 top-full mt-2 w-48 p-2.5 z-[1002] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl"
                    style="opacity: 1 !important;"
                    :style="{ backgroundColor: isDark ? '#18181b' : '#ffffff' }"
                    @click.stop
                  >
                    <!-- 姓名与学号 -->
                    <div class="px-2 py-1 space-y-1">
                      <div class="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        <span class="truncate">{{ fullDisplayName }}</span>
                      </div>
                      <div v-if="registerCode" class="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-mono">
                        <span class="truncate">{{ registerCode }}</span>
                      </div>
                    </div>

                    <div class="my-1.5 border-t border-zinc-100 dark:border-zinc-800"></div>

                    <!-- 系统设置入口 -->
                    <button
                      type="button"
                      class="w-full flex items-center gap-2 py-1.5 px-2.5 rounded-xl text-xs font-medium text-[var(--text)] transition-all hover:bg-[var(--surface-soft)] active:scale-95 cursor-pointer mb-1"
                      @click="dropdownOpen = false; openSettings();"
                    >
                      <i class="ri-settings-3-line text-sm text-[var(--muted)]"></i>
                      <span>系统设置</span>
                    </button>

                    <!-- 退出登录按钮 -->
                    <button
                      type="button"
                      class="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold theme-danger transition-all hover:bg-[var(--danger-soft)] active:scale-95 cursor-pointer"
                      @click="dropdownOpen = false; onLogoutClick();"
                    >
                      <i class="ri-logout-box-r-line text-sm"></i>
                      <span>退出登录</span>
                    </button>
                  </div>
                </transition>
              </div>
            </div>
          </template>
        </slot>
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
import { useSettings } from '@/composables/useSettings';

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
const { openSettings } = useSettings();
const { userInfo, clearAllData } = useDataStore();
const { clearChatData } = useChatStore();

const welcomePhase = ref('logo');
const hasPlayedWelcome = ref(false);
const timers = [];
const dropdownOpen = ref(false);

const displayName = computed(() => {
  const name = userInfo.value?.studentName;
  if (typeof name === 'string' && name.trim()) return name.trim();
  return '同学';
});

const fullDisplayName = computed(() => {
  const name = userInfo.value?.studentName;
  if (typeof name === 'string' && name.trim()) return name.trim();
  return '未命名用户';
});

const registerCode = computed(() => userInfo.value?.registerCode ?? '');

const hasUserInfo = computed(() => {
  return !!(userInfo.value && (userInfo.value.studentName || userInfo.value.registerCode || userInfo.value.userId));
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

const onLogoutClick = async () => {
  dropdownOpen.value = false;
  await handleLogout();
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
  height: 28px;
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
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  transform: scale(0.86);
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
  transform: scale(1);
  opacity: var(--welcome-logo-opacity-visible);
  filter: var(--welcome-logo-filter-visible);
}

.welcome-sequence-text.is-visible {
  transform: scale(1);
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

.app-header {
  border: none !important;
  border-bottom: none !important;
  transition:
    background-color var(--theme-transition-duration) var(--theme-transition-easing),
    box-shadow var(--theme-transition-duration) var(--theme-transition-easing),
    backdrop-filter var(--theme-transition-duration) var(--theme-transition-easing),
    -webkit-backdrop-filter var(--theme-transition-duration) var(--theme-transition-easing);
}

.app-header--top {
  background-color: transparent !important;
  border: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.app-header--scrolled {
  background-color: var(--header-scrolled-bg) !important;
  border: none !important;
  border-bottom: none !important;
  box-shadow: var(--header-scrolled-shadow) !important;
  backdrop-filter: blur(var(--header-glass-blur, 8px)) saturate(var(--header-glass-saturate, 140%)) !important;
  -webkit-backdrop-filter: blur(var(--header-glass-blur, 8px)) saturate(var(--header-glass-saturate, 140%)) !important;
}

.app-header--transparent {
  background-color: transparent !important;
  border: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
</style>
