<template>
  <div class="header">
    <el-icon><LogoIcon class="logo" /></el-icon>
    <div class="theme-toggle" @click="toggleTheme">
      <el-icon v-if="!isDarkMode"><MoonIcon /></el-icon>
      <el-icon v-else><SunnyIcon /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { LogoIcon, MoonIcon, SunnyIcon } from '@/components/icons';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const isDarkMode = ref(userStore.$state.isDarkMode);

const toggleTheme = () => {
  userStore.toggleDarkMode();
  isDarkMode.value = userStore.$state.isDarkMode;
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  padding: 10px 5px;
}

.theme-toggle {
  cursor: pointer;
}
</style>