<template>
  <div class="space-y-4">
    <!-- 赞助卡片 -->
    <section class="rounded-xl" style="padding: 20px; background: var(--card-bg); border: 1px solid var(--card-border)">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <i class="ri-star-smile-line text-sm"></i>
          <span class="text-sm font-semibold theme-text-primary">{{ sponsor?.title }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button v-if="wechatGroupQrcode" type="button"
            @click="openQrPreview({ url: wechatGroupQrcode, label: '微信群' })"
            class="inline-flex w-6 cursor-pointer items-center justify-center rounded-full text-sm theme-text-tertiary transition-colors"
            aria-label="微信群二维码" title="微信群二维码">
            <i class="ri-wechat-fill text-base"></i>
          </button>
          <a v-if="qqGroupUrl" :href="qqGroupUrl" target="_blank" rel="noopener noreferrer"
            class="inline-flex w-6 cursor-pointer items-center justify-center rounded-full text-sm theme-text-tertiary transition-colors"
            aria-label="QQ 群" title="QQ 群">
            <i class="ri-qq-line text-base"></i>
          </a>
        </div>
      </div>

      <div class="mt-4 space-y-3">
        <p class="text-sm theme-text-secondary leading-relaxed" style="white-space: pre-line">
          {{ sponsor?.desc }}
        </p>
        <div v-if="qrItems.length" class="rounded-xl px-4 py-3 flex items-center gap-3">
          <div class="flex items-center gap-3 flex-1">
            <button v-for="item in qrItems" :key="item.key" type="button" @click="openQrPreview(item)"
              class="flex-1 flex items-center gap-2 rounded-lg px-3 py-2.5 transition-all active:scale-[0.98]"
              style="background: var(--card-bg); border: 1px solid var(--card-border)">
              <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" :style="{
                background:
                  item.key === 'alipay' ? 'rgba(22, 119, 255, 0.1)' : 'rgba(7, 193, 96, 0.1)',
              }">
                <i :class="item.coverIcon" class="text-base"
                  :style="{ color: item.key === 'alipay' ? '#1677ff' : '#07c160' }"></i>
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-semibold theme-text-primary">{{ item.label }}</span>
                <span class="text-[10px] theme-text-tertiary">扫码投喂</span>
              </div>
              <i class="ri-qr-code-line text-lg shrink-0 ml-auto" style="color: var(--text-tertiary)"></i>
            </button>
          </div>
        </div>
        <a :href="sponsor?.alipay_url" target="_blank" rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all active:scale-[0.98]"
          style="
            background: rgba(22, 119, 255, 0.06);
            color: #1677ff;
            border: 1px solid rgba(22, 119, 255, 0.15);
          ">
          <i class="ri-alipay-fill text-base"></i>
          <span>打开支付宝投喂</span>
          <i class="ri-external-link-line text-xs opacity-60"></i>
        </a>
      </div>
    </section>

    <!-- 续费状态卡片 -->
    <section class="rounded-xl" style="padding: 20px; background: var(--card-bg); border: 1px solid var(--card-border)">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <i class="ri-time-line text-sm"></i>
          <span class="text-sm font-semibold theme-text-primary">网站续费状态</span>
        </div>
      </div>
      <div class="rounded-xl px-4 py-3" style="background: rgba(37, 99, 235, 0.04)">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <div class="min-w-0">
              <a :href="domainHref" target="_blank" rel="noopener noreferrer"
                class="text-sm font-semibold theme-link hover:underline truncate block">
                {{ domain?.domain }}
              </a>
              <p v-if="domain?.remaining_days" class="text-[11px] theme-text-tertiary mt-0.5">
                域名到期提醒
              </p>
            </div>
          </div>
          <div class="flex flex-col items-end shrink-0">
            <span class="text-sm font-bold" :style="{ color: remainingDaysColor }">{{
              remainingDaysText
              }}</span>
            <span class="text-[10px] theme-text-tertiary">后到期</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 赞助伙伴卡片 -->
    <section class="rounded-xl" style="padding: 20px; background: var(--card-bg); border: 1px solid var(--card-border)">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <i class="ri-medal-line text-sm"></i>
          <span class="text-sm font-semibold theme-text-primary">赞助伙伴们</span>
        </div>
        <a v-if="qqGroupUrl" :href="qqGroupUrl" target="_blank" rel="noopener noreferrer"
          class="shrink-0 text-xs font-medium theme-link underline-offset-4 hover:underline">
          被遗漏？
        </a>
      </div>
      <div class="mt-3 max-h-[370px] overflow-y-auto space-y-1">
        <div v-for="(item, idx) in flatSponsors" :key="item.name + (item.date || '')"
          class="flex items-center justify-between rounded-lg px-4 py-2.5 transition-colors"
          :style="{ background: sponsorRowColor(idx) }">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <span class="text-sm font-medium theme-text-primary truncate">{{ item.name }}</span>
            <span v-if="item.remark" class="text-[10px] theme-text-tertiary truncate">· {{ item.remark }}</span>
          </div>
          <span v-if="item.date" class="shrink-0 text-[10px] theme-text-tertiary tabular-nums ml-2">{{ item.date
            }}</span>
        </div>
      </div>
    </section>
  </div>

  <Drawer v-model="previewVisible" :title="previewQrLabel === '微信群' ? '微信群二维码' : '投喂码'">
    <div class="px-5 pb-4 flex flex-col items-center">
      <div v-if="previewQrUrl" class="rounded-xl overflow-hidden" style="padding: 8px; width: 200px">
        <img :src="previewQrUrl" alt="二维码" referrerpolicy="no-referrer" class="w-full" style="display: block"
          @error="onQrError" />
      </div>
      <p v-if="qrLoadFailed" class="text-xs text-center theme-text-tertiary mt-2">二维码加载失败</p>
      <a v-if="appScheme" :href="appScheme" target="_blank"
        class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98]"
        :style="{
          background:
            previewQrLabel === '支付宝' ? 'rgba(22, 119, 255, 0.06)' : 'rgba(7, 193, 96, 0.06)',
          color: previewQrLabel === '支付宝' ? '#1677ff' : '#07c160',
          border:
            previewQrLabel === '支付宝'
              ? '1px solid rgba(22, 119, 255, 0.15)'
              : '1px solid rgba(7, 193, 96, 0.15)',
        }">
        <i :class="previewQrLabel === '支付宝' ? 'ri-alipay-fill' : 'ri-wechat-pay-line'" class="text-base"></i>
        <span>打开{{ previewQrLabel === '微信群' ? '微信' : previewQrLabel }}</span>
      </a>
    </div>
  </Drawer>
