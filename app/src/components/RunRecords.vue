<template>
  <div class="flex-1 flex flex-col h-full relative w-full box-border">
    <div class="flex-1 relative flex flex-col overflow-hidden">
      <div v-if="records.length > 0 || loading" class="overflow-y-auto flex-1" ref="scrollableListRef">
        <div class="flex flex-col gap-3">
          <div v-for="(record, index) in loading ? Array(5).fill(null) : records" :key="loading ? index : record.key"
            class="bg-white rounded-lg overflow-hidden border border-gray-200 mb-4 transition-shadow p-0 flex flex-col">
            <div
              class="flex justify-between items-center bg-gray-100 border-b border-gray-200 rounded-t-lg px-4 pt-4 pb-2">
              <div class="text-gray-800 font-semibold text-base">
                <span v-if="!loading">{{ formatCreateTime(record.createTime) }}</span>
                <div v-else class="inline-block bg-gray-200 rounded animate-pulse" style="width: 140px; height: 20px">
                </div>
              </div>
              <div class="text-sm text-gray-700 flex items-center">
                <span v-if="!loading" class="defeated-info" :class="[
                  record.runStatus === '1'
                    ? 'status-success-bg'
                    : 'status-error-bg',
                ]">{{ record.defeatedInfo }}</span>
                <div v-else class="inline-block bg-gray-200 rounded-full animate-pulse"
                  style="width: 60px; height: 20px"></div>
              </div>
            </div>
            <div class="flex justify-between items-center px-4 py-1.5 border-b border-gray-100 text-sm">
              <div class="text-gray-500 text-sm">跑步里程</div>
              <div class="text-gray-700 text-sm font-medium text-right min-w-[60px]">
                <span v-if="!loading">{{ (record.runDistance / 1000).toFixed(2) }}km</span>
                <div v-else class="inline-block bg-gray-200 rounded animate-pulse" style="width: 80px; height: 16px">
                </div>
              </div>
            </div>
            <div class="flex justify-between items-center px-4 py-1.5 border-b border-gray-100 text-sm">
              <div class="text-gray-500 text-sm">跑步时长</div>
              <div class="text-gray-700 text-sm font-medium text-right min-w-[60px]">
                <span v-if="!loading">{{ record.runTime }}分钟</span>
                <div v-else class="inline-block bg-gray-200 rounded animate-pulse" style="width: 80px; height: 16px">
                </div>
              </div>
            </div>
            <div class="flex justify-between items-center px-4 py-1.5 border-b border-gray-100 text-sm">
              <div class="text-gray-500 text-sm">平均配速</div>
              <div class="text-gray-700 text-sm font-medium text-right min-w-[60px]">
                <span v-if="!loading">{{ formatPaceDetail(record.runTime, record.runDistance) }}</span>
                <div v-else class="inline-block bg-gray-200 rounded animate-pulse" style="width: 80px; height: 16px">
                </div>
              </div>
            </div>
          </div>
          <div class="py-1 text-center">
            <button class="bg-transparent text-blue-500 text-sm px-4 py-2 disabled:opacity-50 cursor-pointer"
              @click="loadMoreRecords" :disabled="isLoading">
              {{ isLoading ? "加载中..." : "加载更多" }}
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="flex items-center justify-center flex-1">
        <h3 class="text-gray-500 text-base">暂无跑步记录</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject, onUnmounted, watch } from "vue";
import { useRunRecords } from "@/composables/useRunRecords";

// 注入全局消息方法
const showMessage = inject("showMessage");

const props = defineProps({
  runInfo: {
    type: Object,
    default: null,
  },
  runStandard: {
    type: Object,
    default: null,
  },
  userInfo: {
    type: Object,
    default: null,
  },
  activityInfo: {
    type: Object,
    default: null,
  },
  profileLoading: {
    type: Boolean,
    default: false,
  },
});

// 使用 composable 管理记录逻辑
const {
  records,
  loading,
  pagination,
  isLoading,
  fetchRecords,
  loadMoreRecords,
  formatCreateTime,
  formatPaceDetail,
} = useRunRecords({ pageSize: 10, onMessage: showMessage });

// 生命周期
onMounted(() => {
  // 首次加载
  fetchRecords();
});

// 当父组件（HomePage）刷新用户数据后会结束 profileLoading，监听该变化来触发记录刷新
watch(() => props.profileLoading, (v, oldV) => {
  if (oldV === true && v === false) {
    fetchRecords();
  }
});
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
  color: #fff;
}

.status-success-bg {
  background: #3b9eff;
  color: #fff;
}

.status-error-bg {
  background: #f2713e;
  color: #fff;
}

.status-invalid-bg {
  background: #b0b0b0;
  color: #fff;
}
</style>
