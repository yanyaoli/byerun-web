<template>
  <div class="space-y-4">
    <div
      v-for="idx in count"
      :key="idx"
      class="rounded-xl overflow-hidden bg-transparent border border-[var(--card-border)] p-0 flex flex-col"
    >
      <div class="flex justify-between items-center px-4 py-3 bg-transparent border-b border-[var(--card-divider)]">
        <div class="flex items-center gap-2">
          <SkeletonBox width="8px" height="8px" radius="9999px" />
          <SkeletonBox width="110px" height="14px" radius="4px" />
        </div>
        <SkeletonBox width="52px" height="18px" radius="6px" />
      </div>
      <div class="px-4 py-2.5">
        <div class="flex gap-2">
          <div class="flex-1 rounded-lg px-3 py-2 bg-[var(--card-soft-bg)] flex items-center justify-between">
            <SkeletonBox width="24px" height="12px" radius="3px" />
            <SkeletonBox width="42px" height="16px" radius="4px" />
          </div>
          <div class="flex-1 rounded-lg px-3 py-2 bg-[var(--card-soft-bg)] flex items-center justify-between">
            <SkeletonBox width="24px" height="12px" radius="3px" />
            <SkeletonBox width="36px" height="16px" radius="4px" />
          </div>
          <div class="flex-1 rounded-lg px-3 py-2 bg-[var(--card-soft-bg)] flex items-center justify-between">
            <SkeletonBox width="24px" height="12px" radius="3px" />
            <SkeletonBox width="46px" height="16px" radius="4px" />
          </div>
        </div>
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
    count: 3,
  },
);
</script>
