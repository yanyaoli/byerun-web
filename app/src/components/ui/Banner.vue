<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="-translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-full opacity-0"
    @after-enter="updateHeight"
    @after-leave="updateHeight"
  >
    <div
      v-if="isVisible"
      ref="bannerRef"
      :class="[
        fixed ? 'fixed left-0 right-0 z-[999] w-full transition-all duration-300' : 'relative w-full',
      ]"
      :style="fixed ? { top: typeof topOffset === 'number' ? `${topOffset}px` : topOffset } : {}"
    >
      <div
        :class="[
          'w-full border-b backdrop-blur-md shadow-xs transition-colors',
          themeClasses.container,
        ]"
      >
        <div class="max-w-[600px] mx-auto px-4 py-2 flex items-center justify-between gap-3 min-h-[38px] box-border">
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <i :class="['shrink-0 text-sm', customIcon || themeClasses.icon]"></i>
            <div
              :class="[
                'text-xs font-medium leading-relaxed break-words line-clamp-2 sm:line-clamp-none flex-1 min-w-0 select-text',
                themeClasses.text,
              ]"
            >
              <slot>{{ content }}</slot>
            </div>
          </div>
          <button
            v-if="closable"
            type="button"
            @click="handleClose"
            class="shrink-0 p-1 -mr-1 rounded-md opacity-70 hover:opacity-100 transition-opacity cursor-pointer border-none bg-transparent"
            :class="themeClasses.closeBtn"
            title="关闭横幅"
          >
            <i class="ri-close-line text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

export type BannerType = 'info' | 'success' | 'warning' | 'danger' | 'error';

interface Props {
  show?: boolean;
  type?: BannerType;
  content?: string;
  closable?: boolean;
  fixed?: boolean;
  topOffset?: number | string;
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  type: 'info',
  content: '',
  closable: true,
  fixed: true,
  topOffset: 44,
  icon: '',
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:show', val: boolean): void;
}>();

const bannerRef = ref<HTMLElement | null>(null);

const isVisible = computed(() => props.show);
const customIcon = computed(() => props.icon);

const themes: Record<string, { container: string; icon: string; text: string; closeBtn: string }> = {
  info: {
    container: 'bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/20 text-blue-700 dark:text-blue-300',
    icon: 'ri-information-line text-blue-600 dark:text-blue-400',
    text: 'text-blue-900 dark:text-blue-100',
    closeBtn: 'text-blue-700 dark:text-blue-300 hover:bg-blue-500/10',
  },
  warning: {
    container: 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/20 text-amber-700 dark:text-amber-300',
    icon: 'ri-alert-line text-amber-600 dark:text-amber-400',
    text: 'text-amber-900 dark:text-amber-100',
    closeBtn: 'text-amber-700 dark:text-amber-300 hover:bg-amber-500/10',
  },
  error: {
    container: 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/20 text-rose-700 dark:text-rose-300',
    icon: 'ri-error-warning-line text-rose-600 dark:text-rose-400',
    text: 'text-rose-900 dark:text-rose-100',
    closeBtn: 'text-rose-700 dark:text-rose-300 hover:bg-rose-500/10',
  },
  danger: {
    container: 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/20 text-rose-700 dark:text-rose-300',
    icon: 'ri-error-warning-line text-rose-600 dark:text-rose-400',
    text: 'text-rose-900 dark:text-rose-100',
    closeBtn: 'text-rose-700 dark:text-rose-300 hover:bg-rose-500/10',
  },
  success: {
    container: 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    icon: 'ri-checkbox-circle-line text-emerald-600 dark:text-emerald-400',
    text: 'text-emerald-900 dark:text-emerald-100',
    closeBtn: 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10',
  },
};

const themeClasses = computed(() => {
  return themes[props.type] || themes.info;
});

const setBannerHeight = (h: number) => {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty(
      '--notice-banner-height',
      `${Math.max(0, Math.round(h))}px`,
    );
  }
};

const updateHeight = () => {
  nextTick(() => {
    if (isVisible.value && bannerRef.value) {
      setBannerHeight(bannerRef.value.offsetHeight);
    } else {
      setBannerHeight(0);
    }
  });
};

const handleClose = () => {
  emit('close');
  emit('update:show', false);
};

watch(isVisible, (visible) => {
  if (visible) {
    updateHeight();
  } else {
    setBannerHeight(0);
  }
});

watch(() => props.content, () => {
  if (isVisible.value) {
    updateHeight();
  }
});

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (isVisible.value) {
    updateHeight();
  }
  if (typeof ResizeObserver !== 'undefined' && bannerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      if (isVisible.value && bannerRef.value) {
        setBannerHeight(bannerRef.value.offsetHeight);
      }
    });
    resizeObserver.observe(bannerRef.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  setBannerHeight(0);
});
</script>
