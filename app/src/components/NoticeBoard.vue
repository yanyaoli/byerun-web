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
    margin-bottom: 24px;
    padding: 12px;
    background-color: var(--el-color-warning-light-8);
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-light-8);
    display: flex;
    align-items: center;
    text-align: center;
    gap: 12px;
}

.notice-content {
    flex: 1;
    font-size: 13px;
    line-height: 1.2;
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