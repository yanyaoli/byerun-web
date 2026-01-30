<template>
  <div>
    <header
      class="fixed left-0 right-0 top-2 h-11 z-[998] transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
    >
      <div
        class="flex items-center h-full bg-white/10 backdrop-blur-[16px] border border-white/50 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] relative max-w-[480px] mx-auto w-[calc(100%_-_24px)]"
      >
        <!-- Logo -->
        <div class="flex flex-row items-center">
          <img
            src="/logo.png"
            alt="App Logo"
            class="inline-block h-6 w-auto brightness-20 opacity-70 hover:brightness-10 hover:opacity-90 ml-4"
          />
        </div>
        <!-- Logout Button -->
        <button
          class="inline-flex items-center justify-center h-6 w-6 p-0.5 text-[rgba(60,60,67,0.8)] rounded-full font-semibold transition-all duration-150 border-none outline-none shadow-none hover:bg-red-100 hover:text-red-700 ml-auto mr-4"
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
import { ref, getCurrentInstance } from 'vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

const emit = defineEmits(['logout']);

const confirmDialogRef = ref(null);

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
    // 如果父组件监听了 logout，则触发事件，否则执行默认退出（清理 localStorage 并刷新）
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

<style scoped></style>
