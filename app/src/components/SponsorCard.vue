<template>
  <section class="rounded-2xl bg-stone-900 p-5 space-y-2">
    <div class="flex items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-2">
        <i class="ri-star-smile-line text-slate-500"></i>
        <p class="truncate text-sm font-bold text-slate-400">{{ sponsor?.title }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="wechatGroupQrcode"
          type="button"
          @click="openQrPreview({ url: wechatGroupQrcode })"
          class="inline-flex w-auto cursor-pointer items-center justify-center rounded-full text-sm text-stone-700 hover:bg-stone-800 transition-colors"
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
          class="inline-flex w-auto items-center justify-center rounded-full text-sm text-stone-700 hover:bg-stone-800 transition-colors"
          aria-label="QQ 群"
          title="QQ 群"
        >
          <i class="ri-qq-line text-base"></i>
        </a>
      </div>
    </div>

    <div class="space-y-3">
      <p class="text-sm text-slate-500">{{ sponsor?.desc }}</p>
      <div
        v-if="qrItems.length"
        class="sponsor-pay-banner rounded-xl border border-stone-700/70 bg-stone-800/80 p-3"
      >
        <div class="flex items-center gap-2">
          <button
            v-for="item in qrItems"
            :key="item.key"
            type="button"
            @click="openQrPreview(item)"
            class="sponsor-pay-item flex-1 rounded-md px-2 py-3 transition-colors hover:bg-stone-950/50"
          >
            <div class="flex flex-col items-center justify-center gap-1.5">
              <span class="text-xs font-semibold text-slate-500">{{ item.label }}</span>
              <i class="ri-qr-code-line text-lg text-slate-500"></i>
            </div>
          </button>
        </div>
      </div>
      <div class="flex w-full flex-wrap items-center justify-center gap-2">
        <a
          :href="sponsor?.alipay_url"
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
          v-if="qqGroupUrl"
          :href="qqGroupUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="shrink-0 text-xs font-medium text-sky-600 underline-offset-4 hover:underline"
        >
          被遗漏？
        </a>
      </div>
      <div v-if="sponsorNameRows.length" class="sponsor-marquee mt-2">
        <div
          v-for="(row, rowIndex) in sponsorNameRows"
          :key="`sponsor-row-${rowIndex}`"
          class="sponsor-row"
        >
          <div class="sponsor-row-track" :class="{ 'is-reverse': rowIndex % 2 === 1 }">
            <div
              v-for="copyIndex in 2"
              :key="`row-${rowIndex}-copy-${copyIndex}`"
              class="sponsor-row-group"
              :aria-hidden="copyIndex === 2"
            >
              <span
                v-for="(name, index) in row"
                :key="`row-${rowIndex}-copy-${copyIndex}-name-${name}-${index}`"
                class="sponsor-badge inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                :style="getSponsorBadgeStyle(name)"
              >
                {{ name }}
              </span>
            </div>
          </div>
        </div>
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
          <span class="truncate">{{ domain?.domain }}</span>
          <i class="ri-external-link-line text-xs text-slate-500"></i>
        </a>
        <p class="shrink-0 text-xs font-medium text-slate-600 tabular-nums">
          剩余{{ remainingDaysText }}
        </p>
      </div>
    </div>
  </section>

  <div
    v-show="previewVisible && previewQrUrl"
    class="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 px-4"
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
const macaronHues = [8, 22, 36, 50, 66, 88, 112, 136, 160, 182, 204, 226, 248, 272, 298, 324];
const qqGroupUrl = computed(() => props.community?.qq_group_url || '');
const wechatGroupQrcode = computed(() => props.community?.wechat_group_qrcode || '');
const preloadedQrSet = new Set();

const sponsorNames = computed(() => {
  if (!Array.isArray(props.sponsor?.sponsors)) return [];
  return props.sponsor.sponsors.map((item) => item?.name).filter(Boolean);
});

const sponsorNameRows = computed(() => {
  if (!sponsorNames.value.length) return [];
  const rowCount = Math.min(3, sponsorNames.value.length);
  const rows = Array.from({ length: rowCount }, () => []);

  sponsorNames.value.forEach((name, index) => {
    rows[index % rowCount].push(name);
  });

  return rows.filter((row) => row.length);
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
      label: '微信赞赏',
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

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getMacaronColor = (name) => {
  const hash = hashString(name);
  const baseHue = macaronHues[hash % macaronHues.length];
  const hue = (baseHue + (hash % 9) - 4 + 360) % 360;
  const saturation = 56 + ((hash >> 3) % 10);
  const lightness = 84 + ((hash >> 5) % 6);

  return {
    text: `hsl(${hue}, ${Math.max(22, saturation - 26)}%, ${Math.max(26, lightness - 54)}%)`,
    bg: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    border: `hsl(${hue}, ${Math.max(34, saturation - 18)}%, ${Math.max(70, lightness - 10)}%)`,
    shadow: `hsla(${hue}, ${Math.max(26, saturation - 24)}%, ${Math.max(34, lightness - 48)}%, 0.14)`,
  };
};

const sponsorBadgeStyleMap = computed(() => {
  const styles = new Map();
  sponsorNames.value.forEach((name) => {
    const color = getMacaronColor(name);
    styles.set(name, {
      color: color.text,
      backgroundColor: color.bg,
      borderColor: color.border,
      boxShadow: `0 2px 4px ${color.shadow}`,
    });
  });
  return styles;
});

const defaultSponsorBadgeStyle = {
  color: '#6A6A6A',
  backgroundColor: '#F2F2F2',
  borderColor: '#DFDFDF',
  boxShadow: '0 2px 4px rgba(106, 106, 106, 0.14)',
};

const getSponsorBadgeStyle = (name) =>
  sponsorBadgeStyleMap.value.get(name) ?? defaultSponsorBadgeStyle;

const preloadQrImage = (url) => {
  if (!url || preloadedQrSet.has(url)) return;
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  preloadedQrSet.add(url);
};

const openQrPreview = (item) => {
  if (!item?.url) return;
  previewLoading.value = true;
  previewQrUrl.value = item.url;
  previewVisible.value = true;
};

const closeQrPreview = () => {
  previewVisible.value = false;
};

const handlePreviewLoaded = () => {
  previewLoading.value = false;
};

const handleKeydown = (event) => {
  if (event.key !== 'Escape' || !previewVisible.value) return;
  closeQrPreview();
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
.sponsor-badge {
  position: relative;
  flex-shrink: 0;
  white-space: nowrap;
  border: 1px solid transparent;
}

.sponsor-pay-banner {
  position: relative;
}

.sponsor-pay-item {
  min-height: 3rem;
}

.sponsor-marquee {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sponsor-row {
  overflow: hidden;
}

.sponsor-row-track {
  display: flex;
  width: max-content;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  animation: sponsor-row-scroll 24s linear infinite;
}

.sponsor-row-group {
  display: flex;
  flex-shrink: 0;
  min-width: max-content;
  gap: 0.5rem;
  padding-right: 0.5rem;
}

.sponsor-row-track.is-reverse {
  animation-direction: reverse;
  animation-duration: 30s;
}

@keyframes sponsor-row-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
