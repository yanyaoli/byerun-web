<template>
  <div class="app flex flex-col min-h-100vh relative overflow-hidden bg-gray-50">
    <div class="app-container">
      <div v-if="!isLogin">
        <LoginPage />
      </div>
      <div v-else>
        <HomePage />
      </div>
    </div>
    <Message ref="messageRef" />
  </div>
</template>

<script setup>
import { ref, provide } from "vue";
import LoginPage from "./views/LoginPage.vue";
import HomePage from "./views/HomePage.vue";
import Message from "./components/Message.vue";

const isLogin = ref(!!localStorage.getItem("token"));
const messageRef = ref(null);

// 全局消息方法
const showMessage = (message, type = "info") => {
  messageRef.value?.show(message, type);
};

// 提供给子组件使用
provide('showMessage', showMessage);
</script>

<style scoped>
.app-container {
  width: 100%;
  margin: 0 auto;
  padding: 0 12px;
}

@media (min-width: 768px) {
  .app-container {
    max-width: 480px;
  }
}
</style>