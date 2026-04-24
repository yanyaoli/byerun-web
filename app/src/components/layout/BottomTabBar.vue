<template>
  <nav
    class="fixed left-0 right-0 bottom-1 z-[999] transition-all duration-300"
    :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }"
  >
    <div
      :class="[
        'flex items-center h-full backdrop-blur-2xl border rounded-full relative max-w-[600px] mx-auto w-[calc(100%_-_24px)] px-5 py-3 gap-2',
        'theme-card-strong',
        'liquid-glass-shell liquid-glass-tabbar',
      ]"
    >
      <button
        v-for="item in tabs"
        :key="item.key"
        type="button"
        :class="[
          'relative flex flex-col items-center justify-center cursor-pointer rounded-full transition-all duration-300 outline-none flex-1 h-12',
          active === item.key ? 'bottom-tab-active' : 'bottom-tab-inactive',
        ]"
        @click="handleClick(item)"
      >
        <div class="relative flex items-center justify-center w-6 h-6 z-10">
          <i :class="item.icon" class="text-[19px]"></i>
          <span
            v-if="item.key === 'chat' && chatUnread && active !== 'chat'"
            class="absolute -top-1 -right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 border border-white"
          ></span>
        </div>
        <div class="text-[10px] mt-0.5 text-center z-10">{{ item.label }}</div>
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
      { key: 'club', label: '俱乐部', icon: 'ri-basketball-line' },
      { key: 'records', label: '记录', icon: 'ri-task-line' },
      { key: 'submit', label: '管理', icon: 'ri-command-line' },
      { key: 'chat', label: '消息', icon: 'ri-message-3-line' },
      { key: 'my', label: '我的', icon: 'ri-user-smile-line' },
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
  color: var(--text-primary);
  background-color: var(--tab-action-bg);
}

.bottom-tab-inactive {
  color: var(--text-secondary);
}

.bottom-tab-inactive:hover {
  color: var(--text-primary);
  background-color: var(--action-hover-bg);
}
</style>
