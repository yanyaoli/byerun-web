<template>
  <div class="w-full max-w-3xl mx-auto py-2 px-1 space-y-3">
    <section class="rounded-2xl bg-stone-900 px-5 py-4">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="h-11 w-11 rounded-full bg-stone-800 text-slate-500 flex items-center justify-center"
          >
            <i class="ri-user-3-line text-lg"></i>
          </div>
          <div class="min-w-0">
            <p class="text-base font-bold text-slate-400/90 truncate">{{ displayName }}</p>
            <p class="text-xs text-slate-500 truncate">{{ registerCode }}</p>
          </div>
        </div>
        <button
          type="button"
          @click="handleLogout"
          class="shrink-0 text-sm cursor-pointer inline-flex items-center gap-2 bg-stone-800 text-gray-200/50 px-5 py-2 rounded-full font-semibold border-none transition-colors duration-200 hover:bg-red-100 hover:text-red-700"
        >
          <span>登出</span>
        </button>
      </div>
    </section>

    <section v-if="sponsorCardVisible" class="rounded-2xl bg-stone-900 p-5 space-y-2">
      <div class="flex items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-2">
          <i class="ri-star-smile-line text-slate-500"></i>
          <p class="truncate text-sm font-bold text-slate-400">{{ sponsor.title }}</p>
        </div>
        <div class="flex items-center gap-2">
          <a
            :href="qqGroupUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex w-auto items-center justify-center rounded-full text-sm text-stone-700 hover:bg-stone-800 transition-colors"
            aria-label="QQ 群"
            title="QQ 群"
          >
            <i class="ri-qq-line text-base"></i>
          </a>
        </div>
      </div>

      <div class="space-y-3">
        <p class="text-sm text-slate-500">{{ sponsor.desc }}</p>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="item in qrItems"
            :key="item.key"
            type="button"
            @click="openQrPreview(item)"
            class="rounded-md bg-stone-800 p-3 hover:bg-stone-950/60 transition-colors"
          >
            <p class="mb-2 text-xs font-medium text-slate-600 text-center">{{ item.label }}</p>
            <img
              :src="item.url"
              :alt="item.label"
              class="mx-auto h-32 w-32 bg-stone-800 object-contain"
            />
          </button>
        </div>
        <div class="flex w-full flex-wrap items-center justify-center gap-2">
          <a
            :href="sponsor.alipay_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 rounded-full border bg-stone-900 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition-colors"
          >
            <i class="ri-alipay-fill"></i>
            <span>支付宝打赏</span>
          </a>
        </div>
      </div>

      <div class="pt-4">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-1.5">
            <i class="ri-medal-fill text-slate-500"></i>

            <p class="text-xs uppercase tracking-[0.16em] text-slate-500">赞助伙伴</p>
          </div>
          <a
            :href="qqGroupUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="shrink-0 text-xs font-medium text-sky-600 underline-offset-4 hover:underline"
          >
            被遗漏？
          </a>
        </div>
        <div class="mt-2 flex flex-wrap gap-2">
          <span
            v-for="(name, index) in sponsorNames"
            :key="`${name}-${index}`"
            class="sponsor-badge inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          >
            {{ name }}
          </span>
        </div>
      </div>

      <div class="pt-4">
        <div class="flex items-center gap-1.5">
          <i class="ri-time-line text-slate-500"></i>
          <p class="text-xs uppercase tracking-[0.16em] text-slate-500">网站状态</p>
        </div>
        <div class="mt-2 flex items-center justify-between gap-3">
          <a
            :href="domainHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 underline-offset-4 hover:underline"
          >
            <span class="truncate">{{ domain.domain }}</span>
            <i class="ri-external-link-line text-xs text-slate-500"></i>
          </a>
          <p class="shrink-0 text-xs font-medium text-slate-600 tabular-nums">
            剩余{{ remainingDaysText }}
          </p>
        </div>
      </div>
    </section>

    <div
      v-if="sponsorCardVisible && previewQrUrl"
      class="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 px-4"
      @click.self="closeQrPreview"
    >
      <div class="relative w-full max-w-sm rounded-2xl bg-none p-4 shadow-2xl">
        <button
          type="button"
          @click="closeQrPreview"
          class="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-gray-100"
          aria-label="关闭预览"
        >
          <i class="ri-close-line text-base"></i>
        </button>
        <img
          :src="previewQrUrl"
          alt="收款码预览"
          class="mx-auto mt-3 max-h-[70vh] w-full rounded-xl bg-none object-contain"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useDataStore } from '@/composables/useDataStore';
import { useAutorunPingMeta } from '@/composables/useAutorunPingMeta';

const { userInfo, clearAllData } = useDataStore();
const { pingMeta } = useAutorunPingMeta();

const qqGroupUrl = 'https://redirect.where.nyc.mn/byerun-qqgroup';
const previewQrUrl = ref('');

const displayName = computed(() => userInfo.value?.studentName ?? '');
const registerCode = computed(() => userInfo.value?.registerCode ?? '');
const sponsor = computed(() => pingMeta.value?.sponsor);
const domain = computed(() => pingMeta.value?.domain);
const sponsorCardVisible = computed(() => Boolean(sponsor.value && domain.value));
const sponsorNames = computed(() => {
  if (!Array.isArray(sponsor.value?.sponsors)) return [];
  return sponsor.value.sponsors.map((item) => item?.name).filter(Boolean);
});
const qrItems = computed(() =>
  [
    { key: 'alipay', label: '支付宝收款码', url: sponsor.value?.alipay_qrcode },
    { key: 'wechat', label: '微信赞赏码', url: sponsor.value?.wechat_qrcode },
  ].filter((item) => Boolean(item.url)),
);
const domainHref = computed(() => {
  const value = domain.value?.domain;
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
});
const remainingDaysText = computed(() => `${domain.value?.remaining_days}天`);

const openQrPreview = (item) => {
  if (!item?.url) return;
  previewQrUrl.value = item.url;
};

const closeQrPreview = () => {
  previewQrUrl.value = '';
};

const handleLogout = () => {
  try {
    clearAllData();
  } catch (e) {}
  window.location.reload();
};
</script>

<style scoped>
.sponsor-badge {
  position: relative;
  overflow: hidden;
  color: #7c5b18;
  background: linear-gradient(180deg, #f1d49e 0%, #ebd48a 100%);
  box-shadow: 0 1px 2px rgba(124, 91, 24, 0.12);
}

.sponsor-badge::after {
  content: '';
  position: absolute;
  top: -60%;
  left: -45%;
  width: 28%;
  height: 220%;
  transform: rotate(24deg);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.35) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: sponsor-badge-sweep 3.6s ease-in-out infinite;
}

@keyframes sponsor-badge-sweep {
  0% {
    left: -45%;
    opacity: 0;
  }
  20% {
    opacity: 0.6;
  }
  48% {
    left: 120%;
    opacity: 0;
  }
  100% {
    left: 120%;
    opacity: 0;
  }
}
</style>
