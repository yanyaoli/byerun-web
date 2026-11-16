<template>
  <button
    :type="type"
    :disabled="disabled || isLoading"
    :class="[
      'relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-medium subpixel-antialiased overflow-hidden tap-highlight-transparent outline-none transition-all duration-200 active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
      sizeClasses[size],
      radiusClasses[radius],
      variantClasses[variant]?.[color] || variantClasses.solid[color],
      fullWidth ? 'w-full' : '',
    ]"
    v-bind="$attrs"
  >
    <i v-if="isLoading" class="ri-loader-4-line animate-spin mr-1.5 shrink-0 text-[1.1em]"></i>
    <slot name="startContent" />
    <slot />
    <slot name="endContent" />
  </button>
</template>

<script setup lang="ts">
export type ButtonColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
export type ButtonVariant = 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

interface Props {
  color?: ButtonColor;
  variant?: ButtonVariant;
  size?: ButtonSize;
  radius?: ButtonRadius;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  variant: 'solid',
  size: 'md',
  radius: 'full',
  type: 'button',
  disabled: false,
  isLoading: false,
  fullWidth: false,
});

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 h-8 text-xs gap-1.5',
  md: 'px-4 h-10 text-sm gap-2',
  lg: 'px-6 h-12 text-base gap-2.5',
};

const radiusClasses: Record<ButtonRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
};

const variantClasses: Record<ButtonVariant, Record<ButtonColor, string>> = {
  solid: {
    default: 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-700',
    primary: 'bg-[var(--color-accent,#2563eb)] dark:bg-[var(--color-accent-dark,#f97316)] text-white hover:brightness-110 active:brightness-95 shadow-sm',
    secondary: 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800',
  },
  bordered: {
    default: 'border border-zinc-300 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800',
    primary: 'border border-[var(--color-accent,#2563eb)] dark:border-[var(--color-accent-dark,#f97316)] text-[var(--color-accent,#2563eb)] dark:text-[var(--color-accent-dark,#f97316)] hover:bg-[var(--color-accent-soft)]',
    secondary: 'border border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40',
    success: 'border border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40',
    warning: 'border border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40',
    danger: 'border border-rose-600 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40',
  },
  light: {
    default: 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800',
    primary: 'text-[var(--color-accent,#2563eb)] dark:text-[var(--color-accent-dark,#f97316)] hover:bg-[var(--color-accent-soft)]',
    secondary: 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40',
    success: 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40',
    warning: 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40',
    danger: 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40',
  },
  flat: {
    default: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700/60',
    primary: 'bg-[var(--color-accent-soft)] text-[var(--color-accent,#2563eb)] dark:text-[var(--color-accent-dark,#f97316)] hover:brightness-95',
    secondary: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50',
    success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50',
    warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50',
    danger: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50',
  },
  faded: {
    default: 'border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200',
    primary: 'border border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)] text-[var(--color-accent,#2563eb)] dark:text-[var(--color-accent-dark,#f97316)]',
    secondary: 'border border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-900 dark:bg-purple-950/30 dark:text-purple-400',
    success: 'border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400',
    warning: 'border border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400',
    danger: 'border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400',
  },
  shadow: {
    default: 'bg-zinc-200 text-zinc-900 shadow-lg shadow-zinc-500/20',
    primary: 'bg-[var(--color-accent,#2563eb)] dark:bg-[var(--color-accent-dark,#f97316)] text-white shadow-lg shadow-[var(--color-accent,#2563eb)]/30 hover:brightness-110',
    secondary: 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 hover:bg-purple-700',
    success: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700',
    warning: 'bg-amber-50 text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600',
    danger: 'bg-rose-600 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-700',
  },
  ghost: {
    default: 'border border-zinc-300 text-zinc-800 dark:border-zinc-700 dark:text-zinc-200 hover:bg-zinc-800 hover:text-white',
    primary: 'border border-[var(--color-accent,#2563eb)] dark:border-[var(--color-accent-dark,#f97316)] text-[var(--color-accent,#2563eb)] dark:text-[var(--color-accent-dark,#f97316)] hover:bg-[var(--color-accent)] hover:text-white',
    secondary: 'border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white',
    success: 'border border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white',
    warning: 'border border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white',
    danger: 'border border-rose-600 text-rose-600 hover:bg-rose-600 hover:text-white',
  },
};
</script>
