<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[10000] grid place-items-center p-4 sm:p-40 theme-overlay"
      >
        <div
          class="theme-card w-full max-w-[300px] max-h-[90vh] overflow-auto rounded-2xl shadow-2xl confirm-dialog-shadow overflow-hidden p-6"
        >
          <h3 class="text-base font-bold theme-text-primary mb-2">{{ title }}</h3>
          <p class="text-sm theme-text-secondary mb-6 leading-relaxed">{{ message }}</p>

          <div class="flex gap-3">
            <Button
              variant="light"
              color="default"
              class="flex-1"
              @click="cancel"
            >
              取消
            </Button>
            <Button
              variant="flat"
              color="danger"
              class="flex-1"
              @click="confirm"
            >
              确认
            </Button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import Button from './Button.vue';

const visible = ref(false);
const title = ref('确认操作');
const message = ref('您确定要执行此操作吗？');
let resolvePromise = null;

const show = (opts = {}) => {
  title.value = opts.title || '确认操作';
  message.value = opts.message || '您确定要执行此操作吗？';
  visible.value = true;
  return new Promise((resolve) => {
    resolvePromise = resolve;
  });
};

const confirm = () => {
  visible.value = false;
  if (resolvePromise) resolvePromise(true);
};

const cancel = () => {
  visible.value = false;
  if (resolvePromise) resolvePromise(false);
};

defineExpose({ show });
</script>

<style scoped>
.theme-overlay {
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.confirm-dialog-shadow {
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.26);
}
</style>
