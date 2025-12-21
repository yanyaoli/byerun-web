<template>
  <div class="records-container">
    <!-- 内容区包装器 -->
    <div class="records-content-wrapper">
      <!-- 记录列表（每条为一个卡片，列表形式，表头左右布局） -->
      <div
        v-if="records.length > 0 || loading"
        class="records-content scrollable-list"
        ref="scrollableListRef"
      >
        <div class="records-list">
          <div
            v-for="(record, index) in loading ? Array(5).fill(null) : records"
            :key="loading ? index : record.key"
            class="record-item record-list-card"
          >
            <div class="record-list-title record-list-title-bar">
              <div class="record-list-title-left">
                <span v-if="!loading">{{ formatCreateTime(record.createTime) }}</span>
                <div v-else class="skeleton-block" style="width: 140px; height: 20px"></div>
              </div>
              <div class="record-list-title-right">
                <span
                  v-if="!loading"
                  class="defeated-info"
                  :class="[
                    record.runStatus === '1'
                      ? 'status-success-bg'
                      : 'status-error-bg',
                  ]"
                  >{{ record.defeatedInfo }}</span
                >
                <div v-else class="skeleton-block" style="width: 60px; height: 20px; border-radius: 12px"></div>
              </div>
            </div>
            <div class="record-list-row">
              <div class="record-list-label">跑步里程</div>
              <div class="record-list-value">
                <span v-if="!loading">{{ (record.runDistance / 1000).toFixed(2) }}km</span>
                <div v-else class="skeleton-block" style="width: 80px; height: 16px"></div>
              </div>
            </div>
            <div class="record-list-row">
              <div class="record-list-label">跑步时长</div>
              <div class="record-list-value">
                <span v-if="!loading">{{ record.runTime }}分钟</span>
                <div v-else class="skeleton-block" style="width: 80px; height: 16px"></div>
              </div>
            </div>
            <div class="record-list-row">
              <div class="record-list-label">平均配速</div>
              <div class="record-list-value">
                <span v-if="!loading">{{ formatPaceDetail(record.runTime, record.runDistance) }}</span>
                <div v-else class="skeleton-block" style="width: 80px; height: 16px"></div>
              </div>
            </div>
          </div>
          <div class="load-more">
            <button
              class="load-more-btn"
              @click="loadMoreRecords"
              :disabled="isLoading"
            >
              {{ isLoading ? "加载中..." : "加载更多" }}
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <h3>暂无跑步记录</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject, onUnmounted } from "vue";
import { api } from "@/composables/useApi";

// 注入全局消息方法
const showMessage = inject("showMessage");

