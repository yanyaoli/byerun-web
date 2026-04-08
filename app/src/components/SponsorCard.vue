<template>
  <section class="rounded-2xl bg-white/5 border border-white/8 p-5 space-y-2">
    <div class="flex items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-2">
        <i class="ri-star-smile-fill text-slate-500"></i>
        <p class="truncate text-sm font-bold text-slate-400">{{ sponsor?.title }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="wechatGroupQrcode"
          type="button"
          @click="openQrPreview({ url: wechatGroupQrcode })"
          class="inline-flex w-6 cursor-pointer items-center justify-center rounded-full text-sm text-slate-500 hover:bg-white/5 transition-colors"
          aria-label="微信群二维码"
          title="微信群二维码"
        >
          <i class="ri-wechat-fill text-base"></i>
        </button>
        <a
          v-if="qqGroupUrl"
          :href="qqGroupUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex w-6 cursor-pointer items-center justify-center rounded-full text-sm text-slate-500 hover:bg-white/5 transition-colors"
          aria-label="QQ 群"
          title="QQ 群"
        >
          <i class="ri-qq-line text-base"></i>
        </a>
      </div>
    </div>

    <div class="space-y-3">
      <p class="text-sm text-gray-400">{{ sponsor?.desc }}</p>
      <div
        v-if="qrItems.length"
        class="sponsor-pay-banner rounded-xl border border-stone-700/70 bg-white/5 p-3"
      >
        <div class="flex items-center gap-2">
          <button
            v-for="item in qrItems"
            :key="item.key"
            type="button"
            @click="openQrPreview(item)"
            class="sponsor-pay-item flex-1 rounded-md px-2 py-3 transition-colors hover:bg-white/5"
          >
            <div class="flex flex-col items-center justify-center gap-1.5">
              <span class="text-xs font-semibold text-slate-400">{{ item.label }}</span>
              <i class="ri-qr-code-line text-lg text-slate-400"></i>
            </div>
          </button>
        </div>
      </div>
      <div class="flex w-full flex-wrap items-center justify-center gap-2">
        <a
          :href="sponsor?.alipay_url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 bg-white/5 rounded-full border border-white/8 px-3 py-1.5 text-xs font-semibold text-sky-500 hover:bg-sky-100 transition-colors"
        >
          <i class="ri-alipay-fill"></i>
          <span>跳转支付宝打赏</span>
        </a>
      </div>
    </div>

    <div class="pt-4">
      <div class="flex items-center gap-1.5">
        <i class="ri-time-fill text-slate-500"></i>
        <p class="truncate text-sm font-bold text-slate-400">网站续费状态</p>
      </div>
      <div class="mt-2 flex items-center justify-between gap-3">
        <a
          :href="domainHref"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 underline-offset-4 hover:underline"
        >
          <span class="truncate">{{ domain?.domain }}</span>
          <i class="ri-external-link-line text-xs text-slate-500"></i>
        </a>
        <p class="shrink-0 text-xs font-medium text-slate-500 tabular-nums">
          {{ remainingDaysText }}后到期
        </p>
      </div>
    </div>

    <div class="pt-4">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-1.5">
          <i class="ri-medal-fill text-slate-500"></i>
          <p class="truncate text-sm font-bold text-slate-400">赞助伙伴们</p>
        </div>
        <a
          v-if="qqGroupUrl"
          :href="qqGroupUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="shrink-0 text-xs font-medium text-sky-600 underline-offset-4 hover:underline"
        >
          被遗漏？
        </a>
      </div>
      <div class="sponsor-grid mt-2">
        <div
          v-for="(entry, index) in sortedSponsors"
          :key="`sponsor-${entry.name}-${entry.date}-${entry.rank || 0}-${entry.remark || ''}`"
          class="sponsor-card-wrapper"
        >
          <div
            class="sponsor-card-item group inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
            :class="[
              getSponsorBadgeClass(entry),
              selectedSponsorIndex === index ? 'is-expanded' : '',
            ]"
            @click="handleSponsorBadgeClick(entry, index)"
          >
            <template v-if="selectedSponsorIndex === index">
              <div class="sponsor-card-detail">
                <span class="sponsor-card-name">{{ selectedSponsor.name }}</span>
                <span v-if="selectedSponsor.remark" class="sponsor-card-remark">
                  {{ selectedSponsor.remark }}
                </span>
                <span v-if="selectedSponsor.date" class="sponsor-card-date">
                  {{ selectedSponsor.date }}
                </span>
              </div>
            </template>
              <template v-else>
              <span v-if="entry.rank" class="sponsor-card-rank-badge"> #{{ entry.rank }} </span>
              <span>{{ entry.name }}</span>
              <i v-if="entry.remark" class="ri-quill-pen-line text-[11px] text-current"></i>
              <i
                v-if="entry._isLatest"
                class="ri-sparkling-fill text-[11px] text-current latest-icon"
                title="最新赞助"
              ></i>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div
    v-show="previewVisible && previewQrUrl"
    class="fixed inset-0 flex items-center justify-center bg-black/60 px-4"
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
      <div
        v-if="previewLoading"
        class="mx-auto mt-3 aspect-square w-full animate-pulse rounded-xl border border-stone-700/60 bg-stone-800/70"
      ></div>
      <img
        :src="previewQrUrl"
        alt="收款码预览"
        v-show="!previewLoading"
        @load="handlePreviewLoaded"
        @error="handlePreviewLoaded"
        class="mx-auto mt-3 aspect-square w-full rounded-xl bg-none object-contain"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  sponsor: {
    type: Object,
    required: true,
  },
  domain: {
    type: Object,
    required: true,
  },
  community: {
    type: Object,
    default: null,
  },
});

