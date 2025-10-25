<template>
  <nav class="bottom-tab-bar">
    <div class="tab-bar-container">
      <button
        class="tab-item"
        :class="{ active: active === 'records' }"
        @click="$emit('switch', 'records')"
      >
        <div class="tab-icon">
          <i class="fa-solid fa-square-poll-vertical"></i>
        </div>
      </button>

      <button
        class="tab-item"
        :class="{ active: active === 'submit' }"
        @click="$emit('switch', 'submit')"
      >
        <div class="tab-icon">
          <i class="fa-solid fa-square-plus"></i>
        </div>
      </button>

      <button
        class="tab-item"
        :class="{ active: active === 'profile' }"
        @click="$emit('switch', 'profile')"
      >
        <div class="tab-icon">
          <i class="fa-solid fa-user"></i>
        </div>
      </button>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  active: { type: String, default: "submit" },
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
  height: 50px;
  z-index: 1000;
}

.tab-bar-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100%;
  padding: 0 20px;
  background: #fff;
  backdrop-filter: blur(12px) saturate(200%);
  -webkit-backdrop-filter: blur(30px) saturate(200%);
  border: 1px solid #e3e6e8;
  border-radius: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.tab-item {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 12px;
  color: rgba(60, 60, 67, 0.7);
  border-radius: 20px;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  position: relative;
}

.tab-item.active {
  color: #000;
  /* background: rgba(0, 122, 255, 0.15); */
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
