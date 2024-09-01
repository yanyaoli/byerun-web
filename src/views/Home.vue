<template>
  <div class="container">
    <!-- <Header /> -->
    <main>
      <h1>{{ title }}</h1>
      <p style="font-weight: 500; font-size: 2.2em">{{ intro }}</p>
      <p>
        <a :href="downloadURL" class="btn"
           target="_blank">立即下载</a> |
        <router-link to="/login"
                     class="btn">开始使用</router-link>
      </p>
      <br />
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import address from "@/services/address";

const title = ref("同学 你好");
const intro = ref("欢迎使用校园跑助手");
const downloadURL = address.downloadURL;
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 100px);
}

main {
  font-family: 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: calc(10px + 0.33vw);
  -webkit-font-smoothing: antialiased;
  padding: 5vh 10vw;
  color: #121314;
  margin: 0 auto;
  text-align: center;
}

h1 {
  font-size: 4.5em;
  font-weight: 500;
  margin-bottom: 0;
  background: -webkit-linear-gradient(
    left,
    green,
    cyan 25%,
    green 50%,
    cyan 75%,
    green 100%
  );
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: gradient 2s linear infinite;
}

@keyframes gradient {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -100% 0;
  }
}

p {
  margin-top: 10px;
  font-size: 1.6em;
  font-weight: 300;
  line-height: 1.4;
  max-width: 28em;
}

a {
  text-decoration: none;
  white-space: nowrap;
  color: #121314;
  position: relative;
}

a:after {
  content: '';
  position: absolute;
  z-index: -1;
  top: 66%;
  left: -0.1em;
  right: -0.1em;
  bottom: 0;
  transition: top 200ms cubic-bezier(0, 0.8, 0.13, 1);
  background-color: rgba(79, 192, 141, 0.5);
}

a:hover:after {
  top: 0%;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
