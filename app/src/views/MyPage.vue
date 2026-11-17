<template>
  <div class="w-full max-w-3xl mx-auto py-2 px-1 space-y-3">
    <!-- 系统设置卡片入口 -->
    <Card
      class="p-3.5 rounded-2xl border border-[var(--border)] shadow-xs cursor-pointer hover:border-[var(--brand)] transition-all bg-[var(--surface)]"
      @click="goToSettings"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center">
            <i class="ri-settings-3-line text-base"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-[var(--text)]">系统设置</div>
            <div class="text-[11px] text-[var(--muted)]">外观主题切换 · 服务器源配置</div>
          </div>
        </div>
        <div class="flex items-center gap-1 text-xs text-[var(--muted)]">
          <span>管理</span>
          <i class="ri-arrow-right-s-line text-base"></i>
        </div>
      </div>
    </Card>

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