defineProps({
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

// 响应式数据
const records = ref([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
const isLoading = ref(false);

// 数据获取
const fetchRecords = async () => {
  loading.value = true;
  pagination.current = 1; // 保证第一页
  try {
    const { data } = await api.getRunRecords(
      pagination.current,
      pagination.pageSize
    );

    const recordsList = Array.isArray(data.response)
      ? data.response
      : data.response?.records || [];

    records.value = recordsList.map((record) => ({
      ...record,
      key: record.recordId,
      runDistance: Number(record.runValidDistance || record.runDistance),
      runTime: Number(record.runValidTime || record.runTime),
      runSpeed: record.runStatus === "1" ? Number(record.runSpeed) : 0,
    }));

    pagination.total = data.response?.total || records.value.length || 0;
  } catch (error) {
    console.error("获取跑步记录失败:", error);
    records.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 格式化创建时间
function formatCreateTime(createTime) {
  if (!createTime) return "";
  // 只保留到分钟
  return createTime.slice(0, 16);
}

// 平均配速格式 xx'xx''
function formatPaceDetail(time, distance) {
  if (!distance || !time) return "0'00''";
  const pace = time / (distance / 1000);
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60)
    .toString()
    .padStart(2, "0");
  return `${min}'${sec}''`;
}

// 加载更多记录
const loadMoreRecords = async () => {
  if (isLoading.value) return;
  isLoading.value = true;

  try {
    const nextPage = pagination.current + 1;
    const { data } = await api.runRecord.getRecords(
      pagination.current,
      pagination.pageSize
    );

    const recordsList = Array.isArray(data.response)
      ? data.response
      : data.response?.records || [];

    // 如果返回了数据，就添加到列表中
    if (recordsList.length > 0) {
      const newRecords = recordsList.map((record) => ({
        ...record,
        key: record.recordId,
        runDistance: Number(record.runValidDistance || record.runDistance),
        runTime: Number(record.runValidTime || record.runTime),
        runSpeed: record.runStatus === "1" ? Number(record.runSpeed) : 0,
      }));

      records.value = [...records.value, ...newRecords];
      pagination.current = nextPage;
    } else {
      // 没有更多数据时显示提示
      showMessage("没有更多数据了", "info");
    }
  } catch (error) {
    showMessage("加载更多记录失败", "error");
  } finally {
    isLoading.value = false;
  }
};

// 生命周期
onMounted(() => {
  fetchRecords();
  try {
    window.addEventListener("run-submitted", fetchRecords);
  } catch (e) {}
});

onUnmounted(() => {
  try {
    window.removeEventListener("run-submitted", fetchRecords);
  } catch (e) {}
});
</script>

<style scoped>
/* 容器基础样式 */
.records-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

/* 内容区包装器 */
.records-content-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 可滚动列表 */
.scrollable-list {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 记录列表容器 */
.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 骨架屏块样式 */
.skeleton-block {
  display: inline-block;
  background: #e3e6e8;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.records-content {
  padding-bottom: 0;
}

.record-item {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e3e6e8;
  margin-bottom: 16px;
  transition: box-shadow 0.2s;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.record-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px 12px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
  background: #fff;
  border: 1px solid #e3e6e8;
}
.record-main-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.record-date-main {
  font-size: 16px;
  font-weight: 600;
  color: #2d3a3f;
}
.record-main-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.defeated-info {
  font-size: 12px;
  margin-right: 0;
  font-weight: 500;
  border-radius: 12px;
  padding: 2px 12px;
  display: inline-block;
  min-width: 48px;
  text-align: center;
  line-height: 1.6;
  /* 默认灰色背景 */
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
.expand-arrow {
  font-size: 14px;
  color: #b0b0b0;
  transition: transform 0.2s;
  display: inline-block;
}
.expand-arrow.rotated {
  transform: rotate(180deg);
}

.record-details {
  background: #f8fafb;
  border-top: 1px solid #e3e6e8;
  padding: 12px 16px 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  color: #4f6d7a;
}
.detail-item label {
  color: #7b8a8b;
  font-size: 14px;
  margin-right: 8px;
}

/* 摘要统计合并卡片样式 */
.stat-card-merged {
  padding: 0;
  border-radius: 12px;
  box-shadow: none;
  background: #fff;
  border: 1px solid #e3e6e8;
  margin-bottom: 12px;
}
.stat-merged-row {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  padding: 16px 0;
}
.stat-merged-item {
  flex: 1;
  text-align: center;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.stat-merged-item:last-child {
  border-right: none;
}

/* 表格样式 */
.records-table {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e3e6e8;
  margin-bottom: 16px;
}
.records-table-header {
  display: flex;
  background: #f6f7f9;
  font-weight: 600;
  font-size: 15px;
  color: #4f6d7a;
  border-bottom: 1px solid #e3e6e8;
  padding: 0 8px;
}
.records-table-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  font-size: 15px;
  color: #4f6d7a;
  padding: 0 8px;
  align-items: center;
}
.records-table-row:last-child {
  border-bottom: none;
}
.table-cell {
  flex: 1;
  padding: 12px 4px;
  text-align: center;
  word-break: break-all;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.records-table-header .table-cell {
  padding: 10px 4px;
}

.record-list-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3a3f;
  padding: 16px 16px 8px 16px;
}

/* 新增：表头左右布局和背景色 */
.record-list-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f6f7fa;
  border-bottom: 1px solid #e3e6e8;
  border-radius: 10px 10px 0 0;
  /* 与 .record-list-title 保持一致的 padding，确保骨架和真实卡片一致 */
  padding: 16px 16px 8px 16px;
  margin-bottom: 0;
}
.record-list-title-left {
  font-size: 16px;
  font-weight: 600;
  color: #2d3a3f;
}
.record-list-title-right {
  font-size: 14px;
  font-weight: normal;
  color: inherit;
  display: flex;
  align-items: center;
}

.record-list-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px;
  font-size: 15px;
  border-bottom: 1px solid #f0f0f0;
}
.record-list-row:last-child {
  border-bottom: none;
}
.record-list-label {
  color: #7b8a8b;
  font-size: 14px;
}
.record-list-value {
  color: #4f6d7a;
  font-size: 15px;
  font-weight: 500;
  text-align: right;
  min-width: 60px;
}

/* 适配移动端表格 */
@media (max-width: 375px) {
  .stat-card-merged {
    margin-bottom: 8px;
  }
  .stat-merged-row {
    padding: 10px 0;
  }
  .records-table-header .table-cell,
  .records-table-row .table-cell {
    font-size: 12px;
    padding: 8px 2px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 安全区域适配 */
@supports (padding: max(0px)) {
  .records-content {
    padding-bottom: max(20px, env(safe-area-inset-bottom));
  }
}

/* 加载更多按钮样式 */
.load-more {
  padding: 5px 0;
  text-align: center;
}

.load-more-btn {
  background: transparent;
  border: none;
  color: #3b9eff;
  font-size: 14px;
  padding: 8px 16px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.load-more-btn:active {
  opacity: 0.7;
}
</style>
