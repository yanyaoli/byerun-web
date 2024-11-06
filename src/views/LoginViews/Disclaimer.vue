<template>
  <el-form class="DisclaimerForm">
    <el-space direction="vertical">
      <el-text tag="b" size="large">免责声明</el-text>
      <el-text>使用本项目所产生的任何后果，用户需自行承担。</el-text>
      <el-text>本项目仅供学习交流使用，不得用于任何商业用途。</el-text>
      <el-text>使用本项目即代表你同意以下声明：</el-text>
      <el-text size="small">1. 本项目不对任何数据的准确性、完整性或适用性做出任何保证。</el-text>
      <el-text size="small">2. 用户在使用本项目过程中，应遵守相关法律法规，不得利用本项目从事任何违法活动。</el-text>
      <el-text size="small">3. 本项目的开发者不对因使用本项目而产生的任何直接或间接损失承担责任。</el-text>
      <el-text size="small">4. 用户应自行承担因使用本项目而可能产生的所有风险。</el-text>
      <el-text size="small">5. 本项目的开发者保留随时修改或终止本项目的权利。</el-text>
      <el-link type="primary" :href="githubURL" target="_blank">
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2307" width="20" height="20">
          <path d="M64 512c0 195.2 124.8 361.6 300.8 422.4 22.4 6.4 19.2-9.6 19.2-22.4v-76.8c-134.4 16-140.8-73.6-150.4-89.6-19.2-32-60.8-38.4-48-54.4 32-16 64 3.2 99.2 57.6 25.6 38.4 76.8 32 105.6 25.6 6.4-22.4 19.2-44.8 35.2-60.8-144-22.4-201.6-108.8-201.6-211.2 0-48 16-96 48-131.2-22.4-60.8 0-115.2 3.2-121.6 57.6-6.4 118.4 41.6 124.8 44.8 32-9.6 70.4-12.8 112-12.8 41.6 0 80 6.4 112 12.8 12.8-9.6 67.2-48 121.6-44.8 3.2 6.4 25.6 57.6 6.4 118.4 32 38.4 48 83.2 48 131.2 0 102.4-57.6 188.8-201.6 214.4 22.4 22.4 38.4 54.4 38.4 92.8v112c0 9.6 0 19.2 16 19.2C832 876.8 960 710.4 960 512c0-246.4-201.6-448-448-448S64 265.6 64 512z" fill="#040000" p-id="2308"></path>
        </svg>
      </el-link>
    </el-space>
    <el-button
      type="primary"
      @click="$emit('closeDisclaimer')"
    >返回登录</el-button>
  </el-form>
</template>

<script setup>
</script>

<style scoped>
</style>