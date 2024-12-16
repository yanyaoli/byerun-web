<template>
  <Header />
  <div class="main-section">
    <span class="title">{{ title }}</span>
    <span class="quote" @click="fetchQuote">{{ quote }}</span>
    <button class="start-btn" @click="getStarted">立即开始</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import Header from "@/components/Header.vue";

const router = useRouter();
const title = ref("你好 同学");
const quote = ref("未来是你的，记得享受过程");

const getStarted = () => {
  router.push("/dashboard");
};

const fetchQuote = async () => {
  try {
    const response = await axios.get("https://v1.hitokoto.cn/?c=i");
    quote.value = response.data.hitokoto;
  } catch (error) {
    console.error("Failed to fetch quote:", error);
  }
};

onMounted(() => {
  fetchQuote();
});
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
  font-family: "Poppins", sans-serif;
  background: var(--color-background);
  max-height: 100px;
}

.main-section {
  margin: 0 auto;
  max-width: 1200px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20svh;
}

.title {
  font-size: clamp(4rem, 6vw, 4rem);
  font-weight: bold;
  letter-spacing: 8px;
  background: linear-gradient(45deg, #00c6ff, #0072ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.quote {
  font-size: 1.1em;
  color: #555;
  letter-spacing: 5px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.quote:hover {
  color: #0072ff;
}

.start-btn {
  padding: 0.8em 1.6em;
  font-size: 1.2em;
  color: #fff;
  background: linear-gradient(45deg, #00c6ff, #0072ff);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  box-shadow: 0 8px 15px rgba(0, 114, 255, 0.3);
  margin-top: 3rem;
  letter-spacing: 2px;
}

.start-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 20px rgba(0, 114, 255, 0.6);
}

.start-btn:active {
  transform: scale(1);
}
</style>