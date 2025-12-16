<template>
  <nav class="bottom-tab-bar">
    <div class="tab-bar-container" ref="containerRef">
      <div class="active-background" :style="activeBackgroundStyle"></div>
            <button
        v-for="item in tabs"
        :key="item.key"
        class="tab-item"
        :class="{ active: active === item.key }"
        @click="$emit('switch', item.key)"
      >
        <div class="tab-icon">
          <i :class="item.icon"></i>
        </div>
        <div class="tab-label">{{ item.label }}</div>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

const props = defineProps({
  active: { type: String, default: 'submit' },
  tabs: { type: Array, default: () => ([
    { key: 'club', label: '俱乐部', icon: 'fa-solid fa-baseball' },
    { key: 'records', label: '记录', icon: 'fa-solid fa-square-poll-vertical' },
    { key: 'submit', label: '新增', icon: 'fa-solid fa-square-plus' },
    { key: 'profile', label: '我的', icon: 'fa-solid fa-user' },
  ]) }
});

const activeIndex = computed(() => props.tabs.findIndex(t => t.key === props.active));

// DOM refs
const containerRef = ref(null);
const tabCenters = ref([]);

function updatePositions() {
  const container = containerRef.value;
  if (!container) return;
  const items = container.querySelectorAll('.tab-item');
  const containerRect = container.getBoundingClientRect();
  tabCenters.value = Array.from(items).map(item => {
    const rect = item.getBoundingClientRect();
    const center = rect.left - containerRect.left + rect.width / 2;
    // subtract half background width (30px) to center the background
    return `${center - 30}px`;
  });
}

onMounted(() => {
  nextTick(updatePositions);
  window.addEventListener('resize', updatePositions);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePositions);
});

watch(() => props.active, () => {
  nextTick(updatePositions);
});

watch(() => props.tabs, () => {
  nextTick(updatePositions);
}, { deep: true });

const activeBackgroundStyle = computed(() => {
  const idx = activeIndex.value >= 0 ? activeIndex.value : 0;
  const left = tabCenters.value[idx] || '20px';
  return { left };
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
