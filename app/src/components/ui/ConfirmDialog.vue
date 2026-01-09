<template>
  <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
    <div v-if="visible"
      class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
      <div
        class="bg-stone-950 w-full max-w-[300px] rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden p-8">
        <h3 class="text-[13px] font-black uppercase tracking-[0.2em] text-stone-200 mb-2">{{ title }}</h3>
        <p class="text-[11px] font-bold text-stone-600 uppercase tracking-widest mb-8 leading-relaxed">{{ message }}</p>

        <div class="flex gap-3">
          <button @click="confirm"
            class="flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-stone-900 text-stone-500 hover:text-stone-300 active:scale-95 transition-all">
            确认
          </button>
          <button @click="cancel"
            class="flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-stone-500 text-stone-950 active:scale-95 transition-all">
            取消
          </button>
        </div>
      </div>
    </div>
  </transition>
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