const previewQrUrl = ref('');
const previewVisible = ref(false);
const previewLoading = ref(false);
const selectedSponsor = ref(null);
const selectedSponsorIndex = ref(-1);
const qqGroupUrl = computed(() => props.community?.qq_group_url || '');
const wechatGroupQrcode = computed(() => props.community?.wechat_group_qrcode || '');
const preloadedQrSet = new Set();
const loadedQrSet = new Set();

const sponsorEntries = computed(() => {
  if (!Array.isArray(props.sponsor?.sponsors)) return [];
  return props.sponsor.sponsors
    .map((item) => {
      if (!item) return null;
      if (typeof item === 'string') {
        const name = item.trim();
        return name ? { name, date: '', rank: null } : null;
      }

      const name = String(item.name || '').trim();
      if (!name) return null;

      const rankNum = Number(item.rank);
      return {
        name,
        date: String(item.date || '').trim(),
        remark: String(item.remark || '').trim(),
        rank: Number.isInteger(rankNum) && rankNum >= 1 && rankNum <= 5 ? rankNum : null,
      };
    })
    .filter(Boolean);
});

const sortedSponsors = computed(() => {
  if (!sponsorEntries.value.length) return [];
  const entries = [...sponsorEntries.value].sort((a, b) => compareDate(b.date, a.date));
  const latestEntry = findLatestEntry(entries);
  return entries.map((e) => ({ ...e, _isLatest: e === latestEntry }));
});

const findLatestEntry = (entries) => {
  let latest = null;
  let latestDate = '';
  for (const e of entries) {
    if (e.date && e.date > latestDate) {
      latestDate = e.date;
      latest = e;
    }
  }
  return latest;
};

const compareDate = (a, b) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
};

const qrItems = computed(() =>
  [
    {
      key: 'alipay',
      label: '支付宝',
      url: props.sponsor?.alipay_qrcode,
      coverIcon: 'ri-alipay-line',
    },
    {
      key: 'wechat',
      label: '微信',
      url: props.sponsor?.wechat_qrcode,
      coverIcon: 'ri-wechat-pay-line',
    },
  ].filter((item) => Boolean(item.url)),
);

const domainHref = computed(() => {
  const value = props.domain?.domain;
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
});

const remainingDaysText = computed(() => `${props.domain?.remaining_days}天`);

