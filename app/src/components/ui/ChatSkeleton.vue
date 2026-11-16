<template>
  <div class="space-y-6 w-full py-2">
    <div
      v-for="(item, idx) in skeletonItems"
      :key="idx"
      class="flex items-end gap-2 w-full"
      :class="item.isMe ? 'flex-row-reverse' : 'flex-row'"
    >
      <!-- 对方头像骨架 -->
      <div v-if="!item.isMe" class="w-8 h-8 shrink-0 mb-0.5">
        <SkeletonBox width="32px" height="32px" radius="9999px" />
      </div>

      <!-- 消息主体 -->
      <div
        class="flex flex-col gap-1.5"
        :class="item.isMe ? 'items-end' : 'items-start'"
      >
        <!-- 对方昵称骨架 -->
        <SkeletonBox
          v-if="!item.isMe"
          :width="item.nameWidth"
          height="10px"
          radius="4px"
          class="opacity-75"
        />

        <!-- 消息气泡骨架 (使用标准 Skullet 高光流光) -->
        <div
          class="p-3 rounded-2xl min-h-[40px] flex flex-col gap-2 border border-[var(--card-border)] backdrop-blur-md"
          :class="[
            item.isMe
              ? 'rounded-br-sm bg-[var(--color-accent-soft)]'
              : 'rounded-bl-sm bg-[var(--surface-soft)]',
          ]"
        >
          <SkeletonBox :width="item.width1" height="13px" radius="4px" />
          <SkeletonBox
            v-if="item.hasLine2"
            :width="item.width2"
            height="13px"
            radius="4px"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SkeletonBox } from 'skullet/vue';

interface SkeletonItem {
  isMe: boolean;
  nameWidth: string;
  width1: string;
  width2?: string;
  hasLine2: boolean;
}

const skeletonItems: SkeletonItem[] = [
  { isMe: false, nameWidth: '55px', width1: '140px', width2: '90px', hasLine2: true },
  { isMe: true, nameWidth: '0px', width1: '110px', hasLine2: false },
  { isMe: false, nameWidth: '70px', width1: '180px', width2: '130px', hasLine2: true },
  { isMe: false, nameWidth: '45px', width1: '95px', hasLine2: false },
  { isMe: true, nameWidth: '0px', width1: '160px', width2: '100px', hasLine2: true },
  { isMe: false, nameWidth: '60px', width1: '135px', hasLine2: false },
];
</script>
