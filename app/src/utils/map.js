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
 * 轨迹生成算法
 * @param distance 目标跑步距离（单位：米）
 * @param mapChoice 地图名称（可选，默认值为"default"）
 * @returns 轨迹点JSON字符串（格式：["经度-纬度-时间戳-定位精度", ...]）
 */
export function genTrackPoints(distance, mapChoice = "default") {
  const locations = getMapData(mapChoice);
  if (!locations || locations.length === 0) return "[]";

  // 轨迹生成控制参数
  const baseSpacing = 12; // 基础点间距（米）——增大可减少点数
  const maxPointsPerSegment = 80; // 每段最大点数（防止单段过密）
  const maxTotalPoints = 5000; // 全局点数上限，防止生成过多点

  let generatedDistance = 0;
  let startTime = Date.now() - 30 * 60 * 1000;
  const result = [];

  // 小幅度经纬度抖动工具（默认 ±0.000001 度）
  const DEFAULT_JITTER = 0.000001;
  const smallJitter = () => (Math.random() - 0.5) * 2 * DEFAULT_JITTER;
  // 生成默认定位精度（内联，单位：米，保留1位小数）
  const randAccuracy = () => (Math.random() * 4 + 1).toFixed(1);
  // 额外参数：曲线平滑度和直线判断阈值（角度）
  const curveSmoothness = 0.3;
  const straightAngleThreshold = 8; // 低于此角度视为直线（度）
  const clamp = (v, a, b) => {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    return Math.max(lo, Math.min(v, hi));
  };

  const arePointsEqual = (p1, p2, epsilon = 1e-9) =>
    Math.abs(p1[0] - p2[0]) <= epsilon && Math.abs(p1[1] - p2[1]) <= epsilon;

  const coords = locations
    .map((point) => point.split(",").map(Number))
    .filter((pair) => pair.length === 2 && pair.every((num) => !Number.isNaN(num)));

  if (coords.length < 2) return "[]";

  // 去除重复的连续点以及收尾重复
  const sanitized = [];
  coords.forEach((pt, idx) => {
    if (idx === 0 || !arePointsEqual(pt, coords[idx - 1])) {
      sanitized.push(pt);
    }
  });
  if (sanitized.length > 1 && arePointsEqual(sanitized[0], sanitized[sanitized.length - 1])) {
    sanitized.pop();
  }

  if (sanitized.length < 2) return "[]";

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

  // 三次贝塞尔曲线插值（用于弯曲段）
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

  // 计算简单的控制点（基于邻点方向）
  const calculateControlPoints = (prev, current, next) => {
    if (!prev) prev = current;
    if (!next) next = current;

    const v1 = [current[0] - prev[0], current[1] - prev[1]];
    const v2 = [next[0] - current[0], next[1] - current[1]];

    // 控制点距离依赖于曲线平滑度与邻向量长度
    const cp1 = [current[0] + v1[0] * curveSmoothness, current[1] + v1[1] * curveSmoothness];
    const cp2 = [current[0] + v2[0] * -curveSmoothness, current[1] + v2[1] * -curveSmoothness];
    return [cp1, cp2];
  };

  // 处理初始点：随机选择起点并应用轻微抖动以避免固定起点
  let currentIdx = Math.floor(Math.random() * sanitized.length);
  const startNextIdx = (currentIdx + 1) % sanitized.length;
  const startPoint = sanitized[currentIdx];
  const startNextPoint = sanitized[startNextIdx];
  // 在起点附近做小抖动，并限制在起点与下一个点的包围盒附近，避免越界
  let lng = startPoint[0] + smallJitter();
  let lat = startPoint[1] + smallJitter();
  lng = clamp(lng, Math.min(startPoint[0], startNextPoint[0]) - 0.00001, Math.max(startPoint[0], startNextPoint[0]) + 0.00001);
  lat = clamp(lat, Math.min(startPoint[1], startNextPoint[1]) - 0.00001, Math.max(startPoint[1], startNextPoint[1]) + 0.00001);

  result.push(`${lng}-${lat}-${startTime}-${randAccuracy()}`);

  let prevSpeed = Math.random() * (2.6 - 1.7) + 1.7;
  let lastOut = [lng, lat];

  while (generatedDistance < distance) {
    const nextIdx = (currentIdx + 1) % sanitized.length;
    const currOriginal = sanitized[currentIdx];
    const nextOriginal = sanitized[nextIdx];

    const segmentDistance = getDistance(currOriginal, nextOriginal);
    if (segmentDistance <= 0.5) {
      currentIdx = nextIdx;
      continue;
    }

    const prevIdx = currentIdx > 0 ? currentIdx - 1 : sanitized.length - 1;
    const nextNextIdx = (nextIdx + 1) % sanitized.length;
    const prevPoint = sanitized[prevIdx];
    const nextNext = sanitized[nextNextIdx];

    const turnAngle = calculateTurnAngle(prevPoint, currOriginal, nextOriginal);
  const isStraight = Math.abs(turnAngle) <= straightAngleThreshold;

    // 决定步数：曲线段适当增加点数以保证平滑
    let steps = Math.max(1, Math.round(segmentDistance / baseSpacing));
  if (!isStraight) steps = Math.min(maxPointsPerSegment, Math.round(steps * 2));
    else steps = Math.min(maxPointsPerSegment, steps);

    let segmentCompleted = false;
    const dx = nextOriginal[0] - currOriginal[0];
    const dy = nextOriginal[1] - currOriginal[1];
    const perp = [-dy, dx];
    const perpLen = Math.sqrt(perp[0] * perp[0] + perp[1] * perp[1]) || 1;
    const perpUnit = [perp[0] / perpLen, perp[1] / perpLen];

    const maxLateral = DEFAULT_JITTER * 2; // 默认 2x jitter
    const lateralMag = (Math.random() - 0.5) * 2 * maxLateral;

    for (let step = 1; step <= steps; step++) {
      const t = step / steps;
      let point;

      if (isStraight) {
        let lngInterp = currOriginal[0] + dx * t;
        let latInterp = currOriginal[1] + dy * t;

        const lateralFactor = Math.sin(Math.PI * t); // 在中间最大
        lngInterp += perpUnit[0] * lateralMag * lateralFactor;
        latInterp += perpUnit[1] * lateralMag * lateralFactor;

        lngInterp += smallJitter() * 0.2;
        latInterp += smallJitter() * 0.2;

        lngInterp = clamp(lngInterp, Math.min(currOriginal[0], nextOriginal[0]) - 0.00001, Math.max(currOriginal[0], nextOriginal[0]) + 0.00001);
        latInterp = clamp(latInterp, Math.min(currOriginal[1], nextOriginal[1]) - 0.00001, Math.max(currOriginal[1], nextOriginal[1]) + 0.00001);

        point = [lngInterp, latInterp];
      } else {
        const segMeters = segmentDistance;
        const degPerMeter = 1 / 111320; // 约 8.983e-6 度/米
        const padDeg = Math.min(0.00002, Math.max(0.000003, segMeters * degPerMeter * 0.25));

        const prevV = [currOriginal[0] - prevPoint[0], currOriginal[1] - prevPoint[1]];
        const nextV = [nextOriginal[0] - currOriginal[0], nextOriginal[1] - currOriginal[1]];

        // 初步控制点（基于邻向量）
        let cp1 = [
          currOriginal[0] + prevV[0] * curveSmoothness + nextV[0] * (curveSmoothness / 2),
          currOriginal[1] + prevV[1] * curveSmoothness + nextV[1] * (curveSmoothness / 2)
        ];
        let cp2 = [
          nextOriginal[0] - (nextNext[0] - nextOriginal[0]) * curveSmoothness - nextV[0] * (curveSmoothness / 2),
          nextOriginal[1] - (nextNext[1] - nextOriginal[1]) * curveSmoothness - nextV[1] * (curveSmoothness / 2)
        ];

        // 限制控制点偏移，确保控制点不会距对应端点超过 padDeg
        cp1[0] = clamp(cp1[0], currOriginal[0] - padDeg, currOriginal[0] + padDeg);
        cp1[1] = clamp(cp1[1], currOriginal[1] - padDeg, currOriginal[1] + padDeg);
        cp2[0] = clamp(cp2[0], nextOriginal[0] - padDeg, nextOriginal[0] + padDeg);
        cp2[1] = clamp(cp2[1], nextOriginal[1] - padDeg, nextOriginal[1] + padDeg);

        // lateralMag 限制到 padDeg 的量级，避免过度偏移
        const lateralLimited = Math.max(-padDeg, Math.min(padDeg, lateralMag));

        // 把 lateral 应用到控制点（相同 lateralLimited，方向为 perpUnit）
        cp1[0] += perpUnit[0] * lateralLimited * 0.6;
        cp1[1] += perpUnit[1] * lateralLimited * 0.6;
        cp2[0] += perpUnit[0] * lateralLimited * 0.6;
        cp2[1] += perpUnit[1] * lateralLimited * 0.6;

        const bez = cubicBezier(currOriginal, cp1, cp2, nextOriginal, t);

        // 少量抖动以避免过于规则，但幅度很小
        const lngVal = bez[0] + smallJitter() * 0.08;
        const latVal = bez[1] + smallJitter() * 0.08;

        const lngClamped = clamp(lngVal, Math.min(currOriginal[0], nextOriginal[0]) - padDeg, Math.max(currOriginal[0], nextOriginal[0]) + padDeg);
        const latClamped = clamp(latVal, Math.min(currOriginal[1], nextOriginal[1]) - padDeg, Math.max(currOriginal[1], nextOriginal[1]) + padDeg);
        point = [lngClamped, latClamped];
      }

      const segMeters = getDistance(lastOut, point);
      const targetSpeed = Math.random() * (2.6 - 1.7) + 1.7;
      const speed = prevSpeed * 0.85 + targetSpeed * 0.15;
      prevSpeed = speed;

      const timeInc = (segMeters / Math.max(0.5, speed)) * 1000;
      startTime += Math.round(timeInc);

      const accuracy = (Math.random() * (turnAngle > 20 ? 5 : 3) + 0.5).toFixed(1);

      result.push(`${point[0]}-${point[1]}-${startTime}-${accuracy}`);
      generatedDistance += segMeters;
      lastOut = point;

      if (result.length >= maxTotalPoints || generatedDistance >= distance) {
        segmentCompleted = true;
        break;
      }
    }

    currentIdx = nextIdx;

    if (segmentCompleted || result.length >= maxTotalPoints) {
      break;
    }
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
