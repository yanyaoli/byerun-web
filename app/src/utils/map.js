// 静态导入地图文件
import mapIndex from "../assets/maps/index.json";

// 动态导入所有地图文件
const mapModules = import.meta.glob("../assets/maps/*.json", { eager: true });

// 地图数据集合：键为地图名称，值为该地图的坐标数组（格式：["经度,纬度", ...]）
let mapDataCollection = {
  default: null, // 默认地图将在初始化时设置
};

// 存储所有可用地图ID的数组
let availableMapIds = [];

/**
 * 获取maps文件夹下的所有JSON文件列表
 */
function getMapFileList() {
  return mapIndex; // 直接返回导入的索引
}

/**
 * 动态加载地图文件
 */
export async function loadMapFiles() {
  try {
    // 清空现有数据
    mapDataCollection = {};
    availableMapIds = [];

    // 从静态导入的地图模块加载数据
    const fileList = getMapFileList();

    fileList.forEach((fileName) => {
      const modulePath = `../assets/maps/${fileName}`;
      if (mapModules[modulePath]) {
        const mapFileData = mapModules[modulePath].default;
        mapDataCollection[mapFileData.mapId] = mapFileData.mapData;
        availableMapIds.push(mapFileData.mapId);
        console.log(
          `成功加载地图: ${mapFileData.mapId} (${mapFileData.mapName})`
        );
      }
    });

    // 设置默认地图
    if (availableMapIds.length > 0) {
      const firstMapId = availableMapIds[0];
      mapDataCollection.default = mapDataCollection[firstMapId];
      console.log(`默认地图设置为: ${firstMapId}`);
    } else {
      console.warn("未找到任何地图文件！");
      mapDataCollection.default = [];
    }

    return availableMapIds;
  } catch (error) {
    console.error("加载地图文件时发生错误:", error);
    mapDataCollection.default = [];
    return [];
  }
}

/**
 * 获取所有可用的地图ID列表
 * @returns 地图ID数组
 */
export function getAvailableMapIds() {
  return [...availableMapIds];
}

/**
 * 获取指定地图的坐标数据
 * @param mapChoice 地图名称（可选，默认值为"default"）
 * @returns 对应地图的坐标数组（格式：["经度,纬度", ...]），若指定地图不存在则返回默认地图数据
 */
export function getMapData(mapChoice = "default") {
  return mapDataCollection[mapChoice] || mapDataCollection["default"];
}

/**
 * 计算地球表面两点间的直线距离（单位：米）
 * @param start 起点坐标（格式：[经度, 纬度]）
 * @param end 终点坐标（格式：[经度, 纬度]）
 * @returns 两点间距离（米）
 */
export function getDistance(start, end) {
  // 角度转弧度的工具函数
  const toRad = (d) => (d * Math.PI) / 180;
  const [lng1, lat1] = start; // 起点经纬度
  const [lng2, lat2] = end; // 终点经纬度
  const R = 6378137; // 地球半径（单位：米，WGS84椭球半径）

  // 计算纬度差、经度差（弧度）
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  // 哈弗辛公式（Haversine formula）计算两点间距离
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 返回最终距离（米）
}

/**
 * 生成默认定位精度
 * @returns 定位精度（字符串格式，保留1位小数，范围1.0-5.0米）
 * 注：该函数会在genTrackPoints中根据转弯情况被重写，以实现动态精度调整
 */
function randAccuracy() {
  return (Math.random() * 4 + 1).toFixed(1); // 默认生成1.0-5.0米的精度
}

/**
 * 轨迹生成算法
 * @param distance 目标跑步距离（单位：米）
 * @param mapChoice 地图名称（可选，默认值为"default"）
 * @returns 轨迹点JSON字符串（格式：["经度-纬度-时间戳-定位精度", ...]）
 */
