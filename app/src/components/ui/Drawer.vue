<template>
  <teleport to="body">
    <transition name="drawer">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex flex-col justify-end"
        @click="close"
      >
        <div class="absolute inset-0 bg-black/20 backdrop-blur-sm drawer-overlay"></div>
        <div
          class="relative rounded-t-3xl shadow-2xl flex flex-col drawer-panel"
          :style="{ maxHeight: maxHeight }"
          style="background: var(--card-bg-strong); border-top: 1px solid var(--card-border)"
          @click.stop
        >
          <div class="flex justify-center pt-2 pb-0 shrink-0">
            <div class="w-8 h-1 rounded-full" style="background: var(--card-divider)"></div>
          </div>
          <div class="flex items-center justify-between px-5 py-3 shrink-0">
            <span class="text-base font-bold theme-text-primary">{{ title }}</span>
            <button
              type="button"
              class="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--action-hover-bg)]"
              @click="close"
            >
              <i class="ri-close-line text-lg theme-text-tertiary"></i>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto pb-4">
            <slot />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  maxHeight: { type: String, default: '75vh' },
});

const emit = defineEmits(['update:modelValue']);

function close() {
  emit('update:modelValue', false);
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
