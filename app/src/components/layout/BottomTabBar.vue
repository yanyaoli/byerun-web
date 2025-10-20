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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.5h-15V5h15v14.5zm0-16.5h-15c-.83 0-1.5.67-1.5 1.5v15c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5z"
              fill="currentColor"
            />
          </svg>
        </div>
        <span class="tab-label">记录</span>
      </button>

      <button
        class="tab-item"
        :class="{ active: active === 'submit' }"
        @click="$emit('switch', 'submit')"
      >
        <div class="tab-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
          </svg>
        </div>
        <span class="tab-label">提交</span>
      </button>

      <button
        class="tab-item"
        :class="{ active: active === 'profile' }"
        @click="$emit('switch', 'profile')"
      >
        <div class="tab-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              fill="currentColor"
            />
          </svg>
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

<style scoped>
.bottom-tab-bar {
  flex: none;
  background-color: #ffffff;
  border-top: 1px solid #e3e6e8;
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
  /* center vertically and occupy full bar height */
  align-items: center;
  height: 100%;
  padding: 0 12px;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
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
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
}

.tab-label {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.01em;
  white-space: nowrap;
}
</style>
