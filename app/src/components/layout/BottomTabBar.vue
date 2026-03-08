<template>
  <nav
    class="fixed left-0 right-0 bottom-4 h-16 z-[998] transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
  >
    <div
      class="flex items-center h-full bg-white/10 backdrop-blur-[16px] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] relative max-w-[480px] mx-auto w-[calc(100%_-_24px)]"
    >
      <button
        v-for="item in tabs"
        :key="item.key"
        :class="[
          'relative flex flex-col items-center justify-center bg-none border-0 cursor-pointer rounded-full transition-all duration-[300ms] outline-none flex-1 h-full',
          active === item.key ? 'text-black' : 'text-[rgba(60,60,67,0.8)]',
        ]"
        @click="handleClick(item)"
      >
        <div
          v-if="active === item.key"
          class="absolute w-12 h-12 rounded-xl bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] pointer-events-none"
        ></div>
        <div class="flex items-center justify-center w-6 h-6 z-10">
          <i :class="item.icon" class="text-[20px]"></i>
        </div>
        <div class="text-[10px] mt-0.5 text-center z-10">{{ item.label }}</div>
      </button>
    </div>
  </nav>
</template>

<script setup>
const emit = defineEmits(['update:active', 'switch']);
const props = defineProps({
  active: { type: String, default: 'submit' },
  tabs: {
    type: Array,
    default: () => [
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
