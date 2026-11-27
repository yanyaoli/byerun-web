<template>
  <teleport to="body">
    <transition name="drawer" :duration="{ enter: 320, leave: 240 }">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex flex-col justify-end"
        @click="close"
      >
        <div class="absolute inset-0 bg-black/35 backdrop-blur-[2px] drawer-overlay"></div>
        <div
          class="relative w-full max-w-[600px] mx-auto"
          :class="isBottomSheet ? 'px-4' : 'h-full'"
        >
          <div
            class="relative flex flex-col drawer-panel w-full shadow-2xl overflow-hidden"
            :class="isBottomSheet ? 'rounded-t-2xl' : 'h-full rounded-none'"
            :style="{
              background: 'var(--card-bg-strong)',
              borderTop: '1px solid var(--card-border)',
              ...(isBottomSheet ? { height: maxHeight, maxHeight } : {}),
            }"
            @click.stop
            @touchstart="handleTouchStart"
            @touchend="handleTouchEnd"
          >
            <div v-if="isBottomSheet" class="flex justify-center pt-2 pb-1 shrink-0">
              <span class="w-9 h-1 rounded-full bg-[var(--card-border)]"></span>
            </div>
            <div
              class="flex items-center justify-between px-4 shrink-0 border-b border-[var(--card-border)]"
              :style="
                isBottomSheet
                  ? {
                      height: '44px',
                      background: 'var(--bg-soft, rgba(255,255,255,0.02))',
                    }
                  : {
                      paddingTop: 'var(--sat, env(safe-area-inset-top, 0px))',
                      height: 'calc(var(--sat, env(safe-area-inset-top, 0px)) + 48px)',
                      background: 'var(--bg-soft, rgba(255,255,255,0.02))',
                    }
              "
            >
              <div class="flex items-center gap-2 min-w-0">
                <button
                  v-if="!isBottomSheet"
                  type="button"
                  @click="close"
                  class="w-8 h-8 rounded-full flex items-center justify-center theme-text-secondary hover:theme-text-primary hover:bg-[var(--action-hover-bg)] active:scale-95 transition-all cursor-pointer drawer-back-btn"
                  title="返回"
                  aria-label="返回"
                >
                  <i class="ri-arrow-left-line text-base"></i>
                </button>
                <span class="text-sm font-bold theme-text-primary truncate">{{ title }}</span>
              </div>
              <button
                type="button"
                @click="close"
                class="w-8 h-8 rounded-full flex items-center justify-center theme-text-tertiary hover:theme-text-primary hover:bg-[var(--action-hover-bg)] active:scale-95 transition-all cursor-pointer drawer-close-btn"
                title="关闭"
                aria-label="关闭"
              >
                <i class="ri-close-line text-lg"></i>
              </button>
            </div>
            <div class="flex-1 overflow-y-auto overflow-x-hidden pb-6 flex flex-col w-full max-w-full box-border">
              <slot />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue';
import { Button } from 'heroui-vue';
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  maxHeight: { type: String, default: '100vh' },
});

const isBottomSheet = computed(() => props.maxHeight !== '100vh' && props.maxHeight !== '100%');

const emit = defineEmits(['update:modelValue']);

function close() {
  emit('update:modelValue', false);
}

let touchStartX = 0;
let touchStartY = 0;
let isEdgeTouch = false;

function handleTouchStart(e) {
  if (!e.touches || e.touches.length !== 1) return;
  const t = e.touches[0];
  if (t.clientX <= 40) {
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    isEdgeTouch = true;
  } else {
    isEdgeTouch = false;
  }
}

function handleTouchEnd(e) {
  if (!isEdgeTouch || !e.changedTouches || e.changedTouches.length === 0) return;
  const t = e.changedTouches[0];
  const deltaX = t.clientX - touchStartX;
  const deltaY = t.clientY - touchStartY;
  isEdgeTouch = false;

  if (deltaX > 60 && deltaX > Math.abs(deltaY) * 1.3) {
    close();
  }
}
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.24s ease;
}

.drawer-enter-active .drawer-overlay,
.drawer-leave-active .drawer-overlay {
  transition: opacity 0.24s ease;
}

.drawer-enter-active .drawer-panel {
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

.drawer-leave-active .drawer-panel {
  transition: transform 0.24s cubic-bezier(0.4, 0, 1, 1);
}

.drawer-enter-from .drawer-overlay,
.drawer-leave-to .drawer-overlay {
  opacity: 0;
}

.drawer-enter-from .drawer-panel,
.drawer-leave-to .drawer-panel {
  transform: translateY(100%);
}
</style>

<style>
.option-selected {
  background: rgba(37, 99, 235, 0.06);
}

.dark .option-selected {
  background: rgba(96, 165, 250, 0.08);
}

.option-dot {
  background: var(--card-divider);
}

.option-dot-selected {
  background: #2563eb;
}

.dark .option-dot-selected {
  background: #60a5fa;
}

.option-selected-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 36px;
  opacity: 0.1;
  pointer-events: none;
  color: #2563eb;
}

.dark .option-selected-icon {
  color: #60a5fa;
}
</style>