export function genTrackPoints(distance, mapChoice = "default") {
  const locations = getMapData(mapChoice);
  if (!locations || locations.length === 0) return "[]";

  // 轨迹生成控制参数
  const baseSpacing = 8; // 基础点间距（米）
  const minSpacing = 3; // 最小点间距（米）
  const maxSpacing = 15; // 最大点间距（米）
  const curveSmoothness = 0.3; // 曲线平滑度（0-1，越高越平滑）
  const maxPointsPerSegment = 150; // 每段最大点数

  let generatedDistance = 0;
  let startTime = Date.now() - 30 * 60 * 1000;
  const result = [];

  // 米转经纬度偏移的辅助函数
  const metersToLngLat = (dxMeters, dyMeters, lat) => {
    const metersPerDegLat = 111320;
    const metersPerDegLng = ((Math.PI / 180) * 6378137 * Math.cos((lat * Math.PI) / 180)) / (Math.PI / 180);
    return [dxMeters / metersPerDegLng, dyMeters / metersPerDegLat];
  };

  /**
   * 三次贝塞尔曲线插值
   * @param p0 起点
   * @param p1 控制点1
   * @param p2 控制点2
   * @param p3 终点
   * @param t 插值参数（0-1）
   * @returns 插值点坐标
   */
  const cubicBezier = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    const x = uuu * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + ttt * p3[0];
    const y = uuu * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + ttt * p3[1];

    return [x, y];
  };

  /**
   * 计算贝塞尔曲线的控制点
   * @param prev 前一点
   * @param current 当前点
   * @param next 下一点
   * @param nextNext 下下点
   * @returns [控制点1, 控制点2]
   */
  const calculateControlPoints = (prev, current, next, nextNext) => {
    if (!prev) prev = current;
    if (!nextNext) nextNext = next;

    // 计算切线方向
    const tangent1 = [
      (current[0] - prev[0]) * curveSmoothness,
      (current[1] - prev[1]) * curveSmoothness
    ];
    
    const tangent2 = [
      (nextNext[0] - next[0]) * curveSmoothness,
      (nextNext[1] - next[1]) * curveSmoothness
    ];

    // 控制点基于当前点和切线计算
    const cp1 = [
      current[0] + tangent1[0],
      current[1] + tangent1[1]
    ];
    
    const cp2 = [
      next[0] - tangent2[0],
      next[1] - tangent2[1]
    ];

    return [cp1, cp2];
  };

  /**
   * 自适应计算插值点数
   * @param segDist 段距离
   * @param turnAngle 转弯角度
   * @returns 插值点数
   */
  const calculateInterpolationPoints = (segDist, turnAngle) => {
    // 基础点数基于距离
    let points = Math.max(2, Math.ceil(segDist / baseSpacing));
    
    // 转弯时增加点数
    if (turnAngle > 30) {
      points = Math.min(maxPointsPerSegment, points * 2);
    } else if (turnAngle > 15) {
      points = Math.min(maxPointsPerSegment, Math.ceil(points * 1.5));
    }
    
    return Math.min(maxPointsPerSegment, points);
  };

  /**
   * 计算两点间的转弯角度
   * @param prev 前一点
   * @param current 当前点
   * @param next 下一点
   * @returns 转弯角度（度）
   */
  const calculateTurnAngle = (prev, current, next) => {
    if (!prev) return 0;
    
    const vec1 = [prev[0] - current[0], prev[1] - current[1]];
    const vec2 = [next[0] - current[0], next[1] - current[1]];
    
    const dot = vec1[0] * vec2[0] + vec1[1] * vec2[1];
    const mag1 = Math.sqrt(vec1[0] * vec1[0] + vec1[1] * vec1[1]);
    const mag2 = Math.sqrt(vec2[0] * vec2[0] + vec2[1] * vec2[1]);
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    return Math.acos(cosAngle) * (180 / Math.PI);
  };

  // 处理初始点
  let [lng, lat] = locations[0].split(",").map(Number);
  const initialJitter = metersToLngLat(
    (Math.random() - 0.5) * 1.5,
    (Math.random() - 0.5) * 1.5,
    lat
  );
  lng += initialJitter[0];
  lat += initialJitter[1];
  
  result.push(`${lng}-${lat}-${startTime}-${randAccuracy()}`);

  let prevSpeed = Math.random() * (2.6 - 1.7) + 1.7;
  let idx = 0;

  while (generatedDistance < distance) {
    const nextIdx = (idx + 1) % locations.length;
    const [nextLngRaw, nextLatRaw] = locations[nextIdx].split(",").map(Number);
    
    // 对终点添加随机偏移
    const endpointJitter = metersToLngLat(
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 1.5,
      nextLatRaw
    );
    const nextLng = nextLngRaw + endpointJitter[0];
    const nextLat = nextLatRaw + endpointJitter[1];

    const segDist = getDistance([lng, lat], [nextLng, nextLat]);
    if (segDist <= 0.5) {
      idx = nextIdx;
      lng = nextLng;
      lat = nextLat;
      continue;
    }

    // 获取前后点信息用于曲线计算
    const prevIdx = idx > 0 ? idx - 1 : locations.length - 1;
    const nextNextIdx = (nextIdx + 1) % locations.length;
    
    const [prevLng, prevLat] = locations[prevIdx].split(",").map(Number);
    const [nextNextLng, nextNextLat] = locations[nextNextIdx].split(",").map(Number);

    // 计算转弯角度
    const turnAngle = calculateTurnAngle([prevLng, prevLat], [lng, lat], [nextLng, nextLat]);

    // 计算控制点
    const [cp1, cp2] = calculateControlPoints(
      [prevLng, prevLat],
      [lng, lat],
      [nextLng, nextLat],
      [nextNextLng, nextNextLat]
    );

    // 自适应计算插值点数
    const n = calculateInterpolationPoints(segDist, turnAngle);

    let lastOut = [lng, lat];
    
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      
      // 使用贝塞尔曲线插值
      const [ix, iy] = cubicBezier(
        [lng, lat],
        cp1,
        cp2,
        [nextLng, nextLat],
        t
      );

      // 添加自然偏移（比原来更小的偏移量）
      const lateralFactor = Math.min(0.008, segDist * 0.0001);
      const lateralMax = Math.min(4, Math.max(0.3, segDist * lateralFactor));
      const lateral = (Math.random() - 0.5) * 2 * lateralMax * Math.sin(Math.PI * t);

      // 计算垂直方向向量
      const dx = nextLng - lng;
      const dy = nextLat - lat;
      const perp = [-dy, dx];
      const perpLen = Math.sqrt(perp[0] * perp[0] + perp[1] * perp[1]) || 1;
      const perpUnit = [perp[0] / perpLen, perp[1] / perpLen];

      // 应用偏移
      const lateralDeg = metersToLngLat(
        perpUnit[0] * lateral,
        perpUnit[1] * lateral,
        iy
      );
      
      const outLng = ix + lateralDeg[0];
      const outLat = iy + lateralDeg[1];

      // 计算时间和速度
      const segMeters = getDistance(lastOut, [outLng, outLat]);
      const targetSpeed = Math.random() * (2.6 - 1.7) + 1.7;
      const speed = prevSpeed * 0.85 + targetSpeed * 0.15;
      prevSpeed = speed;

      const timeInc = (segMeters / Math.max(0.5, speed)) * 1000;
      startTime += Math.round(timeInc);

      // 生成精度（转弯时精度稍低）
      const accuracy = (Math.random() * (turnAngle > 20 ? 5 : 3) + 0.5).toFixed(1);

      result.push(`${outLng}-${outLat}-${startTime}-${accuracy}`);
      generatedDistance += segMeters;
      lastOut = [outLng, outLat];

      if (generatedDistance >= distance) break;
    }

    idx = nextIdx;
    lng = nextLng;
    lat = nextLat;

    if (result.length > 20000) break;
  }

  return JSON.stringify(result);
}

/**
 * 获取30分钟前的格式化时间
 * @returns 格式化时间字符串（格式：YYYY-MM-DD HH:mm:ss）
 */
export function getDate() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - 30); // 将当前时间减去30分钟
  // 转换为ISO格式（如"2024-05-20T14:30:00.000Z"），替换"T"为空格，截取前19位（去掉毫秒和时区）
  return now.toISOString().replace("T", " ").substring(0, 19);
}
