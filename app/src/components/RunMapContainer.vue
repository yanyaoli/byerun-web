<template>
  <el-skeleton :loading="!route" class="map-container" animated>
    <template #template>
      <div class="map-skeleton-content">
        <el-icon class="map-skeleton-icon">
          <MapLocationIcon />
        </el-icon>
      </div>
    </template>
    <template #default>
      <div v-show="route" class="map-content">
        <RunMap
          :map-choice="route"
          :visible="visible"
          :distance="distance"
          :duration="duration"
        />
      </div>
    </template>
  </el-skeleton>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import RunMap from './RunMap.vue'
import { MapLocationIcon } from '@/components/icons'

interface Props {
  route: string
  visible: boolean
  distance: number
  duration: number
}

const props = defineProps<Props>()

const mapRef = ref()
const isLoading = ref(false)

watch(
  () => props.route,
  async (newVal) => {
    if (newVal) {
      isLoading.value = true
      try {
        // 这里可以添加地图加载逻辑
        await mapRef.value?.initMap()
      } catch (error) {
        console.error('Failed to load map:', error)
      } finally {
        isLoading.value = false
      }
    }
  }
)
</script>

<style scoped>
.map-container {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
  height: 200px;
  margin: 16px 0;
}

.map-skeleton-content {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color-light);
  height: 100%;
}

.map-skeleton-icon {
  font-size: 50px;
  color: var(--el-text-color-placeholder);
}

.map-content {
  height: 100%;
  width: 100%;
}

@media screen and (max-width: 480px) {
  .map-container {
    height: 150px;
    margin: 8px 0;
  }
}
</style>