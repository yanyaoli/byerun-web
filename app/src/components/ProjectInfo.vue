<template>
  <div class="space-y-3">
    <a
      :href="githubUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-3 rounded-lg px-4 py-3 theme-card-soft transition-colors hover:opacity-80"
    >
      <span class="h-9 w-9 rounded-lg flex items-center justify-center theme-card">
        <i class="ri-github-fill text-lg theme-text-primary"></i>
      </span>
      <span class="min-w-0 flex-1">
        <span class="block text-sm font-semibold theme-text-primary">GitHub</span>
        <span class="block text-xs theme-text-tertiary truncate">查看项目源码与更新</span>
      </span>
      <i class="ri-external-link-line text-sm theme-text-tertiary"></i>
    </a>

    <SponsorCard
      v-if="sponsor && domain"
      :sponsor="sponsor"
      :domain="domain"
      :community="community"
    />
  </div>
</template>

<script setup>
import { urls } from '@/sdk/app';
import SponsorCard from '@/components/SponsorCard.vue';

defineProps({
  sponsor: { type: Object, default: null },
  domain: { type: Object, default: null },
  community: { type: Object, default: null },
});

const githubUrl = urls.github || 'https://github.com/yanyaoli/byerun-web';
</script>