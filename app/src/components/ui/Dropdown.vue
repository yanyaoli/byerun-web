<template>
  <div class="relative inline-block" ref="dropdownRef">
    <!-- 触发器插槽 -->
    <div
      role="button"
      tabindex="0"
      class="outline-none inline-flex items-center cursor-pointer"
      :aria-expanded="isOpen"
      @click="toggle"
      @keydown.enter="toggle"
      @keydown.space.prevent="toggle"
    >
      <slot name="trigger" :is-open="isOpen" />
    </div>

    <!-- 遮罩层：点击外部空白处收起 -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[1001] bg-transparent cursor-default"
      @click="close"
    ></div>

    <!-- 浮动下拉面板 -->
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        :class="[
          'absolute top-full mt-2 theme-card-strong shadow-2xl p-2 z-[1002] border border-[var(--card-border)] rounded-2xl',
          placementClass,
          widthClass,
        ]"
        @click.stop
      >
        <slot :close="close" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

export type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'bottom';

interface Props {
  modelValue?: boolean;
  placement?: DropdownPlacement;
  width?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  placement: 'bottom-end',
  width: 'w-48',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'open'): void;
  (e: 'close'): void;
}>();

const internalOpen = ref(false);

const isOpen = computed({
  get: () => (props.modelValue !== undefined ? props.modelValue : internalOpen.value),
  set: (val: boolean) => {
    if (props.modelValue !== undefined) {
      emit('update:modelValue', val);
    } else {
      internalOpen.value = val;
    }
    if (val) emit('open');
    else emit('close');
  },
});

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const close = () => {
  isOpen.value = false;
};

const open = () => {
  isOpen.value = true;
};

const placementClass = computed(() => {
  switch (props.placement) {
    case 'bottom-start':
      return 'left-0 origin-top-left';
    case 'bottom':
      return 'left-1/2 -translate-x-1/2 origin-top';
    case 'bottom-end':
    default:
      return 'right-0 origin-top-right';
  }
});

const widthClass = computed(() => props.width || 'w-48');

defineExpose({
  open,
  close,
  toggle,
  isOpen,
});
</script>
