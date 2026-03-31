<template>
  <div class="w-full max-w-3xl mx-auto py-2 px-1 space-y-3">
    <section class="rounded-2xl bg-white/5 border border-white/8 px-5 py-4">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="h-11 w-11 rounded-full bg-white/5 text-slate-500 flex items-center justify-center"
          >
            <i class="ri-user-3-line text-lg"></i>
          </div>
          <div class="min-w-0">
            <p class="text-base font-bold text-slate-400 truncate">{{ displayName }}</p>
            <p class="text-xs text-slate-500 truncate">{{ registerCode }}</p>
          </div>
        </div>
        <button
          type="button"
          @click="handleLogout"
          class="shrink-0 text-sm cursor-pointer inline-flex items-center gap-2 bg-white/5 text-gray-200/50 px-5 py-2 rounded-full font-semibold border-none transition-colors duration-200 hover:bg-red-100 hover:text-red-700"
        >
          <span>登出</span>
        </button>
      </div>
    </section>

    <SponsorCard
      v-if="sponsorCardVisible"
      :sponsor="sponsor"
      :domain="domain"
      :community="community"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useDataStore } from '@/composables/useDataStore';
import { useChatStore } from '@/composables/useChatStore';
import { pingMeta } from '@/sdk/autorun';
import SponsorCard from '@/components/SponsorCard.vue';

const { userInfo, clearAllData } = useDataStore();
const { clearChatData } = useChatStore();

const displayName = computed(() => userInfo.value?.studentName ?? '');
const registerCode = computed(() => userInfo.value?.registerCode ?? '');
const sponsor = computed(() => pingMeta.value?.sponsor);
const domain = computed(() => pingMeta.value?.domain);
const community = computed(() => pingMeta.value?.community ?? null);
const sponsorCardVisible = computed(() => Boolean(sponsor.value && domain.value));

const handleLogout = () => {
  try {
    clearAllData();
    clearChatData();
  } catch (e) {}
  window.location.reload();
};
</script>
