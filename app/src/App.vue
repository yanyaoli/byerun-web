<template>
  <div class="app flex flex-col">
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
.app {
  min-height: 100vh;
  background-color: rgb(255, 250, 250);
  color: #333;
    position: relative;
  overflow: hidden;
}

/* 柔和格子背景 */
.app::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(0deg, transparent 24%, rgba(180, 170, 150, 0.08) 25%, rgba(180, 170, 150, 0.08) 26%, transparent 27%, transparent 74%, rgba(180, 170, 150, 0.08) 75%, rgba(180, 170, 150, 0.08) 76%, transparent 77%, transparent),
    linear-gradient(90deg, transparent 24%, rgba(180, 170, 150, 0.08) 25%, rgba(180, 170, 150, 0.08) 26%, transparent 27%, transparent 74%, rgba(180, 170, 150, 0.08) 75%, rgba(180, 170, 150, 0.08) 76%, transparent 77%, transparent);
  background-size: 80px 80px;
  pointer-events: none;
  z-index: 1;
}

/* 内容区域 */
.app>div {
  position: relative;
  z-index: 2;
}
</style>