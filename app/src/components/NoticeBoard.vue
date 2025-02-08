<template>
    <div v-if="notice?.message" class="notice-board">
      <div class="notice-content" v-html="notice.message"></div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'NoticeBoard'
}
</script>

<script setup lang="ts">
import { onMounted } from "vue";
import { useNotice } from "@/composables/useNotice";

const { notice, fetchNotice } = useNotice();

onMounted(() => {
    fetchNotice();
});
</script>

<style scoped>
.notice-board {
  position: relative;
  position: fixed;
    bottom: 25px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px;
    box-shadow: var(--noticeboard-box-shadow);
    min-width: 300px;
    max-width: 800px;
    color: var(--noticeboard-text-color);
    background-color: var(--noticeboard-bg-color);
    align-items: center;
    text-align: center;
    gap: 12px;
    border-radius: 20px;
    transition:  0.3s ease;
    border: var(--noticeboard-border);
    z-index: 9999;
}


.notice-content {
    flex: 1;
    font-size: 11px;
    line-height: 1;
    color: var(--el-text-color-primary);
}

:deep(p) {
    margin: 0;
    padding: 0;
}

:deep(a) {
    color: var(--el-color-primary);
    text-decoration: none;
    transition: color 0.3s ease;
}

:deep(a:hover) {
    color: var(--el-color-primary-light-3);
}

/* 暗黑模式适配 */
:deep(.dark .notice-board) {
    background-color: var(--el-bg-color-overlay);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}


</style>