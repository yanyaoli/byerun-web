<template>
  <header class="page-header">
    <h1 class="page-title">{{ title }}</h1>
  </header>
</template>

<script setup lang="ts">
// 直接调用 defineProps 宏，避免声明未使用的本地变量
defineProps({
  title: { type: String, default: '' }
});
</script>

<style scoped>
.page-header {
  flex: none;
  background: #fff;
  padding: 12px 16px;
  border-bottom: 1px solid #e3e6e8;
  text-align: center;
  z-index: 100;
  /* span the full viewport width but keep inner content constrained */
  position: fixed;
  left: 0;
  top: 0;
  height: var(--app-header-height, 56px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3a3f;
  margin: 0;
}

/* inner wrapper to constrain content width when header spans viewport */
.page-header > .page-title {
  max-width: 420px;
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
}

/* Always constrain the fixed header to the same centered max-width as .app-layout.
   For fixed elements, setting left:0; right:0; margin:auto; with a max-width centers them. */
.page-header {
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 100%;
  max-width: 420px;
}
</style>
