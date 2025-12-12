<template>
  <div class="w-full px-4">
    <!-- 用户信息卡片 -->
    <div class="border border-black/8 rounded-3xl p-4 mb-6 ">
      <div class="flex justify-between items-center gap-[16]">
        <div
          class="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-2xl font-bold text-white overflow-hidden relative transition-all duration-700 ease-in-out hover:rotate-[360deg] mr-4">
          <component :is="userInfo?.gender == '2' ? FemaleAvatar : userInfo?.gender == '1' ? MaleAvatar : null" />
          <span v-if="userInfo?.gender != '1' && userInfo?.gender != '2'">{{ userInfo?.studentName?.charAt(0) || "U"
            }}</span>
        </div>
        <div class="flex-1">
          <h2 class="text-lg font-semibold text-gray-800 mb-1">
            <span v-if="loading" class="inline-block h-[22px] w-[50px] bg-gray-300 rounded animate-pulse mb-2"></span>
            <span v-else>{{ userInfo?.studentName || "用户" }}</span>
          </h2>
          <p class="text-sm text-gray-500">
            <span v-if="loading" class="inline-block h-[15px] w-[80px] bg-gray-300 rounded animate-pulse"></span>
            <span v-else>{{ userInfo?.registerCode || "-" }}</span>
          </p>
        </div>
        <button
          class="text-sm cursor-pointer transition-colors duration-200 outline-none inline-flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2 rounded-full font-semibold transition-all duration-150 border-none cursor-pointer outline-none self-center shadow-none hover:bg-red-100 hover:text-red-700"
          @click="handleLogout">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-log-out" aria-hidden="true">
            <path d="m16 17 5-5-5-5"></path>
            <path d="M21 12H9"></path>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          </svg>
          登出
        </button>
      </div>
    </div>
    <!-- 社交链接 -->
    <!-- <div class="flex justify-center gap-6 rounded-3xl p-4 mb-4">
      <a v-for="link in socialLinks" :key="link.href" :href="link.href"
        :target="link.href.startsWith('http') ? '_blank' : undefined"
        :rel="link.href.startsWith('http') ? 'noopener noreferrer' : undefined"
        class="flex items-center justify-center rounded-full text-gray-600 transition-all duration-300 bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:text-blue-500 hover:shadow-lg hover:bg-white "
        :title="link.title">
        <i :class="link.icon + ' w-6 h-6 sm:w-5 sm:h-5'"></i>
      </a>
    </div> -->
    <!-- 评论区 -->
    <div class="artalk-container" ref="artalkContainer"></div>

  </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import Artalk from "artalk";
import "artalk/dist/Artalk.css";
import MaleAvatar from "./Avatar/MaleAvatar.vue";
import FemaleAvatar from "./Avatar/FemaleAvatar.vue";
import { config } from "../utils/config";

defineProps({
  userInfo: Object,
  loading: Boolean
});

// 注入全局消息方法
const showMessage = inject('showMessage');
const artalkContainer = ref(null);

const emit = defineEmits(['logout']);

const handleLogout = () => {
  showMessage("已退出登录", "info");
  emit("logout");
};

onMounted(() => {
  if (artalkContainer.value) {
    new Artalk({
      el: artalkContainer.value,
      pageKey: "/profile",
      pageTitle: "个人主页",
      server: config.api.artalkServer || "https://artalk.example.com",
      site: config.api.artalkSite || "Byerun",
    });
  }
});
</script>

<style scoped>
</style>