<template>
  <div class="app flex flex-col min-h-100vh relative overflow-hidden bg-gray-50">
    <div v-if="!isLogin">
      <LoginPage />
    </div>
    <div v-else>
      <HomePage />
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
</style>