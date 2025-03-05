<template>
  <el-card
    class="records-card"
    v-loading="loading"
    element-loading-text="记录加载中"
  >
    <div class="records-list">
      <el-skeleton :loading="loading" animated :count="10">
        <template #template>
          <div style="padding: 2px">
            <el-skeleton-item variant="p" style="width: 100%; height: 5px" />
          </div>
        </template>
        <template #default>
          <el-table
            :data="records"
            v-if="records.length > 0"
            table-layout="auto"
            border
            stripe
            :height="calculatedTableHeight"
            style="width: 100%"
          >
            <el-table-column
              prop="recordDate"
              label="记录时间"
              fixed
              sortable
              align="center"
            />
            <el-table-column prop="defeatedInfo" label="状态" align="center">
              <template #default="{ row }">
                <div class="status-container">
                  <el-icon :style="{ color: row.defeatedInfo === '有效跑步' ? '#409EFF' : '#F56C6C' }">
                    <component :is="row.defeatedInfo === '有效跑步' ? SuccessFilled : CircleCloseFilled" />
                  </el-icon>
                  {{ row.defeatedInfo }}
                </div>
              </template>
            </el-table-column>
            <el-table-column type="expand" min-width="10" label="更多" align="center">
              <template #default="{ row }">
                <el-form label-position="left" inline class="expanded-form">
                  <el-form-item label="跑步时长">
                    {{ row.runTime }} 分钟
                  </el-form-item>
                  <el-form-item label="跑步里程">
                    {{ (row.runDistance / 1000).toFixed(2) }} 公里
                  </el-form-item>
                  <el-form-item label="平均配速">
                    {{ formatPace(row.runTime, row.runDistance) }}
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无跑步记录" />
        </template>
      </el-skeleton>
    </div>

    <el-pagination
      class="pagination"
      :current-page="pagination.current"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      layout="pager"
      @current-change="handlePageChange"
      small
    />
  </el-card>
</template>

<style scoped>
.records-card {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0;
  background-color: var(--records-card-bg-color);
  box-shadow: none;
  border: none;
  color: var(--el-text-color-primary);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.records-card :deep(.el-card__body) {
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.records-list {
  width: 100%;
  height: 100%;
  flex-grow: 1; /* 让表格列表占据剩余空间 */
  overflow: auto; /* Add overflow auto to enable scrolling */
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 15px;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0; /* Prevent pagination from shrinking */
}

:deep(.el-pagination) {
  width: 100%;
  justify-content: center;
}

.status-container {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.status-container .el-icon {
  font-size: 16px;
}

.expanded-form {
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.expanded-form :deep(.el-form-item) {
  margin: 0;
  flex: 1;
  min-width: 120px;
}

.expanded-form :deep(.el-form-item__label) {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.expanded-form :deep(.el-form-item__content) {
  font-size: 13px;
}

/* 表格样式优化 */
:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-light);
  --el-table-header-background-color: var(--el-fill-color-light);
  width: 100% !important;
  font-size: 14px;
}

:deep(.el-table__cell) {
  padding: 8px 4px !important;
  white-space: nowrap;
}

:deep(.el-table__expand-icon) {
  margin-right: 0;
}

:deep(.el-table__inner-wrapper) {
  width: 100%;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
  width: 100%;
}

/* 移动端适配 */
@media screen and (max-width: 480px) {
  :deep(.el-table) {
    font-size: 13px;
  }

  :deep(.el-table__cell) {
    padding: 6px 2px !important;
  }

  /* 状态列样式 */
  .status-container {
    font-size: 12px;
    gap: 4px;
  }

  .status-container .el-icon {
    font-size: 14px;
  }

  /* 展开行样式 */
  .expanded-form {
    padding: 6px;
    gap: 4px;
  }

  .expanded-form :deep(.el-form-item) {
    min-width: 100px;
  }

  .expanded-form :deep(.el-form-item__label),
  .expanded-form :deep(.el-form-item__content) {
    font-size: 12px;
  }

  /* 分页样式 */
  .pagination {
    padding: 8px 0;
  }

  :deep(.el-pagination) {
    font-size: 12px;
  }

  :deep(.el-pagination .btn-prev),
  :deep(.el-pagination .btn-next) {
    min-width: 24px;
  }

  :deep(.el-pagination .el-pager li) {
    min-width: 24px;
  }
}

/* 暗色模式适配 */
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
  background-color: var(--el-table-row-hover-bg-color);
}
</style>

<script setup lang="ts">
import { computed } from 'vue';
import { SuccessFilled, CircleCloseFilled } from "@element-plus/icons-vue";
import { formatPace } from "@/utils/format";
import type { RunRecord } from "@/types/run";

interface Pagination {
  current: number;
  total: number;
  pageSize: number;
}

interface Props {
  records: RunRecord[];
  loading: boolean;
  pagination: Pagination;
}

interface Emits {
  (e: 'pageChange', page: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 假设导航栏高度为 60px，菜单栏高度为 50px，翻页栏高度为 50px
const navbarHeight = 50;
const menuHeight = 50;
const paginationHeight = 50;

const calculatedTableHeight = computed(() => {
  return window.innerHeight - navbarHeight - menuHeight - paginationHeight;
});

const handlePageChange = (page: number) => {
  emit('pageChange', page);
};
</script>