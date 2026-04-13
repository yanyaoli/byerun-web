<template>
  <section class="theme-card rounded-2xl p-5 space-y-2">
    <div class="flex items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-2">
        <i class="ri-star-smile-fill theme-text-tertiary"></i>
        <p class="truncate text-sm font-bold theme-text-secondary">{{ sponsor?.title }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="wechatGroupQrcode"
          type="button"
          @click="openQrPreview({ url: wechatGroupQrcode })"
          class="inline-flex w-6 cursor-pointer items-center justify-center rounded-full text-sm theme-text-tertiary transition-colors"
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
          class="inline-flex w-6 cursor-pointer items-center justify-center rounded-full text-sm theme-text-tertiary transition-colors"
          aria-label="QQ 群"
          title="QQ 群"
        >
          <i class="ri-qq-line text-base"></i>
        </a>
      </div>
    </div>

    <div class="space-y-3">
      <p class="text-sm theme-text-secondary">{{ sponsor?.desc }}</p>
      <div v-if="qrItems.length" class="sponsor-pay-banner theme-card-soft rounded-xl p-3">
        <div class="flex items-center gap-2">
          <button
            v-for="item in qrItems"
            :key="item.key"
            type="button"
            @click="openQrPreview(item)"
            class="sponsor-pay-item flex-1 rounded-md px-2 py-3 transition-colors"
          >
            <div class="flex flex-col items-center justify-center gap-1.5">
              <span class="text-xs font-semibold theme-text-secondary">{{ item.label }}</span>
              <i class="ri-qr-code-line text-lg theme-text-secondary"></i>
            </div>
          </button>
        </div>
      </div>
      <div class="flex w-full flex-wrap items-center justify-center gap-2">
        <a
          :href="sponsor?.alipay_url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 theme-card-soft rounded-full px-3 py-1.5 text-xs font-semibold text-sky-500 transition-colors"
        >
          <i class="ri-alipay-fill"></i>
          <span>跳转支付宝打赏</span>
        </a>
      </div>
    </div>

    <div class="pt-4">
      <div class="flex items-center gap-1.5">
        <i class="ri-time-fill theme-text-tertiary"></i>
        <p class="truncate text-sm font-bold theme-text-secondary">网站续费状态</p>
      </div>
      <div class="mt-2 flex items-center justify-between gap-3">
        <a
          :href="domainHref"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-xs font-semibold theme-link underline-offset-4 hover:underline"
        >
          <span class="truncate">{{ domain?.domain }}</span>
          <i class="ri-external-link-line text-xs theme-text-tertiary"></i>
        </a>
        <p class="shrink-0 text-xs font-medium theme-text-tertiary tabular-nums">
          {{ remainingDaysText }}后到期
        </p>
      </div>
    </div>

    <div class="pt-4">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-1.5">
          <i class="ri-medal-fill theme-text-tertiary"></i>
          <p class="truncate text-sm font-bold theme-text-secondary">赞助伙伴们</p>
        </div>
        <a
          v-if="qqGroupUrl"
          :href="qqGroupUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="shrink-0 text-xs font-medium theme-link underline-offset-4 hover:underline"
        >
          被遗漏？
        </a>
      </div>
      <div class="sponsor-grid mt-2">
        <template v-for="item in sponsorWithGroups" :key="item.key">
          <div
            v-if="item.type === 'group-header'"
            class="sponsor-group-divider w-full flex items-center gap-2 py-2 text-xs theme-text-tertiary"
          >
            <span class="font-medium">{{ item.year }}年{{ item.month }}月</span>
            <div class="h-px flex-1 theme-divider-bg"></div>
          </div>
          <div
            v-else-if="item.type === 'divider-end'"
            class="w-full border-b theme-card-divider my-1"
          ></div>
          <div v-else-if="item.type === 'sponsor'" class="sponsor-card-wrapper">
            <div
              class="sponsor-card-item group inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
              :class="[
                getSponsorBadgeClass(item),
                selectedSponsor?.name === item.name ? 'is-expanded' : '',
              ]"
              @click="handleSponsorBadgeClick(item)"
            >
              <template v-if="selectedSponsor?.name === item.name">
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
                <span v-if="item.rank" class="sponsor-card-rank-badge"> #{{ item.rank }} </span>
                <span>{{ item.name }}</span>
                <i v-if="item.remark" class="ri-quill-pen-line text-[11px] text-current"></i>
                <i
                  v-if="item._isLatest"
                  class="ri-sparkling-fill text-[11px] text-current latest-icon"
                  title="最新赞助"
                ></i>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>

  <div
    v-show="previewVisible && previewQrUrl"
    class="fixed inset-0 z-[1200] flex items-center justify-center sponsor-preview-overlay px-4"
  >
    <div class="relative w-full max-w-sm rounded-2xl bg-none p-4">
      <button
        type="button"
        @click="closeQrPreview"
        class="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full sponsor-preview-close"
        aria-label="关闭预览"
      >
        <i class="ri-close-line text-base"></i>
      </button>
      <div
        v-if="previewLoading"
        class="mx-auto mt-3 aspect-square w-full animate-pulse rounded-xl theme-card-soft"
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
      const indexNum = Number(item.index);
      return {
        name,
        date: String(item.date || '').trim(),
        remark: String(item.remark || '').trim(),
        rank: Number.isInteger(rankNum) && rankNum >= 1 && rankNum <= 5 ? rankNum : null,
        index: Number.isInteger(indexNum) && indexNum >= 1 ? indexNum : null,
      };
    })
    .filter(Boolean);
});

