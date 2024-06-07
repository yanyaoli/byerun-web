<template>
  <header class="header">
    <img :src="logoSrc"
         class="logo" />
    <h2>UNIRUN HELPER</h2>
  </header>
  <div style="height: 30px"></div>
</template>

<script setup>
import { ref } from "vue";
import logo from "../../file/logo.svg";

const logoSrc = ref(logo);
</script>

<style scoped>
.header {
  box-shadow: 0 2px 4px #00000014;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1002;
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  padding: 0 24px;
  width: 100%;
  height: 60px;
  margin-bottom: 20px;
}

.logo {
  max-height: 30px;
  cursor: pointer;
}

h2 {
  font-family: PingFang SC, Helvetica Neue, Microsoft YaHei, sans-serif;
  font-size: 1.5em;
  font-weight: 500;
  color: #121314;
  margin-left: 5px;
}
</style>
