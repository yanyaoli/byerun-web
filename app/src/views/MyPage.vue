<template>
  <div class="w-full max-w-3xl mx-auto py-2 px-1 space-y-3">
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
import { api, pingMeta } from '@/sdk/app';
import { Card } from '@/components/ui';
import MessageCenter from '@/components/MessageCenter.vue';
import ProjectInfo from '@/components/ProjectInfo.vue';

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
