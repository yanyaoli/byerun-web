<template>
  <div class="space-y-3">
    <div
      v-for="idx in count"
      :key="idx"
      class="rounded-xl p-4 bg-transparent border border-[var(--card-border)] space-y-3"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0 space-y-1.5">
          <SkeletonBox width="55%" height="16px" radius="4px" />
          <SkeletonBox width="75%" height="12px" radius="4px" />
        </div>
        <SkeletonBox width="52px" height="20px" radius="6px" />
      </div>

      <div class="flex items-center justify-between gap-2 pt-1">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <SkeletonBox width="12px" height="12px" radius="9999px" />
            <SkeletonBox width="64px" height="12px" radius="4px" />
          </div>
          <div class="flex items-center gap-1.5">
            <SkeletonBox width="12px" height="12px" radius="9999px" />
            <SkeletonBox width="48px" height="12px" radius="4px" />
          </div>
        </div>
        <SkeletonBox width="60px" height="28px" radius="8px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SkeletonBox } from 'skullet/vue';

withDefaults(
  defineProps<{
    count?: number;
  }>(),
  {
    count: 4,
  },
);
</script>
