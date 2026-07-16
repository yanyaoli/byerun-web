<template>
  <div class="relative w-full box-border">
    <div class="relative flex flex-col">
      <div v-if="records.length > 0" class="w-full" ref="scrollableListRef">
          <template v-for="(item, idx) in timelineItems" :key="idx">
            <!-- 月份分隔徽标 -->
            <div v-if="item.type === 'month-badge'" class="flex justify-center py-3">
              <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-semibold theme-text-secondary" style="background: var(--card-soft-bg)">
                {{ item.label }}
              </div>
            </div>

            <!-- 记录卡片 -->
            <div v-else>
              <div class="pb-4">
                <div class="theme-card rounded-xl overflow-hidden transition-shadow p-0 flex flex-col">
                  <div class="flex justify-between items-center px-4 py-3 border-b border-[var(--card-divider)]">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full inline-block shrink-0" :class="item.statusDotClass"></span>
                      <span class="theme-text-primary text-xs font-semibold">{{ item.dateTime }}</span>
                    </div>
                    <span
                      class="record-status-badge"
                      :class="[item.status === '1' ? 'status-valid' : 'status-invalid']"
                    >{{ item.defeatedInfo }}</span>
                  </div>
                  <div class="px-4 py-2.5">
                    <div class="flex gap-2">
                      <div class="flex-1 min-w-0 flex items-center justify-between rounded-lg px-3 py-2 record-meta-distance">
                        <span class="text-[11px] font-medium record-meta-label">里程</span>
                        <span class="text-sm font-bold tabular-nums record-meta-value">{{ item.distance }}<span class="text-[10px] font-medium opacity-60 ml-0.5">km</span></span>
                      </div>
                      <div class="flex-1 min-w-0 flex items-center justify-between rounded-lg px-3 py-2 record-meta-duration">
                        <span class="text-[11px] font-medium record-meta-label">时长</span>
                        <span class="text-sm font-bold tabular-nums record-meta-value">{{ item.duration }}<span class="text-[10px] font-medium opacity-60 ml-0.5">分钟</span></span>
                      </div>
                      <div class="flex-1 min-w-0 flex items-center justify-between rounded-lg px-3 py-2 record-meta-pace">
                        <span class="text-[11px] font-medium record-meta-label">配速</span>
                        <span class="text-sm font-bold tabular-nums record-meta-value">{{ item.pace }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <div class="py-1 text-center">
            <button
              class="w-full py-2.5 text-sm font-medium rounded-xl transition-all theme-text-secondary hover:bg-[var(--action-hover-bg)] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              @click="loadMoreRecords"
              :disabled="isLoading"
            >
              <i :class="isLoading ? 'ri-loader-4-line animate-spin mr-1.5' : 'ri-arrow-down-s-line mr-1.5'"></i>
              {{ isLoading ? '加载中...' : '加载更多' }}
            </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="flex flex-col items-center justify-center py-16 w-full gap-3">
        <div class="w-12 h-12 rounded-full bg-[var(--card-soft-bg)] flex items-center justify-center">
          <i class="ri-run-line text-xl theme-text-tertiary"></i>
        </div>
        <h3 class="theme-text-tertiary text-sm font-medium">暂无跑步记录</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, inject, watch } from 'vue';
import { useRunRecords } from '@/composables/useRun';
import { useDataStore } from '@/composables/useDataStore';

// 注入全局消息方法
const showMessage = inject('showMessage');
const { loading: profileLoading } = useDataStore();

// 使用 composable 管理记录逻辑
const {
  records,
  isLoading,
  fetchRecords,
  loadMoreRecords,
  formatCreateTime,
  formatPaceDetail,
} = useRunRecords({ onMessage: showMessage });

const timelineItems = computed(() => {
  const items = [];
  let lastMonth = '';

  const sorted = [...records.value].sort((a, b) => {
    return String(b.createTime || '').localeCompare(String(a.createTime || ''));
  });

  for (const record of sorted) {
    const dateStr = record.createTime || '';
    const yearMonth = dateStr.slice(0, 7);
    const day = dateStr.slice(8, 10);
    const time = dateStr.slice(11, 16);

    if (yearMonth && yearMonth !== lastMonth) {
      items.push({ type: 'month-badge', label: yearMonth });
      lastMonth = yearMonth;
    }

    const distance = (record.runDistance / 1000).toFixed(2);

    items.push({
      type: 'record',
      dateTime: dateStr.slice(0, 16),
      distance,
      duration: record.runTime,
      pace: formatPaceDetail(record.runTime, record.runDistance),
      status: record.runStatus,
      defeatedInfo: record.defeatedInfo,
      statusDotClass:
        record.runStatus === '1' ? 'timeline-dot-valid' : 'timeline-dot-invalid',
    });
  }

  return items;
});

// 生命周期
onMounted(() => {
  // 首次加载
  fetchRecords();
});

// 当全局加载状态结束后刷新记录
watch(
  () => profileLoading.value,
  (v, oldV) => {
    if (oldV === true && v === false) {
      fetchRecords();
    }
  },
);
</script>

<style scoped>
.record-status-badge {
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;
  padding: 2px 10px;
  display: inline-block;
  line-height: 1.5;
}

.status-valid {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}

.status-invalid {
  background: rgba(180, 83, 9, 0.1);
  color: #b45309;
}

.dark .status-valid {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.dark .status-invalid {
  background: rgba(192, 68, 12, 0.15);
  color: #f97316;
}

.record-meta-label {
  color: var(--text-secondary);
}

.record-meta-value {
  color: var(--text-primary);
  line-height: 1.2;
}

.record-meta-distance {
  background: rgba(22, 163, 74, 0.07);
}

.record-meta-duration {
  background: rgba(8, 145, 178, 0.07);
}

.record-meta-pace {
  background: rgba(217, 119, 6, 0.07);
}

.timeline-dot-valid {
  background: #2563eb;
}

.timeline-dot-invalid {
  background: #b45309;
}

.dark .timeline-dot-valid {
  background: #60a5fa;
}

.dark .timeline-dot-invalid {
  background: #f97316;
}
</style>
