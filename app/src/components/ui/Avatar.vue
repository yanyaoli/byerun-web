<template>
  <div
    :class="[
      'inline-flex items-center justify-center select-none overflow-hidden shrink-0 transition-transform active:scale-95 leading-none',
      sizeClasses[size],
      radiusClasses[radius],
      (isBordered || bordered) ? 'border border-[var(--border)]' : '',
      variant === 'transparent' ? 'bg-transparent' : (isBordered || bordered ? 'bg-transparent' : 'bg-[var(--surface-soft)]'),
    ]"
    v-bind="$attrs"
  >
    <img
      v-if="src && !imgError"
      :src="src"
      :alt="alt || name || 'avatar'"
      class="w-full h-full object-cover"
      @error="imgError = true"
    />
    <span
      v-else
      class="font-semibold text-center select-none theme-text-primary"
      :class="textSizeClasses[size]"
    >
      {{ displayChar }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

interface Props {
  src?: string;
  name?: string;
  text?: string;
  alt?: string;
  size?: AvatarSize;
  radius?: AvatarRadius;
  bordered?: boolean;
  isBordered?: boolean;
  variant?: 'solid' | 'bordered' | 'transparent';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
  radius: 'full',
  bordered: true,
  isBordered: false,
  variant: 'transparent',
});

const imgError = ref(false);

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
};

const textSizeClasses: Record<AvatarSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const radiusClasses: Record<AvatarRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-xl',
  full: 'rounded-full',
};

const displayChar = computed(() => {
  if (props.text) return props.text;
  if (props.name && props.name.trim()) {
    return Array.from(props.name.trim())[0];
  }
  return '同';
});
</script>