const getSponsorBadgeClass = (entry) => {
  const classes = [];
  if (entry?.rank || entry?.remark) {
    classes.push('is-priority');
  }
  if (entry?._isLatest) {
    classes.push('is-latest');
  }
  return classes;
};

const formatSponsorDate = (date) => {
  const value = String(date || '').trim();
  return value || '暂无记录';
};

const handleSponsorBadgeClick = (entry, index) => {
  if (!entry) return;
  if (selectedSponsorIndex.value === index) {
    selectedSponsor.value = null;
    selectedSponsorIndex.value = -1;
    return;
  }
  selectedSponsor.value = {
    name: entry.name,
    date: entry.date,
    remark: entry.remark,
    rank: entry.rank,
  };
  selectedSponsorIndex.value = index;
};

const preloadQrImage = (url) => {
  if (!url || preloadedQrSet.has(url)) return;
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  preloadedQrSet.add(url);
};

const openQrPreview = (item) => {
  if (!item?.url) return;
  previewLoading.value = !loadedQrSet.has(item.url);
  previewQrUrl.value = item.url;
  previewVisible.value = true;
};

const closeQrPreview = () => {
  previewVisible.value = false;
  previewLoading.value = false;
};

const handlePreviewLoaded = () => {
  if (previewQrUrl.value) {
    loadedQrSet.add(previewQrUrl.value);
  }
  previewLoading.value = false;
};

const handleKeydown = (event) => {
  if (event.key !== 'Escape') return;
  if (previewVisible.value) {
    closeQrPreview();
    return;
  }
  if (selectedSponsorIndex.value !== -1) {
    selectedSponsor.value = null;
    selectedSponsorIndex.value = -1;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});

watch(
  qrItems,
  (items) => {
    items.forEach((item) => preloadQrImage(item.url));
  },
  { immediate: true },
);

watch(
  wechatGroupQrcode,
  (url) => {
    preloadQrImage(url);
  },
  { immediate: true },
);
</script>

<style scoped>
.sponsor-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.sponsor-card-item {
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.sponsor-card-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
}

.sponsor-card-item.is-priority {
  border-style: dashed;
  border-color: rgba(110, 231, 183, 0.5);
  background: rgba(52, 211, 153, 0.08);
  color: #6ee7b7;
}

.sponsor-card-item.is-priority:hover {
  background: rgba(52, 211, 153, 0.15);
  border-color: rgba(110, 231, 183, 0.7);
}

.sponsor-card-item.is-expanded {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  padding: 0.4rem 0.5rem;
  border-style: solid;
  border-color: rgba(14, 165, 233, 0.5);
  background: rgba(14, 165, 233, 0.08);
  color: #cbd5e1;
}

.sponsor-card-rank-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.05rem 0.35rem;
  border-radius: 9999px;
  background: rgba(251, 191, 36, 0.15);
  color: #fde68a;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.3;
  white-space: nowrap;
}

.sponsor-card-detail {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.sponsor-card-name {
  font-size: 11px;
  font-weight: 600;
  color: #e2e8f0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sponsor-card-remark {
  font-size: 10px;
  font-weight: 500;
  color: #a5f3fc;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sponsor-card-item.is-latest {
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.06);
  color: #fde68a;
  animation: sponsor-latest-glow 2s ease-in-out infinite;
}

.sponsor-card-item.is-latest:hover {
  background: rgba(251, 191, 36, 0.12);
  border-color: rgba(251, 191, 36, 0.7);
}

.sponsor-card-item.is-latest.is-priority {
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.08);
  color: #fde68a;
}

.latest-icon {
  animation: sponsor-latest-spin 3s linear infinite;
}

@keyframes sponsor-latest-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(251, 191, 36, 0);
  }
  50% {
    box-shadow: 0 0 8px 1px rgba(251, 191, 36, 0.2);
  }
}

@keyframes sponsor-latest-spin {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

.sponsor-card-date {
  font-size: 9px;
  font-weight: 500;
  color: #94a3b8;
  line-height: 1.3;
  white-space: nowrap;
  tabular-nums: tabular-nums;
}
</style>
