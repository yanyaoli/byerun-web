<template>
  <div class="w-full max-w-3xl mx-auto py-2 px-1 space-y-3">
    <section class="theme-card rounded-2xl px-5 py-4">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="h-11 w-11 rounded-full theme-card-soft theme-text-tertiary flex items-center justify-center"
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
