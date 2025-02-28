<template>
  <div v-if="notice?.message" class="notice-board">
    <div class="notice-content" v-html="notice.message"></div>
  </div>
</template>

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
  width: 100%;
  max-width: 600px;
  padding: 8px 0;
  text-align: center;
  border: none;
  margin: 0 auto;
}

.notice-content {
  font-size: 12px;
  line-height: 1.4;
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

@media screen and (max-width: 480px) {
  .notice-board {
    padding: 6px 8px;
  }

  .notice-content {
    font-size: 11px;
    line-height: 1.3;
  }
}
</style>