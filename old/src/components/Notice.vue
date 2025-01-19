<template>
  <div v-if="notice" class="notice-container">
    <el-alert
      :type="notice.type"
      :closable="false"
      class="notice-alert"
    >
      <div v-html="notice.message" class="notice-message"></div>
    </el-alert>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import address from "@/services/address";

const notice = ref<{ message: string; type?: string } | null>(
  null
);

const fetchNotice = async () => {
  try {
    const response = await axios.get(address.noticeURL);
    if (response.status !== 200) {
      return null;
    }
    const message = response.data.message;
    const type = response.data.type;

    if (!message) {
      return null;
    }

    return {
      message,
      type,
    };
  } catch (error) {
    console.error("获取通知出错：", error);
    return null;
  }
};

onMounted(async () => {
  notice.value = await fetchNotice();
});
</script>

<style scoped>
.notice-container {
  max-width: 500px;
  margin: 0 auto;
  margin-bottom: 5px;
}

.notice-alert {
  padding-bottom: 0;
  padding-top: 0;
  border-radius: 10px;
}

.notice-message {
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}
</style>