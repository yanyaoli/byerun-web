<template>
  <section class="rounded-xl p-4 bg-transparent border border-[var(--card-border)]">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold theme-text-primary">消息中心</span>
      </div>
      <SkeletonBox v-if="loading" width="90px" height="14px" radius="4px" />
      <span v-else class="text-xs theme-text-tertiary">共 {{ messages.length }} 条 · {{ unreadCount }} 条未读</span>
    </div>

    <!-- 加载骨架屏 -->
    <div v-if="loading" class="space-y-1">
      <div
        v-for="idx in 3"
        :key="`msg-skel-${idx}`"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-[3px] border-transparent bg-black/5 dark:bg-white/5"
      >
        <div class="flex-1 min-w-0 space-y-1.5">
          <div class="flex items-center gap-2">
            <SkeletonBox width="36px" height="16px" radius="9999px" />
            <SkeletonBox :width="idx === 1 ? '140px' : idx === 2 ? '170px' : '110px'" height="13px" radius="4px" />
          </div>
          <SkeletonBox :width="idx === 2 ? '65%' : '85%'" height="11px" radius="4px" />
          <SkeletonBox width="95px" height="10px" radius="4px" />
        </div>
        <SkeletonBox width="14px" height="14px" radius="4px" class="shrink-0" />
      </div>
    </div>

    <div v-else-if="messages.length === 0" class="text-xs text-center theme-text-tertiary py-6">
      暂无消息
    </div>
    <div v-else class="space-y-1" style="max-height: 195px; overflow-y: auto">
      <div v-for="msg in messages" :key="msg.pushId"
        class="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors hover:bg-[var(--action-hover-bg)]"
        :style="{ opacity: msg.readStatus === '1' ? 0.55 : 1, borderLeft: '3px solid ' + tagColor(msg.sendType) }"
        @click="openDetail(msg)">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-0.5">
            <span class="text-[10px] px-1.5 py-0.5 rounded-full shrink-0" :class="tagClass(msg.sendType)">{{
              tagLabel(msg.sendType) }}</span>
            <span class="text-xs font-semibold theme-text-primary truncate">{{ msg.pushTitle }}</span>
            <span v-if="msg.readStatus !== '1'" class="w-1.5 h-1.5 rounded-full shrink-0 ml-auto"
              style="background: #dc2626"></span>
          </div>
          <p class="text-[11px] theme-text-tertiary truncate">{{ msg.pushText }}</p>
          <p class="text-[10px] theme-text-tertiary mt-0.5 opacity-60">{{ msg.createTime }}</p>
        </div>
        <i class="ri-arrow-right-s-line text-base theme-text-tertiary shrink-0"></i>
      </div>
    </div>

    <Drawer v-model="detailVisible" title="消息详情">
      <div class="px-5 pb-4">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-[10px] px-1.5 py-0.5 rounded-full shrink-0" :class="tagClass(detailMsg?.sendType)">{{
            tagLabel(detailMsg?.sendType) }}</span>
          <span class="text-[10px] theme-text-tertiary">{{ detailMsg?.createTime }}</span>
        </div>
        <h3 class="text-sm font-bold theme-text-primary mb-2">{{ detailMsg?.pushTitle }}</h3>
        <p class="text-xs theme-text-secondary leading-relaxed" style="white-space: pre-line">{{ detailMsg?.pushText }}
        </p>
        <a v-if="detailMsg?.url" :href="detailMsg.url" target="_blank" rel="noopener noreferrer"
          class="inline-flex items-center gap-1 mt-3 text-xs font-medium theme-link">
          <i class="ri-external-link-line"></i>
          <span>查看详情</span>
        </a>
      </div>
    </Drawer>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { SkeletonBox } from 'skullet/vue';
import { api } from '@/sdk/app';
import Drawer from '@/components/ui/Drawer.vue';

const props = defineProps({
  messages: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(['read']);

const detailVisible = ref(false);
const detailMsg = ref(null);

const unreadCount = computed(() => props.messages.filter((m) => m.readStatus !== '1').length);

function tagClass(sendType) {
  const map = {
    '1': 'text-blue-600 bg-blue-500/10',
    '2': 'text-emerald-600 bg-emerald-500/10',
    '3': 'text-amber-600 bg-amber-500/10',
    '4': 'text-rose-600 bg-rose-500/10',
  };
  return map[sendType] || 'theme-card-soft theme-text-tertiary';
}

function tagColor(sendType) {
  const map = {
    '1': '#2563eb',
    '2': '#059669',
    '3': '#d97706',
    '4': '#e11d48',
  };
  return map[sendType] || 'var(--card-border)';
}

function tagLabel(sendType) {
  const map = {
    '1': '系统',
    '2': '活动',
    '3': '提醒',
    '4': '通知',
  };
  return map[sendType] || sendType;
}

async function openDetail(msg) {
  detailMsg.value = msg;
  detailVisible.value = true;

  if (msg.readStatus !== '1') {
    try {
      if (msg.sendType) {
        await api.readRemind(msg.pushId, msg.sendType);
      } else {
        await api.readMessage(msg.pushId);
      }
      msg.readStatus = '1';
      emit('read', msg.pushId);
    } catch (e) {
      console.error('markAsRead failed:', e);
    }
  }
}
</script>
