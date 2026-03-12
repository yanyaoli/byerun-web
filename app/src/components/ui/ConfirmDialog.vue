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
        class="fixed inset-0 z-[10000] grid place-items-center p-40 backdrop-blur-sm"
      >
        <div
          class="bg-stone-900 w-full max-w-[300px] max-h-[90vh] overflow-auto rounded-[1.5rem] shadow-2xl overflow-hidden p-6"
        >
          <h3 class="text-base font-bold text-gray-300 mb-2">{{ title }}</h3>
          <p class="text-sm text-gray-400 mb-6 leading-relaxed">{{ message }}</p>

          <div class="flex gap-3">
            <button
              @click="confirm"
              class="flex-1 py-2.5 text-sm font-bold text-gray-400 active:scale-95 transition-all"
            >
              确认
            </button>
            <button
              @click="cancel"
              class="flex-1 py-2.5 rounded-full text-sm font-bold bg-stone-800 text-gray-300 active:scale-95 transition-all"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';

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
