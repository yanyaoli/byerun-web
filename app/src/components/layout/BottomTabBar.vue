<template>
  <nav class="bottom-tab-bar">
    <div class="tab-bar-container">
      <div class="active-background" :style="activeBackgroundStyle"></div>
      <button
        class="tab-item"
        :class="{ active: active === 'records' }"
        @click="$emit('switch', 'records')"
      >
        <div class="tab-icon">
          <i class="fa-solid fa-square-poll-vertical"></i>
        </div>
        <div class="tab-label">记录</div>
      </button>

      <button
        class="tab-item"
        :class="{ active: active === 'submit' }"
        @click="$emit('switch', 'submit')"
      >
        <div class="tab-icon">
          <i class="fa-solid fa-square-plus"></i>
        </div>
        <div class="tab-label">新增</div>
      </button>

      <button
        class="tab-item"
        :class="{ active: active === 'profile' }"
        @click="$emit('switch', 'profile')"
      >
        <div class="tab-icon">
          <i class="fa-solid fa-user"></i>
        </div>
        <div class="tab-label">我的</div>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  active: { type: String, default: "submit" },
});

const tabs = ['records', 'submit', 'profile'];
const activeIndex = computed(() => tabs.indexOf(props.active));
const activeBackgroundStyle = computed(() => {
  const tabPositions = ['20px', 'calc(50% - 30px)', 'calc(100% - 80px)'];
  return {
    left: tabPositions[activeIndex.value],
  };
});
</script>

<style scoped>
.bottom-tab-bar {
  position: fixed;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  width: 100%;
  padding: 0 16px;
  max-width: 420px;
  height: 60px;
  z-index: 998;
}

.tab-bar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
}

.active-background {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 48px;
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  transition: left 0.3s ease;
  pointer-events: none;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 12px;
  color: rgba(60, 60, 67, 0.8);
  border-radius: 20px;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  position: relative;
  flex: 0 0 60px;
}

.tab-item.active {
  color: #000;
  /* background: rgba(0, 122, 255, 0.15); */
  /* background: rgba(255, 255, 255, 0.3); */
  /* box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); */
  border-radius: 15px;
  /* width: 60px; */
  /* height: 48px; */
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.tab-icon i {
  font-size: 20px;
}

.tab-label {
  font-size: 10px;
  color: rgba(60, 60, 67, 0.7);
  margin-top: 2px;
  text-align: center;
}

.tab-item.active .tab-label {
  color: #000;
}

/* 移动端适配 */
@media (max-width: 375px) {
  .bottom-tab-bar {
    width: calc(100% - 32px);
    bottom: 16px;
    max-width: 260px;
  }
}

/* 安全区域适配 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-tab-bar {
    bottom: calc(20px + env(safe-area-inset-bottom));
  }
}
</style>
