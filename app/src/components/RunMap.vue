<template>
    <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';
import { getMapData } from '@/utils/map';

// 添加 AMap 类型声明
declare const AMap: any;

const props = defineProps<{
    mapChoice: string;
    visible: boolean;
}>();

const mapContainer = ref<HTMLElement | null>(null);
let map: any = null;
let polyline: any = null;
let markers: any[] = [];  // 添加标记数组

const initMap = async () => {
    if (!mapContainer.value) return;

    try {
        const AMap = await AMapLoader.load({
            key: import.meta.env.VITE_AMAP_KEY,
            version: '2.0',
            plugins: ['AMap.Icon']  // 添加 Icon 插件
        });

        map = new AMap.Map(mapContainer.value, {
            zoom: 17,
            viewMode: '2D'
        });

        drawRoute();
    } catch (error) {
        console.error('Failed to load AMap:', error);
    }
};

const drawRoute = () => {
    if (!map) {
        console.log('Map not initialized');
        return;
    }

    const mapData = getMapData(props.mapChoice);
    if (!mapData.length) {
        console.log('No map data found');
        return;
    }

    // 清除已有路线和标记
    if (polyline) {
        map.remove(polyline);
    }
    markers.forEach(marker => map.remove(marker));
    markers = [];

    // 转换坐标点
    const path = mapData.map(point => {
        const [lng, lat] = point.location.split(',').map(Number);
        return [lng, lat];
    });

    // 创建折线
    polyline = new AMap.Polyline({
        path,
        strokeColor: '#409EFF',
        strokeWeight: 6,
        strokeOpacity: 0.8,
        showDir: true
    });

    // 添加起点标记
    const startMarker = new AMap.Marker({
        position: path[0],
        content: '<div class="marker start-marker">起</div>'
    });

    // 添加终点标记
    const endMarker = new AMap.Marker({
        position: path[path.length - 1],
        content: '<div class="marker end-marker">终</div>'
    });

    markers.push(startMarker, endMarker);
    map.add([polyline, ...markers]);
    map.setFitView([polyline, ...markers]);
};

watch(() => props.mapChoice, () => {
    if (props.visible) {
        drawRoute();
    }
});

watch(() => props.visible, (newVal) => {
    if (newVal) {
        setTimeout(() => {
            if (!map) {
                initMap();
            } else {
                map.resize();
                drawRoute();
            }
        }, 100);
    }
});

onMounted(() => {
    if (props.visible) {
        initMap();
    }
});

onUnmounted(() => {
    if (map) {
        map.destroy();
        map = null;
    }
});
</script>

<script lang="ts">
import type { DefineComponent } from 'vue'
export default {
    name: 'RunMap'
} as DefineComponent
</script>

<style scoped>
.map-container {
    width: 100%;
    height: 400px;
    border-radius: 4px;
}

:deep(.marker) {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    font-weight: bold;
}

:deep(.start-marker) {
    background-color: #67C23A;
}

:deep(.end-marker) {
    background-color: #F56C6C;
}
</style>