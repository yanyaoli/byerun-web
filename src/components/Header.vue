<template>
  <div class="header">
    <div class="header-logo">
      <img class="header-logo-image" src="@/assets/logo.png" alt="logo" />
      <span class="header-logo-text">Byerun</span>
    </div>
    <div class="header-github">
      <el-button type="text" @click="goGitHub" class="github-button">
        <svg
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
        >
          <path
            d="M64 512c0 195.2 124.8 361.6 300.8 422.4 22.4 6.4 19.2-9.6 19.2-22.4v-76.8c-134.4 16-140.8-73.6-150.4-89.6-19.2-32-60.8-38.4-48-54.4 32-16 64 3.2 99.2 57.6 25.6 38.4 76.8 32 105.6 25.6 6.4-22.4 19.2-44.8 35.2-60.8-144-22.4-201.6-108.8-201.6-211.2 0-48 16-96 48-131.2-22.4-60.8 0-115.2 3.2-121.6 57.6-6.4 118.4 41.6 124.8 44.8 32-9.6 70.4-12.8 112-12.8 41.6 0 80 6.4 112 12.8 12.8-9.6 67.2-48 121.6-44.8 3.2 6.4 25.6 57.6 6.4 118.4 32 38.4 48 83.2 48 131.2 0 102.4-57.6 188.8-201.6 214.4 22.4 22.4 38.4 54.4 38.4 92.8v112c0 9.6 0 19.2 16 19.2C832 876.8 960 710.4 960 512c0-246.4-201.6-448-448-448S64 265.6 64 512z"
            fill="#040000"
          ></path>
        </svg>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import address from "@/services/address";

const { githubURL } = address;

const goGitHub = () => {
  window.open(githubURL, "_blank");
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em 0;
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
  width: 35px;
  height: 30px;
  margin-left: 1rem;
}

.header-logo-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.github-button {
  height: 100%;
  padding: 0;
  margin-right: 1rem;
}

.icon {
  fill: currentColor;
}
</style>
