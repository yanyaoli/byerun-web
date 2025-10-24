<template>
  <nav class="bottom-tab-bar">
    <div class="bottom-fixed">
      <div class="tab-bar-container">
      <button
        class="tab-item"
        :class="{ active: active === 'records' }"
        @click="$emit('switch', 'records')"
      >
        <div class="tab-icon">
          <i class="fa-solid fa-square-poll-vertical"></i>
        </div>
        <span class="tab-label">记录</span>
      </button>

      <button
        class="tab-item"
        :class="{ active: active === 'submit' }"
        @click="$emit('switch', 'submit')"
      >
        <div class="tab-icon">
          <i class="fa-solid fa-square-plus"></i>
        </div>
        <span class="tab-label">提交</span>
      </button>

      <button
        class="tab-item"
        :class="{ active: active === 'profile' }"
        @click="$emit('switch', 'profile')"
      >
        <div class="tab-icon">
          <i class="fa-solid fa-user"></i>
        </div>
        <span class="tab-label">我的</span>
      </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
// 直接使用 defineProps 宏，避免未使用变量导致的 TS 警告
defineProps({
  active: { type: String, default: 'submit' }
});
</script>
<script lang="ts">
export default {
  name: "BottomTabBar",
};
</script>

<style scoped>
.bottom-tab-bar {
  flex: none;
  border: 1px solid #e3e6e8;
  position: fixed;
  left: 0;
  bottom: 0;
  height: var(--app-bottom-height, 72px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-fixed {
  width: 100%;
  height: 100%;
}

.tab-bar-container {
  display: flex;
  flex-direction: row; /* 确保水平布局 */
  justify-content: space-around;
  align-items: center;
  height: 100%;
  padding: 0 12px;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  background: #eeeeee;
}

/* Always constrain the fixed bottom bar to the same centered max-width as .app-layout. */
.bottom-tab-bar {
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 100%;
  max-width: 420px;
}
.bottom-fixed {
  width: 100%;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 8px;
  color: #7b8a8b;
  min-width: 72px;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  outline: none;
  user-select: none;
}

.tab-item:active {
  color: #2d3a3f;
}

.tab-item.active {
  color: #24343b;
  background: #dbdbdb;
  border-radius: 20px;
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
.tab-icon i {
  font-size: 20px;
}

.tab-label {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.01em;
  white-space: nowrap;
}
</style>