</template>

<script setup>
import { computed, ref } from 'vue';
import Drawer from '@/components/ui/Drawer.vue';

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

const previewVisible = ref(false);
const previewQrLabel = ref('');
const previewQrUrl = ref('');
const qrLoadFailed = ref(false);

function onQrError() {
  qrLoadFailed.value = true;
}

const sponsorRowColors = [
  'rgba(37, 99, 235, 0.04)',
  'rgba(22, 163, 74, 0.04)',
  'rgba(217, 119, 6, 0.04)',
  'rgba(168, 85, 247, 0.04)',
  'rgba(236, 72, 153, 0.04)',
  'rgba(8, 145, 178, 0.04)',
  'rgba(220, 38, 38, 0.04)',
  'rgba(101, 163, 13, 0.04)',
];

function sponsorRowColor(idx) {
  return sponsorRowColors[idx % sponsorRowColors.length];
}
const qqGroupUrl = computed(() => props.community?.qq_group_url || '');
const wechatGroupQrcode = computed(() => props.community?.wechat_group_qrcode || '');
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

const remainingDaysColor = computed(() => {
  const days = Number(props.domain?.remaining_days);
  if (days > 90) return '#16a34a';
  if (days > 30) return '#2563eb';
  if (days > 7) return '#d97706';
  return '#dc2626';
});

const flatSponsors = computed(() => {
  return sortedSponsors.value.map((e) => ({
    name: e.name,
    date: e.date,
    remark: e.remark,
  }));
});

const appScheme = computed(() => {
  if (previewQrLabel.value === '支付宝') return 'alipays://';
  if (previewQrLabel.value === '微信' || previewQrLabel.value === '微信群') return 'weixin://';
  return '';
});

const openQrPreview = async (item) => {
  if (!item?.url) return;
  qrLoadFailed.value = false;
  previewQrLabel.value = item.label;
  try {
    const res = await fetch(item.url);
    const blob = await res.blob();
    previewQrUrl.value = URL.createObjectURL(blob);
  } catch {
    previewQrUrl.value = item.url;
  }
  previewVisible.value = true;
};
</script>

<style scoped></style>
