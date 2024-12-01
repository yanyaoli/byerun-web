<template>
  <Header />
  <div class="main-section">
    <h1 class="title">同学 你好</h1>
    <p class="subtitle">欢迎使用校园跑助手</p>
    <button class="start-btn" @click="getStarted">立即开始</button>
  </div>
</template>

<script setup>
import "@/styles/home/index.css";
import { useRouter } from 'vue-router';
import Header from '@/components/Header.vue';

const router = useRouter();

const getStarted = () => {
  router.push('/dashboard');
};
</script>

<style scoped>

</style>
