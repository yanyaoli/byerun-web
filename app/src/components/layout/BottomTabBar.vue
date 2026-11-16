<template>
  <nav
    class="tabbar"
    role="navigation"
    aria-label="主导航"
    :style="{
      '--tab-count': tabs.length,
      '--active-tab-index': activeIndex,
    }"
  >
    <button
      v-for="item in tabs"
      :key="item.key"
      type="button"
      :class="['tab-item', active === item.key ? 'active' : '']"
      :aria-current="active === item.key ? 'page' : undefined"
      @click="handleClick(item)"
    >
      <!-- 图标与文字统一包装为居中整体 -->
      <div class="tab-item-content">
        <!-- 上方：图标与未读小红点 -->
        <div
          :key="active === item.key ? 'active' : 'inactive'"
          class="tab-icon"
        >
          <i :class="[item.icon, 'text-[19px] leading-none']"></i>
          <span
            v-if="item.key === 'chat' && chatUnread && active !== 'chat'"
            class="tab-badge animate-pulse"
          ></span>
        </div>

        <!-- 下方：名称 -->
        <span class="tab-label">{{ item.label }}</span>
      </div>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue';

const emit = defineEmits(['update:active', 'switch']);

const props = defineProps({
  active: { type: String, default: 'submit' },
  chatUnread: { type: Boolean, default: false },
  isDarkMode: { type: Boolean, default: false },
  tabs: {
    type: Array,
    default: () => [
      { key: 'submit', label: '校园跑', icon: 'ri-command-fill' },
      { key: 'club', label: '俱乐部', icon: 'ri-basketball-fill' },
      { key: 'chat', label: '消息', icon: 'ri-message-3-fill' },
      { key: 'my', label: '我的', icon: 'ri-user-3-fill' },
    ],
  },
});

const activeIndex = computed(() => {
  const idx = props.tabs.findIndex((tab) => tab.key === props.active);
  return idx >= 0 ? idx : 0;
});

function handleClick(item) {
  emit('update:active', item.key);
  emit('switch', item.key);
}
</script>

<style scoped>
/* 灵动岛底部导航胶囊 */
.tabbar {
  position: fixed;
  z-index: 999;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  width: min(calc(100% - 32px), 420px);
  height: 60px;
  padding: 4px;
  display: grid;
  grid-template-columns: repeat(var(--tab-count, 4), 1fr);
  align-items: stretch;
  border-radius: 999px;
  background-color: var(--bottom-tab-bg);
  border: 1px solid var(--bottom-tab-border);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  user-select: none;
  box-sizing: border-box;
  transition:
    background-color var(--theme-transition-duration) var(--theme-transition-easing),
    border-color var(--theme-transition-duration) var(--theme-transition-easing),
    box-shadow var(--theme-transition-duration) var(--theme-transition-easing);
}

:global(.dark) .tabbar,
:global([data-theme="dark"]) .tabbar {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
}

/* 选中项滑动胶囊：轻质柔和灰，跟随当前项平滑过渡 */
.tabbar::before {
  content: '';
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc((100% - 8px) / var(--tab-count));
  border-radius: 999px;
  background-color: var(--bottom-tab-active-bg);
  transform: translateX(calc(var(--active-tab-index) * 100%));
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    background-color var(--theme-transition-duration) var(--theme-transition-easing);
  pointer-events: none;
}

/* 单个 Tab 按钮：填满高度并垂直+水平双向居中 */
.tab-item {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  border-radius: 999px;
  border: 0;
  background: transparent;
  cursor: pointer;
  outline: none;
  transition: color 0.2s ease, opacity 0.2s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  padding: 0;
  margin: 0;
}

.tab-item:hover:not(.active) {
  color: var(--text);
  opacity: 0.85;
}

/* 图标与文字的组合体：整体绝对垂直居中 */
.tab-item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  pointer-events: none;
}

.tab-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  line-height: 1;
}

.tab-badge {
  position: absolute;
  top: -1px;
  right: -2px;
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background-color: #f43f5e;
  border: 1.5px solid #ffffff;
}

:global(.dark) .tab-badge,
:global([data-theme="dark"]) .tab-badge {
  border-color: #18181b;
}

.tab-label {
  font-size: 9px;
  line-height: 1;
  letter-spacing: 0.08em;
  text-indent: 0.08em; /* 视觉补偿右侧字间距，确保文字水平精确居中 */
  font-weight: 500;
  white-space: nowrap;
}

/* 激活状态：纯净主题色与清晰字重 */
.tab-item.active {
  color: var(--bottom-tab-active-text) !important;
  background: transparent;
  box-shadow: none;
}

.tab-item.active .tab-label {
  font-weight: 600;
}

/* 选中图标弹跳动效 */
@keyframes tab-icon-pop {
  0% { transform: scale(0.65); }
  60% { transform: scale(1.12); }
  100% { transform: scale(1); }
}

.tab-item.active .tab-icon {
  animation: tab-icon-pop 0.32s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .tabbar::before,
  .tab-item {
    transition: none;
  }
  .tab-item.active .tab-icon {
    animation: none;
  }
}
</style>
