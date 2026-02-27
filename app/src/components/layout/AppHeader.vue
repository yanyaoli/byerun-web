<template>
  <div>
    <header
      class="fixed left-0 right-0 top-2 h-11 z-[998] transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
    >
      <div
        class="flex items-center h-full bg-white/10 backdrop-blur-[16px] border border-white/50 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] relative max-w-[480px] mx-auto w-[calc(100%_-_24px)]"
      >
        <div
          class="flex items-center flex-1 min-w-0 h-full pl-4 pr-2 overflow-hidden pointer-events-none"
        >
          <div class="welcome-sequence">
            <img
              src="/logo.png"
              alt="App Logo"
              class="welcome-sequence-logo"
              :class="{ 'is-visible': welcomePhase !== 'text' }"
            />
            <span class="welcome-sequence-text" :class="{ 'is-visible': welcomePhase === 'text' }">
              {{ welcomeText }}
            </span>
          </div>
        </div>

        <button
          class="inline-flex items-center justify-center h-6 w-6 p-0.5 text-[rgba(60,60,67,0.8)] rounded-full font-semibold transition-all duration-150 border-none outline-none shadow-none hover:bg-red-100 hover:text-red-700 ml-auto mr-4 shrink-0"
          @click="handleLogout"
          title="退出登录"
        >
          <i class="ri-logout-circle-r-line text-[16px]"></i>
        </button>
      </div>
    </header>

    <ConfirmDialog ref="confirmDialogRef" />
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance, watch, onUnmounted } from 'vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import { useDataStore } from '@/composables/useDataStore';

const emit = defineEmits(['logout']);

const confirmDialogRef = ref(null);
const { userInfo } = useDataStore();
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
    }, 2300),
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

onUnmounted(() => {
  clearSequenceTimers();
});

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
        localStorage.clear();
      } catch (e) {}
      window.location.reload();
    }
  }
};
</script>

<style scoped>
.welcome-sequence {
  position: relative;
  width: 100%;
  height: 24px;
  max-width: 100%;
}

.welcome-sequence-logo,
.welcome-sequence-text {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-45%) scale(0.86);
  opacity: 0;
  filter: blur(5px);
  transition:
    opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 520ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 520ms cubic-bezier(0.22, 1, 0.36, 1);
}

.welcome-sequence-logo {
  width: 24px;
  height: 24px;
  opacity: 0;
  filter: grayscale(1) brightness(0) contrast(1.9) blur(5px);
}

.welcome-sequence-text {
  max-width: 100%;
  padding-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 500;
  color: rgba(60, 60, 67, 0.85);
}

.welcome-sequence-logo.is-visible {
  transform: translateY(-50%) scale(1);
  opacity: 0.72;
  filter: grayscale(1) brightness(0) contrast(1.9) blur(0);
}

.welcome-sequence-text.is-visible {
  transform: translateY(-50%) scale(1);
  opacity: 1;
  filter: blur(0);
}
</style>
