<template>
  <div v-if="notice" class="notice-container">
    <el-alert :title="notice.title" :type="notice.type">
      <div v-html="notice.message" class="notice-message"></div>
    </el-alert>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import useNotice from "@/hooks/notice/useNotice";

const { fetchNotice } = useNotice();
const notice = ref<{ title: string; message: string; type?: string } | null>(null);

onMounted(async () => {
  notice.value = await fetchNotice();
});
</script>

<style scoped>
.notice-container {
  max-width: 500px;
  padding: 5px;
  margin: 0 auto;
}

</style>