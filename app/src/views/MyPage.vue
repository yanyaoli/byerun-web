<template>
  <div class="w-full max-w-3xl mx-auto py-2 px-1 space-y-3">
    <!-- 系统设置平铺入口 -->
    <div
      class="flex items-center justify-between px-4 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer shadow-2xs"
      @click="goToSettings"
    >
      <div class="flex items-center gap-3">
        <i class="ri-settings-3-line text-lg text-[var(--muted)]"></i>
        <div>
          <div class="text-sm font-medium text-[var(--text)]">系统设置</div>
          <div class="text-[11px] text-[var(--muted)]">外观主题 · 服务器源配置</div>
        </div>
      </div>
      <div class="flex items-center gap-1 text-xs text-[var(--muted)]">
        <i class="ri-arrow-right-s-line text-base text-[var(--muted)]/60"></i>
      </div>
    </div>

    <MessageCenter :messages="messages" :loading="loading" />

    <ProjectInfo
      :sponsor="sponsor"
      :domain="domain"
      :community="community"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api, pingMeta } from '@/sdk/app';
import { Card } from '@/components/ui';
import MessageCenter from '@/components/MessageCenter.vue';
import ProjectInfo from '@/components/ProjectInfo.vue';

const router = useRouter();
const goToSettings = () => {
  router.push({ name: 'settings' });
};
const messages = ref([]);
const loading = ref(true);

const sponsor = computed(() => pingMeta.value?.sponsor);
const domain = computed(() => pingMeta.value?.domain);
const community = computed(() => pingMeta.value?.community ?? null);

async function loadMessages() {
  loading.value = true;
  try {
    const [msgRes, remindRes] = await Promise.all([
      api.getStudentMessageList(1, 50),
      api.getStudentRemindList(1, 50),
    ]);
    const msgList = (msgRes?.data?.response || msgRes?.data || []);
    const remindList = (remindRes?.data?.response || remindRes?.data || []);
    const all = [...(Array.isArray(msgList) ? msgList : []), ...(Array.isArray(remindList) ? remindList : [])];
    all.sort((a, b) => String(b.createTime || '').localeCompare(String(a.createTime || '')));
    messages.value = all;
  } catch (e) {
    console.error('loadMessages failed:', e);
  } finally {
    loading.value = false;
  }
}

onMounted(loadMessages);
</script>
