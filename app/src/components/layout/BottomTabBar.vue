<template>
  <nav
    class="fixed left-0 right-0 bottom-0 z-[999] w-full max-w-[600px] mx-auto transition-all duration-300"
    :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }"
  >
    <div class="flex items-center h-full w-full px-4 py-2 gap-1 bg-[var(--card-bg-strong)]/70 backdrop-blur-xl border-t border-[var(--card-border)]">
      <button
        v-for="item in tabs"
        :key="item.key"
        type="button"
        :class="[
          'relative flex flex-col items-center justify-center cursor-pointer rounded-lg transition-all duration-300 outline-none flex-1 h-12',
          active === item.key ? 'bottom-tab-active' : 'bottom-tab-inactive',
        ]"
        @click="handleClick(item)"
      >
        <div class="relative flex items-center justify-center w-6 h-6 z-10">
          <i :class="item.icon" class="text-[22px]"></i>
          <span
            v-if="item.key === 'chat' && chatUnread && active !== 'chat'"
            class="absolute -top-1 -right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 border border-white"
          ></span>
        </div>
        <div class="text-[9px] mt-0.5 text-center z-10">{{ item.label }}</div>
      </button>
    </div>
  </nav>
</template>

<script setup>
const emit = defineEmits(['update:active', 'switch']);

defineProps({
  active: { type: String, default: 'submit' },
  chatUnread: { type: Boolean, default: false },
  isDarkMode: { type: Boolean, default: false },
  tabs: {
    type: Array,
    default: () => [
      { key: 'submit', label: '校园跑', icon: 'ri-command-line' },
      { key: 'club', label: '俱乐部', icon: 'ri-basketball-line' },
      { key: 'chat', label: '消息', icon: 'ri-message-3-line' },
      { key: 'my', label: '我的', icon: 'ri-user-3-fill' },
    ],
  },
});

function handleClick(item) {
  emit('update:active', item.key);
  emit('switch', item.key);
}
</script>

<style scoped>
.bottom-tab-active {
  color: #2563eb;
}

:global(.dark) .bottom-tab-active {
  color: #60a5fa;
}

.bottom-tab-inactive {
  color: var(--text-secondary);
}

.bottom-tab-inactive:hover {
  color: var(--text-primary);
  background-color: var(--action-hover-bg);
}
</style>
