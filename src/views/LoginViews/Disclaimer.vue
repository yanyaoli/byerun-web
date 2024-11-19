<template>
  <el-header>
    <h1>Byerun</h1>
  </el-header>
  <el-main>
    <el-form class="DisclaimerForm">
      <el-space direction="vertical">
        <el-text
          >本项目仅供学习研究使用，不得用于任何商业目的或非法用途，如需体验完整功能，请使用官方App。</el-text
        >
        <el-text
          >因使用本项目而造成的任何性质的直接、间接风险损害，由使用者自行承担，开发者对于使用者的违法行为不承担任何责任。
          </el-text
        >
      </el-space>
      <el-button type="primary" @click="$emit('closeDisclaimer')"
        >返回登录</el-button
      >
    </el-form>
  </el-main>
</template>

<script setup>
</script>

<style scoped>
.DisclaimerForm {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  margin: auto;
}

.el-space {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px 20px;
  scrollbar-width: none;
}
</style>