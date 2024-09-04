<template>
  <el-header>
    <div class="header">
      <div class="header-logo">
        <img class="header-logo-image" src="@/assets/logo.png" alt="logo" />
        <span class="header-logo-text">Byerun</span>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleDownload" color="#0a74fe">下载App</el-button>
        <el-button type="text">登录</el-button>
      </div>
    </div>
  </el-header>
</template>
<script setup>
import { ref } from 'vue';
import address from '@/services/address';

const downloadURL = ref(address.downloadURL);

const handleDownload = () => {
  window.open(downloadURL.value, '_blank');
};
</script>
<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
}

.header-logo {
  display: flex;
  align-items: center;
}

.header-logo-image {
  width: 40px;
  height: 40px;
  margin-right: 0.5rem;
}

.header-logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>