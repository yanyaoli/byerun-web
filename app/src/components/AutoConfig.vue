<template>
  <div v-if="props.inline || props.visible" :class="ui.wrapper" @click.self="handleWrapperClick">
    <div :class="ui.panel">
      <div v-if="pinging" :class="ui.feedback">
        <i class="ri-cloud-line theme-text-primary text-3xl animate-bounce"></i>
        <p class="text-[10px] theme-text-secondary font-black tracking-[0.3em] uppercase">
          连接服务中
        </p>
      </div>

      <div v-else-if="initError" :class="ui.feedback">
        <div class="relative">
          <i class="ri-error-warning-line text-red-500 text-4xl animate-pulse"></i>
          <div class="absolute -inset-2 bg-red-500/20 blur-xl rounded-full"></div>
        </div>
        <div class="text-center px-6">
          <p class="theme-text-primary text-xs font-bold">连接失败</p>
          <p class="theme-text-secondary text-[10px] mt-1 line-clamp-2">{{ initError }}</p>
        </div>
        <button
          type="button"
          @click="reloadFrame"
          class="px-4 py-2 theme-button-primary text-[10px] font-bold rounded-xl transition-colors"
        >
          重新尝试
        </button>
      </div>

      <iframe
        v-show="!pinging && !initError"
        ref="frameRef"
        :src="embedUrl"
        class="w-full h-full min-h-[500px] border-0 rounded-none bg-transparent transition-opacity duration-300 flex-1"
        @load="onFrameLoad"
        @error="onFrameError"
      />

      <button
        v-if="!props.inline"
        type="button"
        @click="close"
        class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full auto-config-close transition-all z-10"
        title="关闭"
      >
        <i class="ri-close-line text-lg"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { scheduledTaskConfig } from '@/sdk/autorun';
import { useDataStore } from '@/composables/useDataStore';

const props = defineProps({
  visible: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
});

const emit = defineEmits(['update:visible', 'saved']);

const { token } = useDataStore();
const frameRef = ref(null);
const pinging = ref(true);
const initError = ref(null);
let loadTimeout = null;

const API_BASE = (scheduledTaskConfig.apiBaseUrl || '').replace(/\/$/, '');

// 构建嵌入 URL，将 Token 放在 Hash (#token=xxx) 中，不泄露给服务器日志
const embedUrl = computed(() => {
  const t = encodeURIComponent(token.value || '');
  return `${API_BASE}/embed/autorun#token=${t}`;
});

const startLoadTimeout = () => {
  if (loadTimeout) clearTimeout(loadTimeout);
  loadTimeout = setTimeout(() => {
    if (pinging.value) {
      pinging.value = false;
      initError.value = '连接超时，请检查服务状态';
    }
  }, 12000);
};

const onFrameLoad = () => {
  if (loadTimeout) clearTimeout(loadTimeout);
  pinging.value = false;
  initError.value = null;
  syncToken();
};

const onFrameError = () => {
  if (loadTimeout) clearTimeout(loadTimeout);
  pinging.value = false;
  initError.value = '无法连接至自动任务服务';
};

const reloadFrame = () => {
  pinging.value = true;
  initError.value = null;
  startLoadTimeout();
  if (frameRef.value) {
    frameRef.value.src = embedUrl.value;
  }
};

const syncToken = () => {
  if (frameRef.value?.contentWindow && token.value) {
    frameRef.value.contentWindow.postMessage(
      { type: 'BYERUN_SET_TOKEN', token: token.value },
      '*'
    );
  }
};

const handleMessage = (e) => {
  if (e.data && e.data.type === 'AUTORUN_SAVED') {
    emit('saved');
  }
  if (e.data && e.data.type === 'AUTORUN_CLOSE') {
    close();
  }
};

watch(
  () => ({ visible: props.visible, inline: props.inline }),
  (current) => {
    if (current.visible || current.inline) {
      pinging.value = true;
      initError.value = null;
      startLoadTimeout();
    }
  },
  { immediate: true },
);

onMounted(() => {
  window.addEventListener('message', handleMessage);
});

onUnmounted(() => {
  if (loadTimeout) clearTimeout(loadTimeout);
  window.removeEventListener('message', handleMessage);
});

const close = () => {
  emit('update:visible', false);
};

const handleWrapperClick = () => {
  if (!props.inline) {
    close();
  }
};

const ui = computed(() =>
  props.inline
    ? {
        wrapper: 'w-full h-full flex-1 flex flex-col',
        panel: 'relative w-full h-full flex-1 flex flex-col theme-card rounded-none overflow-hidden min-h-[500px]',
        feedback: 'py-16 flex flex-col items-center justify-center space-y-4 flex-1 min-h-[300px]',
      }
    : {
        wrapper: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md',
        panel:
          'relative w-full h-full max-w-[540px] theme-card rounded-none overflow-hidden shadow-2xl transition-all min-h-[360px] flex flex-col flex-1',
        feedback: 'py-20 flex flex-col items-center justify-center space-y-4 flex-1 min-h-[360px]',
      },
);
</script>

<style scoped>
.auto-config-close {
  color: var(--text-tertiary, #a1a1aa);
  background: rgba(255, 255, 255, 0.05);
}

.auto-config-close:hover {
  color: var(--text-primary, #ffffff);
  background: rgba(255, 255, 255, 0.15);
}
</style>
