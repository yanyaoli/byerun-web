<template>
  <div class="w-full max-w-3xl mx-auto py-2 px-1 space-y-3">
    <section class="theme-card rounded-2xl px-5 py-4">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="h-11 w-11 rounded-full theme-card-soft flex items-center justify-center"
          >
            <i class="ri-user-3-line text-lg"></i>
          </div>
          <div class="min-w-0">
            <p class="text-base font-bold theme-text-primary truncate">{{ displayName }}</p>
            <p class="text-xs theme-text-tertiary truncate">{{ registerCode }}</p>
          </div>
        </div>
        <button
          type="button"
          @click="handleLogout"
          class="shrink-0 text-sm cursor-pointer inline-flex items-center gap-2 theme-danger-bg theme-danger-border theme-danger px-5 py-2 rounded-full font-semibold border-none transition-colors duration-200"
        >
          <span>登出</span>
        </button>
      </div>
    </section>

    <MessageCenter :messages="messages" />

    <SponsorCard
      v-if="sponsorCardVisible"
      :sponsor="sponsor"
      :domain="domain"
      :community="community"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useDataStore } from '@/composables/useDataStore';
import { useChatStore } from '@/composables/useChatStore';
import { pingMeta } from '@/sdk/autorun';
import { api } from '@/sdk/app';
import SponsorCard from '@/components/SponsorCard.vue';
import MessageCenter from '@/components/ui/MessageCenter.vue';

const { userInfo, clearAllData } = useDataStore();
const { clearChatData } = useChatStore();

const messages = ref([]);

const displayName = computed(() => userInfo.value?.studentName ?? '');
const registerCode = computed(() => userInfo.value?.registerCode ?? '');
const sponsor = computed(() => pingMeta.value?.sponsor);
const domain = computed(() => pingMeta.value?.domain);
const community = computed(() => pingMeta.value?.community ?? null);
const sponsorCardVisible = computed(() => Boolean(sponsor.value && domain.value));

async function loadMessages() {
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
  }
}

const handleLogout = () => {
  try {
    clearAllData();
    clearChatData();
  } catch (e) {}
  window.location.reload();
};

onMounted(loadMessages);
</script>
