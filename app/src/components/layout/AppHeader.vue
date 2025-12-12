<template>
  <header class="fixed left-1/2 top-3 -translate-x-1/2 px-4 w-full max-w-[420px] h-9 z-[998] transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]">
    <div class="flex items-center justify-between h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[30px] px-3 gap-2 transition-inherit shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
      <!-- Logo -->
      <div class="flex flex-row items-center">
        <img src="/logo.png" alt="App Logo" class="inline-block h-6 w-auto mr-2 filter-[saturate(1.18)_contrast(1.06)_brightness(1.02)] transition-[transform_0.28s_ease,filter_0.28s_ease]" />
      </div>

      <!-- 社交链接 -->
      <div class="flex gap-3">
        <a v-for="link in socialLinks" :key="link.href" :href="link.href"
          :target="link.href.startsWith('http') ? '_blank' : undefined"
          :rel="link.href.startsWith('http') ? 'noopener noreferrer' : undefined"
          class="flex items-center justify-center w-7 h-7 rounded-full text-gray-600 transition-all duration-300 text-sm hover:text-blue-500 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:bg-white"
          :title="link.title">
          <i :class="link.icon"></i>
        </a>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  title: { type: String, default: "" },
});

const socialLinks = [
  {
    href: "https://github.com/yanyaoli/byerun-web",
    title: "GitHub 仓库",
    icon: "fa-brands fa-github"
  },
  {
    href: "https://redirect.where.nyc.mn/byerun-qqgroup",
    title: "加入QQ群",
    icon: "fa-brands fa-qq"
  }
];

const isVisible = ref(true);
const lastScrollY = ref(0);
const scrollThreshold = 50;

const handleScroll = () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY <= scrollThreshold) {
    isVisible.value = true;
  } else if (
    currentScrollY > lastScrollY.value &&
    currentScrollY > scrollThreshold
  ) {
    isVisible.value = false;
  } else if (currentScrollY < lastScrollY.value) {
    isVisible.value = true;
  }

  lastScrollY.value = currentScrollY;
};

const throttleScroll = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        func(...args);
        timeoutId = null;
      }, delay);
    }
  };
};

const throttledScroll = throttleScroll(handleScroll, 100);

onMounted(() => {
  window.addEventListener("scroll", throttledScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", throttledScroll);
});
</script>

<style scoped>
</style>
