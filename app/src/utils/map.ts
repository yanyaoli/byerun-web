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
import stbu from "@/data/maps/stbu/index";

const mapData: MapDataCollection = {
  cuit_hkg: cuit_hkg.mapdata,
  cuit_lqy: cuit_lqy.mapdata,
  cdutcm_wj: cdutcm_wj.mapdata,
  ncwsxx: ncwsxx.mapdata,
  stbu: stbu.mapdata,
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
    四川工商学院: "stbu",
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

    // 如果添加这段距离后不会超过目标距离太多，则添加这个点
    if (currentDist + segmentDist <= distance * 1.1) {
      path.push({ lat: nextLat, lng: nextLng });
      visited.add(nextPoint.id);
      currentDist += segmentDist;
      currentPoint = nextPoint;
    } else {
      break;
    }
  }

  // 确保至少有两个点
  if (path.length < 2) {
    const nextPointId = currentPoint.edge[0];
    const nextPoint = mapData[nextPointId];
    const [nextLng, nextLat] = nextPoint.location.split(",").map(Number);
    path.push({ lat: nextLat, lng: nextLng });
  }

  // 对中间点进行轻微随机偏移
  const adjustedPath = path.map((pt, idx) => {
    if (idx === 0 || idx === path.length - 1) {
      return pt; // 保持起点和终点不变
    }
    const offset = 0.00002; // 约2米的偏移
    return {
      lat: pt.lat + (Math.random() - 0.5) * offset,
      lng: pt.lng + (Math.random() - 0.5) * offset,
    };
  });

  return {
    pathLength: currentDist,
    startPoint: adjustedPath[0],
    endPoint: adjustedPath[adjustedPath.length - 1],
    path: adjustedPath,
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
