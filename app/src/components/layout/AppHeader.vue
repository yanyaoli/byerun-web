<template>
  <div>
    <header
      ref="headerRef"
      :class="[
        'fixed left-0 right-0 top-2 h-8 px-2 z-[998] pointer-events-none transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
      ]"
    >
      <div
        :class="[
          'flex items-center h-full backdrop-blur-[16px] border-none rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] relative mx-auto pointer-events-auto transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden',
          props.scrolled
            ? 'max-w-[380px] w-[calc(100%_-_52px)]'
            : 'max-w-[400px] w-[calc(100%_-_24px)]',
          messageVisible ? messageStyles[messageType].shell : 'bg-stone-900/20',
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
          <div v-if="messageVisible" key="message" class="flex items-center w-full px-4 gap-2.5">
            <i :class="['text-[14px] shrink-0', messageStyles[messageType].icon]"></i>
            <span :class="['text-[13px] leading-5 truncate', messageStyles[messageType].text]">
              {{ messageContent }}
            </span>
          </div>

          <div v-else key="default" class="flex items-center w-full h-full">
            <div
              class="flex items-center flex-1 min-w-0 h-6 pl-4 pr-2 overflow-hidden pointer-events-none"
            >
              <div class="welcome-sequence">
                <div
                  class="welcome-sequence-logo h-6 w-6 flex items-center justify-center"
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

            <!-- <button
              :class="[
                'inline-flex items-center justify-center p-0.5 text-[rgba(60,60,67,0.8)] rounded-full font-semibold transition-all duration-150 border-none outline-none shadow-none hover:bg-red-100 hover:text-red-700 ml-auto mr-4 shrink-0',
                props.scrolled ? 'h-5 w-5' : 'h-6 w-6',
              ]"
              @click="handleLogout"
              title="退出登录"
            >
              <i
                :class="['ri-logout-circle-r-line', props.scrolled ? 'text-[14px]' : 'text-[16px]']"
              ></i>
            </button> -->
            <div class="flex items-center">
              <a
                :href="githubUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center h-6 w-6 text-gray-400 hover:bg-white/10 transition-colors ml-auto mr-4 shrink-0 rounded-md"
                aria-label="GitHub"
                title="GitHub"
              >
                <i class="ri-github-line text-[20px]"></i>
              </a>
            </div>
          </div>
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

const githubUrl = urls.github || 'https://github.com/yanyaoli/byerun-web';

const props = defineProps({
  scrolled: { type: Boolean, default: false },
});

const emit = defineEmits(['logout']);

const headerRef = ref(null);
const confirmDialogRef = ref(null);
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
    shell: 'bg-emerald-50/92 border-emerald-200/70',
    icon: 'ri-checkbox-circle-fill text-emerald-600',
    text: 'text-emerald-900',
  },
  error: {
    shell: 'bg-rose-50/92 border-rose-200/70',
    icon: 'ri-error-warning-fill text-rose-600',
    text: 'text-rose-900',
  },
  info: {
    shell: 'bg-blue-50/92 border-blue-200/70',
    icon: 'ri-information-fill text-blue-600',
    text: 'text-blue-900',
  },
  warning: {
    shell: 'bg-amber-50/92 border-amber-200/70',
    icon: 'ri-alert-fill text-amber-600',
    text: 'text-amber-900',
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
    opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 520ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 520ms cubic-bezier(0.22, 1, 0.36, 1);
}

.welcome-sequence-logo {
  opacity: 0;
  filter: brightness(0) saturate(100%) invert(92%) sepia(6%) saturate(222%) hue-rotate(182deg)
    brightness(97%) contrast(93%) blur(5px);
}

.welcome-sequence-text {
  max-width: 100%;
  padding-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 500;
  color: #979797;
}

.welcome-sequence-logo.is-visible {
  transform: translateY(-50%) scale(1);
  opacity: 0.72;
  filter: brightness(0) saturate(100%) invert(92%) sepia(6%) saturate(222%) hue-rotate(182deg)
    brightness(97%) contrast(93%) blur(0);
}

.welcome-sequence-text.is-visible {
  transform: translateY(-50%) scale(1);
  opacity: 1;
  filter: blur(0);
}
</style>
