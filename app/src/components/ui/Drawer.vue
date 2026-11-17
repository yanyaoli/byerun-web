<template>
  <teleport to="body">
    <transition name="drawer">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex flex-col justify-end"
        @click="close"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-md drawer-overlay"></div>
        <div
          class="relative flex flex-col drawer-panel w-full h-full max-w-[600px] mx-auto rounded-none shadow-2xl overflow-hidden"
          style="background: var(--card-bg-strong); border-top: 1px solid var(--card-border);"
          @click.stop
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
        >
          <div
            class="flex items-center justify-between px-4 shrink-0 border-b border-[var(--card-border)]"
            :style="{
              paddingTop: 'var(--sat, env(safe-area-inset-top, 0px))',
              height: 'calc(var(--sat, env(safe-area-inset-top, 0px)) + 48px)',
              background: 'var(--bg-soft, rgba(255,255,255,0.02))',
            }"
          >
            <div class="flex items-center gap-2 min-w-0">
              <button
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
    </transition>
  </teleport>
</template>

<script setup>
import { Button } from 'heroui-vue';
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  maxHeight: { type: String, default: '100vh' },
});

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

function beforeEnter(el) {
  el.style.opacity = '0';
  const panel = el.querySelector('.drawer-panel');
  const overlay = el.querySelector('.drawer-overlay');
  if (panel) panel.style.transform = 'translateY(100%)';
  if (overlay) overlay.style.opacity = '0';
}

function enter(el, done) {
  el.offsetHeight;
  el.style.opacity = '1';
  const panel = el.querySelector('.drawer-panel');
  const overlay = el.querySelector('.drawer-overlay');
  if (panel) panel.style.transform = 'translateY(0)';
  if (overlay) overlay.style.opacity = '1';
  setTimeout(done, 350);
}

function beforeLeave(el) {
  const panel = el.querySelector('.drawer-panel');
  const overlay = el.querySelector('.drawer-overlay');
  if (panel) panel.style.transform = 'translateY(100%)';
  if (overlay) overlay.style.opacity = '0';
  el.style.opacity = '0';
}

function leave(el, done) {
  setTimeout(done, 250);
}

function afterLeave(el) {
  el.style.opacity = '';
  const panel = el.querySelector('.drawer-panel');
  const overlay = el.querySelector('.drawer-overlay');
  if (panel) panel.style.transform = '';
  if (overlay) overlay.style.opacity = '';
}
</script>

<style scoped>
.drawer-overlay {
  transition: opacity 0.2s ease;
}

.drawer-panel {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
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
