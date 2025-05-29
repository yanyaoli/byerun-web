import type {
  MapItem,
  MapOption,
  MapPoint,
  MapPathData,
  MapDataCollection,
} from "@/types/map";
import cuit_hkg from "@/data/maps/cuit/hkg";
import cuit_lqy from "@/data/maps/cuit/lqy";
import cdutcm_wj from "@/data/maps/cdutcm/wj";
import ncwsxx from "@/data/maps/ncwsxx/index";
import sctbc from "@/data/maps/sctbc/index";

const mapData: MapDataCollection = {
  cuit_hkg: cuit_hkg.mapdata,
  cuit_lqy: cuit_lqy.mapdata,
  cdutcm_wj: cdutcm_wj.mapdata,
  ncwsxx: ncwsxx.mapdata,
  sctbc: sctbc.mapdata,
};

export function getMapData(mapChoice: string): MapItem[] {
  return mapData[mapChoice] || [];
}

export function getSchoolMaps(): MapOption[] {
  const schoolMaps = {
    成都信息工程大学航空港校区: "cuit_hkg",
    成都信息工程大学龙泉校区: "cuit_lqy",
    成都中医药大学温江校区: "cdutcm_wj",
    南充卫生学校: "ncwsxx",
    四川工商职业技术学院: "sctbc",
  };

  return Object.entries(schoolMaps).map(([label, value]) => ({
    label,
    value,
  }));
}

// 更新 generateDynamicPath 函数的类型声明
export const generateDynamicPath = (
  baseMap: MapPathData,
  distance: number,
  duration: number
): MapPathData => {
  const mapData = getMapData(baseMap.mapChoice);
  if (!mapData.length) return baseMap;

  // 随机选择起点
  const startPointIndex = Math.floor(Math.random() * mapData.length);
  let currentPoint = mapData[startPointIndex];
  let currentDist = 0;
  const path: MapPoint[] = [];
  const visited = new Set<number>();

  // 添加起点
  const [startLng, startLat] = currentPoint.location.split(",").map(Number);
  path.push({ lat: startLat, lng: startLng });
  visited.add(currentPoint.id);

  // 沿着 edge 连接的点生成路径
  while (currentDist < distance && currentPoint.edge.length > 0) {
    // 从当前点的 edge 中选择一个未访问的点
    const availableEdges = currentPoint.edge.filter((id) => !visited.has(id));
    if (availableEdges.length === 0) break;

    // 随机选择下一个点
    const nextPointId =
      availableEdges[Math.floor(Math.random() * availableEdges.length)];
    const nextPoint = mapData[nextPointId];

    // 计算两点之间的距离
    const [nextLng, nextLat] = nextPoint.location.split(",").map(Number);
    const [currLng, currLat] = currentPoint.location.split(",").map(Number);

    const segmentDist = Math.sqrt(
      Math.pow((nextLat - currLat) * 111000, 2) +
        Math.pow(
          (nextLng - currLng) * 111000 * Math.cos((currLat * Math.PI) / 180),
          2
        )
    );

    // 添加当前点到路径
    path.push({ lat: currLat, lng: currLng });

    // 在当前点和下一点之间添加抖动点
    const steps = Math.max(3, Math.floor(segmentDist / 20)); // 每20米至少添加3个中间点
    for (let i = 1; i <= steps; i++) {
      const ratio = i / (steps + 1);
      const jitterLng = (Math.random() - 0.5) * 0.00001; // 约1米的经度抖动
      const jitterLat = (Math.random() - 0.5) * 0.00001; // 约1米的纬度抖动

      path.push({
        lat: currLat + (nextLat - currLat) * ratio + jitterLat,
        lng: currLng + (nextLng - currLng) * ratio + jitterLng,
      });
    }

    path.push({ lat: nextLat, lng: nextLng });
    visited.add(nextPoint.id);
    currentDist += segmentDist;
    currentPoint = nextPoint;
  }

  // 确保至少有两个点
  if (path.length < 2) {
    const nextPointId = currentPoint.edge[0];
    const nextPoint = mapData[nextPointId];
    const [nextLng, nextLat] = nextPoint.location.split(",").map(Number);
    path.push({ lat: nextLat, lng: nextLng });
  }

  // 对路径进行平滑处理
  const smoothPath = [];
  for (let i = 0; i < path.length; i++) {
    if (i > 0 && i < path.length - 1) {
      // 对中间点进行平均平滑
      smoothPath.push({
        lat: (path[i - 1].lat + path[i].lat + path[i + 1].lat) / 3,
        lng: (path[i - 1].lng + path[i].lng + path[i + 1].lng) / 3,
      });
    } else {
      smoothPath.push(path[i]);
    }
  }

  return {
    pathLength: currentDist,
    startPoint: smoothPath[0],
    endPoint: smoothPath[smoothPath.length - 1],
    path: smoothPath,
    mapChoice: baseMap.mapChoice,
  };
};

// 添加 AMap 类型声明
declare const AMap: any;

// 更新地图显示函数
export const updateMapPath = (map: any, pathData: MapPathData) => {
  if (!map || !pathData) return;

  const path = pathData.path.map((point) => [point.lng, point.lat]);

  const polyline = new AMap.Polyline({
    path,
    strokeColor: "#409EFF",
    strokeWeight: 6,
    strokeOpacity: 0.8,
    showDir: true,
  });

  const startMarker = new AMap.Marker({
    position: [pathData.startPoint.lng, pathData.startPoint.lat],
    content: '<div class="marker start-marker">起</div>',
  });

  const endMarker = new AMap.Marker({
    position: [pathData.endPoint.lng, pathData.endPoint.lat],
    content: '<div class="marker end-marker">终</div>',
  });

  map.clearMap();
  map.add([polyline, startMarker, endMarker]);
  map.setFitView([polyline, startMarker, endMarker]);
};
