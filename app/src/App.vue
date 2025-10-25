<template>
  <div>
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
const pageTitle = ref("提交记录");

// 全局消息方法
const showMessage = (message, type = "info") => {
  messageRef.value?.show(message, type);
};

// 提供给子组件使用
provide('showMessage', showMessage);
</script>

<style>
/* 全局重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  background: #f6f7f9;
  font-family: "Segoe UI", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif;
  color: #2d3a3f;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
</style>