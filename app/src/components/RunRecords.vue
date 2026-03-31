<template>
  <div class="relative w-full box-border">
    <div class="relative flex flex-col">
      <div v-if="records.length > 0 || loading" class="w-full" ref="scrollableListRef">
        <div class="flex flex-col gap-3">
          <div
            v-for="(record, index) in loading ? Array(5).fill(null) : records"
            :key="loading ? index : record.key"
            class="bg-white/5 border border-white/8 rounded-2xl overflow-hidden mb-4 transition-shadow p-0 flex flex-col"
          >
            <div
              class="flex justify-between items-center bg-white/5 border-b border-white/8 rounded-t-lg px-4 pt-4 pb-2"
            >
              <div class="text-slate-300 font-semibold text-base">
                <span v-if="!loading">{{ formatCreateTime(record.createTime) }}</span>
                <div
                  v-else
                  class="inline-block bg-white/5 rounded animate-pulse"
                  style="width: 140px; height: 20px"
                ></div>
              </div>
              <div class="text-sm flex items-center text-slate-300">
                <span
                  v-if="!loading"
                  class="defeated-info"
                  :class="[record.runStatus === '1' ? 'status-success-bg' : 'status-error-bg']"
                  >{{ record.defeatedInfo }}</span
                >
                <div
                  v-else
                  class="inline-block bg-white/5 rounded-full animate-pulse"
                  style="width: 60px; height: 20px"
                ></div>
              </div>
            </div>
            <div
              class="flex justify-between items-center px-4 py-1.5 border-b border-gray-50/10 text-sm"
            >
              <div class="text-gray-400 text-sm">跑步里程</div>
              <div class="text-gray-400 text-sm font-medium text-right min-w-[60px]">
                <span v-if="!loading">{{ (record.runDistance / 1000).toFixed(2) }}km</span>
                <div
                  v-else
                  class="inline-block bg-white/5 rounded animate-pulse"
                  style="width: 80px; height: 16px"
                ></div>
              </div>
            </div>
            <div
              class="flex justify-between items-center px-4 py-1.5 border-b border-gray-50/10 text-sm"
            >
              <div class="text-gray-400 text-sm">跑步时长</div>
              <div class="text-gray-400 text-sm font-medium text-right min-w-[60px]">
                <span v-if="!loading">{{ record.runTime }}分钟</span>
                <div
                  v-else
                  class="inline-block bg-white/5 rounded animate-pulse"
                  style="width: 80px; height: 16px"
                ></div>
              </div>
            </div>
            <div class="flex justify-between items-center px-4 py-1.5 text-sm">
              <div class="text-gray-400 text-sm">平均配速</div>
              <div class="text-gray-400 text-sm font-medium text-right min-w-[60px]">
                <span v-if="!loading">{{
                  formatPaceDetail(record.runTime, record.runDistance)
                }}</span>
                <div
                  v-else
                  class="inline-block bg-white/5 rounded animate-pulse"
                  style="width: 80px; height: 16px"
                ></div>
              </div>
            </div>
          </div>
          <div class="py-1 text-center">
            <button
              class="bg-transparent text-blue-500 text-sm px-4 py-2 disabled:opacity-50 cursor-pointer"
              @click="loadMoreRecords"
              :disabled="isLoading"
            >
              {{ isLoading ? '加载中...' : '加载更多' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="flex items-center justify-center py-10 w-full">
        <h3 class="text-gray-400 text-base">暂无跑步记录</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, inject, watch } from 'vue';
import { useRunRecords } from '@/composables/useRun';
import { useDataStore } from '@/composables/useDataStore';

// 注入全局消息方法
const showMessage = inject('showMessage');
const { loading: profileLoading } = useDataStore();

// 使用 composable 管理记录逻辑
const {
  records,
  loading,
  isLoading,
  fetchRecords,
  loadMoreRecords,
  formatCreateTime,
  formatPaceDetail,
} = useRunRecords({ onMessage: showMessage });

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
.defeated-info {
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
  padding: 2px 12px;
  display: inline-block;
  min-width: 48px;
  text-align: center;
  line-height: 1.6;
  background: #b0b0b0;
}

.status-success-bg {
  background: #2440bd;
}

.status-error-bg {
  background: #72290c;
}

.status-invalid-bg {
  background: #b0b0b0;
}
</style>
