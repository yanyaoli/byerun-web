<!-- src/components/CommonLayout.vue -->
<template>
    <el-container class="common-layout">
      <el-header class="common-header">
        <slot name="header">Header</slot>
      </el-header>
      <el-main class="common-main">
        <slot>Main</slot>
      </el-main>
      <el-footer class="common-footer">
        <slot name="footer">Footer</slot>
      </el-footer>
    </el-container>
  </template>
  
  <script>
  export default {
    name: 'CommonLayout'
  };
  </script>
  
  <style scoped>
  .common-layout {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 20px;
    margin: 30px auto;
    font-family: Arial, sans-serif;
    align-items: center;
    max-width: 1200px;
  }
  
  .common-header,
  .common-footer {
    background-color: #fff;
    padding: 10px;
    width: 100%;
  }
  
  .common-main {
    width: 100%;
  }
  </style>
  