const sortedSponsors = computed(() => {
  if (!sponsorEntries.value.length) return [];
  const entries = [...sponsorEntries.value].sort((a, b) => (b.index || 0) - (a.index || 0));
  const maxIndex = entries[0]?.index || 0;
  return entries.map((e) => ({
    ...e,
    _isLatest: e.index === maxIndex,
  }));
});

const sponsorWithGroups = computed(() => {
  const list = sortedSponsors.value;
  if (!list.length) return [];

  const result = [];
  let currentGroup = null;

  for (const entry of list) {
    const dateParts = entry.date ? entry.date.split('-') : [];
    const year = dateParts[0] || '';
    const month = dateParts[1] || '';
    const groupKey = `${year}-${month}`;

    if (!currentGroup || currentGroup.key !== groupKey) {
      if (currentGroup) result.push({ type: 'divider-end', key: `div-end-${currentGroup.key}` });
      result.push({ type: 'group-header', key: `group-${groupKey}`, year, month });
      currentGroup = { key: groupKey, year, month };
    }
    result.push({ type: 'sponsor', ...entry, key: entry.name + entry.date + (entry.rank || '') });
  }

  if (currentGroup) result.push({ type: 'divider-end', key: `div-end-${currentGroup.key}` });

  return result;
});

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

const handleSponsorBadgeClick = (entry) => {
  if (!entry) return;
  if (selectedSponsor.value?.name === entry.name) {
    selectedSponsor.value = null;
    return;
  }
  selectedSponsor.value = {
    name: entry.name,
    date: entry.date,
    remark: entry.remark,
    rank: entry.rank,
    index: entry.index,
  };
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
  if (selectedSponsor.value) {
    selectedSponsor.value = null;
    return;
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

.sponsor-pay-item {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.sponsor-pay-item:hover {
  background: var(--action-hover-bg);
  border-color: var(--card-divider);
}

.sponsor-card-item {
  color: var(--text-secondary);
  background: var(--card-soft-bg);
  border: 1px solid var(--card-border);
}

.sponsor-card-item:hover {
  background: var(--action-hover-bg);
  border-color: var(--card-divider);
}

.sponsor-card-item.is-priority {
  border-style: dashed;
  border-color: rgba(16, 185, 129, 0.5);
  background: rgba(16, 185, 129, 0.06);
  color: #10b981;
}

.sponsor-card-item.is-priority:hover {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.7);
}

.sponsor-card-item.is-expanded {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  padding: 0.4rem 0.5rem;
  border-style: solid;
  border-color: rgba(14, 165, 233, 0.5);
  background: rgba(14, 165, 233, 0.06);
  color: var(--text-secondary);
}

.sponsor-card-rank-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.05rem 0.35rem;
  border-radius: 9999px;
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
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
  color: var(--text-primary);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sponsor-card-remark {
  font-size: 10px;
  font-weight: 500;
  color: #06b6d4;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sponsor-card-item.is-latest {
  border-color: rgba(245, 158, 11, 0.5);
  background: rgba(245, 158, 11, 0.05);
  color: #f59e0b;
  animation: sponsor-latest-glow 2s ease-in-out infinite;
}

.sponsor-card-item.is-latest:hover {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.7);
}

.sponsor-card-item.is-latest.is-priority {
  border-color: rgba(245, 158, 11, 0.5);
  background: rgba(245, 158, 11, 0.06);
  color: #f59e0b;
}

.latest-icon {
  animation: sponsor-latest-spin 3s linear infinite;
}

@keyframes sponsor-latest-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
  }
  50% {
    box-shadow: 0 0 8px 1px rgba(245, 158, 11, 0.2);
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
  color: var(--text-tertiary);
  line-height: 1.3;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.sponsor-preview-overlay {
  z-index: 1200;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.sponsor-preview-close {
  color: var(--text-primary);
  background-color: var(--card-bg-strong);
  border: 1px solid var(--card-border);
}

.dark .sponsor-card-item.is-priority {
  border-color: rgba(110, 231, 183, 0.5);
  background: rgba(52, 211, 153, 0.08);
  color: #6ee7b7;
}

.dark .sponsor-card-item.is-priority:hover {
  background: rgba(52, 211, 153, 0.15);
  border-color: rgba(110, 231, 183, 0.7);
}

.dark .sponsor-card-item.is-expanded {
  border-color: rgba(14, 165, 233, 0.5);
  background: rgba(14, 165, 233, 0.08);
  color: #cbd5e1;
}

.dark .sponsor-card-rank-badge {
  background: rgba(251, 191, 36, 0.15);
  color: #fde68a;
}

.dark .sponsor-card-remark {
  color: #a5f3fc;
}

.dark .sponsor-card-item.is-latest {
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.06);
  color: #fde68a;
}

.dark .sponsor-card-item.is-latest:hover {
  background: rgba(251, 191, 36, 0.12);
  border-color: rgba(251, 191, 36, 0.7);
}

.dark .sponsor-card-item.is-latest.is-priority {
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.08);
  color: #fde68a;
}

.dark .sponsor-preview-overlay {
  background-color: rgba(0, 0, 0, 0.6);
}
</style>
