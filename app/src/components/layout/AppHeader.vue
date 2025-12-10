<template>
  <header
    class="page-header"
    :class="{ 'header-hidden': !isVisible, 'header-visible': isVisible }"
  >
    <div class="header-container">
      <!-- Logo -->
      <div class="logo-wrapper">
        <img src="/logo.png" alt="App Logo" class="logo-image" />
      </div>

      <!-- 标题 -->
      <h1 class="page-title">{{ title }}</h1>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  title: { type: String, default: "" },
});

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
.page-header {
  position: fixed;
  left: 50%;
  top: 12px;
  transform: translateX(-50%);
  padding: 0 16px;
  width: 100%;
  max-width: 420px;
  height: 36px;
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-container {
  display: flex;
  align-items: center;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 0 12px;
  gap: 8px;
  transition: inherit;
  /* box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); */
}

/* Logo 样式 - 左侧 */
.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  order: 1; /* 确保在左侧 */
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: brightness(0) saturate(100%) contrast(100%);
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.header-container:hover .logo-image {
  opacity: 1;
}

/* 标题样式 - 右侧 */
.page-title {
  font-size: 15px;
  font-weight: 600;
  color: #2d3a3f;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.2px;
  line-height: 1;
  transition: inherit;
  flex: 1;
  min-width: 0;
  order: 2; /* 确保在右侧 */
  text-align: right; /* 改为右对齐 */
  margin-left: auto; /* 添加这个让标题靠右 */
}

/* 显示状态 */
.header-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}

/* 隐藏状态 */
.header-hidden {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
  pointer-events: none;
}

/* 移动端适配 */
@media (max-width: 375px) {
  .page-header {
    top: 10px;
    min-width: 130px;
    max-width: 200px;
    height: 34px;
  }

  .header-container {
    padding: 0 10px;
    gap: 6px;
  }

  .logo-wrapper {
    width: 18px;
    height: 18px;
  }

  .page-title {
    font-size: 14px;
  }
}

/* 安全区域适配 */
@supports (padding-top: env(safe-area-inset-top)) {
  .page-header {
    top: calc(12px + env(safe-area-inset-top));
  }
}
</style>
