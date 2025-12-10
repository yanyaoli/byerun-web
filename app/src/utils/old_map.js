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
 * 新轨迹生成算法：仅依赖地图坐标数组（location数组）生成拟人化跑步轨迹
 * @param distance 目标跑步距离（单位：米）
 * @param mapChoice 地图名称（可选，默认值为"default"）
 * @returns 轨迹点JSON字符串（格式：["经度-纬度-时间戳-定位精度", ...]）
 */
export function genTrackPoints(distance, mapChoice = "default") {
  const locations = getMapData(mapChoice); // 获取指定地图的坐标数据
  if (!locations || locations.length === 0) return "[]"; // 若地图无数据，返回空数组JSON

  // 轨迹生成控制参数
  const targetSpacing = 15; // 生成点的目标间距（单位：米，自适应调整）
  const maxPointsPerSegment = 200; // 每段轨迹的最大生成点数（防止点数过多）
  const lateralFactor = 0.01; // 横向最大偏移的计算系数（基于段长的比例）

  let generatedDistance = 0; // 累计生成的实际轨迹距离（米）
  let startTime = Date.now() - 30 * 60 * 1000; // 轨迹起始时间（设为当前时间的30分钟前）
  const result = []; // 存储最终轨迹点的数组

  /**
   * 辅助函数：将米单位的偏移转换为经纬度偏移（基于小距离假设简化计算）
   * @param dxMeters 经度方向的米偏移（东为正，西为负）
   * @param dyMeters 纬度方向的米偏移（北为正，南为负）
   * @param lat 当前纬度（影响经度方向的米-度转换系数）
   * @returns 经纬度偏移（格式：[经度偏移, 纬度偏移]）
   */
  const metersToLngLat = (dxMeters, dyMeters, lat) => {
    const metersPerDegLat = 111320; // 纬度方向：1度约等于111320米（全球近似恒定）
    // 经度方向：1度对应的米数随纬度变化，公式基于地球半径计算
    const metersPerDegLng =
      ((Math.PI / 180) * 6378137 * Math.cos((lat * Math.PI) / 180)) /
      (Math.PI / 180);

    // 米偏移转经纬度偏移（米 ÷ 每度对应的米数）
    return [dxMeters / metersPerDegLng, dyMeters / metersPerDegLat];
  };

  // 解析初始参考点（地图第一个点）并添加小范围随机偏移
  let idx = 0; // 当前地图点的索引
  let [lng, lat] = locations[0].split(",").map(Number); // 初始点经纬度（字符串转数字）

  // 对初始点加0-1.5米的随机偏移，避免固定公开点被检测
  const initialJitterMeters = Math.random() * 1.5;
  const jitterLngLat = metersToLngLat(
    (Math.random() - 0.5) * initialJitterMeters, // 经度方向偏移（±initialJitterMeters/2）
    (Math.random() - 0.5) * initialJitterMeters, // 纬度方向偏移（±initialJitterMeters/2）
    lat // 基于初始点纬度计算转换系数
  );
  lng += jitterLngLat[0]; // 应用经度偏移
  lat += jitterLngLat[1]; // 应用纬度偏移

  // 添加初始轨迹点（格式：经度-纬度-时间戳-定位精度）
  result.push(`${lng}-${lat}-${startTime}-${randAccuracy()}`);

  // 初始化跑步速度（米/秒）：基于真实跑步配速（6-10分钟/公里对应1.666-2.777米/秒）
  let prevSpeed = Math.random() * (2.6 - 1.7) + 1.7; // 初始速度范围：1.7-2.6米/秒

  /**
   * 辅助函数：计算两个向量之间的夹角（单位：度）
   * @param a 第一个向量（格式：[x, y]）
   * @param b 第二个向量（格式：[x, y]）
   * @returns 两向量夹角（度，范围0-180）
   */
  const angleBetween = (a, b) => {
    // 计算向量点积
    const dot = a[0] * b[0] + a[1] * b[1];
    // 计算两个向量的模长
    const na = Math.hypot(a[0], a[1]);
    const nb = Math.hypot(b[0], b[1]);

    // 若任一向量模长为0，夹角为0
    if (na === 0 || nb === 0) return 0;

    // 计算余弦值（限制在[-1,1]内，避免浮点误差导致acos报错）
    const cos = Math.max(-1, Math.min(1, dot / (na * nb)));

    return Math.acos(cos) * (180 / Math.PI); // 弧度转角度并返回
  };

  // 循环生成轨迹，直到累计距离达到目标距离
  while (generatedDistance < distance) {
    const nextIdx = (idx + 1) % locations.length; // 下一个地图点的索引（循环取模，实现环形路线）
    // 解析下一个地图点的原始坐标（未偏移）
    const [nextLngRaw, nextLatRaw] = locations[nextIdx].split(",").map(Number);

    // 对下一个地图点（终点）加0-1.5米的随机偏移，避免固定点检测
    const endpointJitter = Math.random() * 1.5; // 终点偏移幅度（米）
    const endpointJitterLngLat = metersToLngLat(
      (Math.random() - 0.5) * endpointJitter,
      (Math.random() - 0.5) * endpointJitter,
      nextLatRaw // 基于终点原始纬度计算转换系数
    );
    const nextLng = nextLngRaw + endpointJitterLngLat[0]; // 应用终点经度偏移
    const nextLat = nextLatRaw + endpointJitterLngLat[1]; // 应用终点纬度偏移

    // 计算当前段（当前点到下一个点）的直线距离
    const segDist = getDistance([lng, lat], [nextLng, nextLat]);
    // 若段长小于0.5米，跳过该段（避免无效计算）
    if (segDist <= 0.5) {
      idx = nextIdx;
      lng = nextLng;
      lat = nextLat;
      continue;
    }

    // 计算当前段需要生成的插值点数：基于段长和目标间距，且不超过最大点数
    const n = Math.min(
      maxPointsPerSegment,
      Math.max(1, Math.ceil(segDist / targetSpacing))
    );

    // 计算当前段的米单位向量（用于后续横向偏移计算）
    const dx = nextLng - lng; // 当前段的经度差（度）
    const dy = nextLat - lat; // 当前段的纬度差（度）

    // 经纬度差转米单位（用于向量计算）
    const approxMetersPerDegLat = 111320; // 纬度方向1度≈111320米
    const approxMetersPerDegLng =
      ((Math.PI / 180) * 6378137 * Math.cos((lat * Math.PI) / 180)) /
      (Math.PI / 180);
    const segVecMeters = [
      dx * approxMetersPerDegLng,
      dy * approxMetersPerDegLat,
    ]; // 米单位段向量
    const segLenMeters = Math.hypot(segVecMeters[0], segVecMeters[1]); // 当前段长度（米）

    // 计算横向最大偏移（垂直于段方向）：基于段长，最小0.5米，最大6米
    const lateralMax = Math.min(Math.max(0.5, segLenMeters * lateralFactor), 6);

    // 计算前一段的米单位向量（用于检测当前是否为转弯）
    let prevSegVecMeters = [0, 0]; // 前一段向量（默认初始为0向量）
    if (result.length >= 2) {
      // 至少有2个轨迹点时，才能计算前一段向量
      const last = result[result.length - 1].split("-"); // 最后一个轨迹点
      const secondLast = result[result.length - 2].split("-"); // 倒数第二个轨迹点
      const lx = Number(last[0]); // 最后一个点的经度
      const ly = Number(last[1]); // 最后一个点的纬度
      const sx = Number(secondLast[0]); // 倒数第二个点的经度
      const sy = Number(secondLast[1]); // 倒数第二个点的纬度

      // 计算前一段的米单位向量
      prevSegVecMeters = [
        (lx - sx) * approxMetersPerDegLng,
        (ly - sy) * approxMetersPerDegLat,
      ];
    }

    // 计算转弯角度（当前段与前一段的夹角）
    const turnAngle = angleBetween(prevSegVecMeters, segVecMeters);

    // 插值循环：生成当前段的轨迹点（包含终点）
    let lastOut = [lng, lat]; // 上一个生成的轨迹点（初始为当前段起点）
    for (let i = 1; i <= n; i++) {
      const t = i / n; // 插值比例（0-1，i=1时t=1/n，i=n时t=1）

      // 1. 线性插值：计算基础点（无偏移的直线上的点）
      const ix = lng + dx * t; // 基础点经度
      const iy = lat + dy * t; // 基础点纬度

      // 2. 计算横向偏移（垂直于当前段方向）
      const turnBoost = turnAngle > 20 ? 1.2 : 1.0; // 转弯时（角度>20度）偏移放大1.2倍
      // 横向偏移幅度：±lateralMax*turnBoost，且中点（t=0.5）偏移最大（sin(πt)模拟）
      const lateral =
        (Math.random() - 0.5) *
        2 *
        lateralMax *
        turnBoost *
        Math.sin(Math.PI * t);

      // 垂直于当前段的单位向量（米单位）
      const perp = [-segVecMeters[1], segVecMeters[0]]; // 垂直向量（逆时针旋转90度）
      const perpLen = Math.hypot(perp[0], perp[1]) || 1; // 垂直向量模长（避免除以0）
      const perpUnit = [perp[0] / perpLen, perp[1] / perpLen]; // 垂直单位向量

      // 横向偏移（米）转经纬度偏移，并应用到基础点
      const lateralMeters = lateral; // 横向偏移（米）
      const lateralDeg = metersToLngLat(
        perpUnit[0] * lateralMeters,
        perpUnit[1] * lateralMeters,
        iy // 基于基础点纬度计算转换系数
      );
      const outLng = ix + lateralDeg[0]; // 最终生成点的经度
      const outLat = iy + lateralDeg[1]; // 最终生成点的纬度

      // 3. 计算时间增量（基于速度）
      const segMeters = getDistance(lastOut, [outLng, outLat]); // 当前点与上一点的距离（米）

      // 速度平滑：基于上一次速度（85%权重）和目标速度（15%权重），避免速度突变
      const targetSpeed = Math.random() * (2.6 - 1.7) + 1.7; // 目标速度（1.7-2.6米/秒）
      const speed = prevSpeed * 0.85 + targetSpeed * 0.15;
      prevSpeed = speed; // 更新上一次速度，用于下一轮平滑

      // 时间增量（毫秒）= 距离（米）/ 速度（米/秒） * 1000（毫秒/秒），取整
      const timeInc = (segMeters / Math.max(0.5, speed)) * 1000;
      startTime += Math.round(timeInc); // 更新当前时间戳

      // 4. 生成定位精度（转弯时精度范围更大）
      const accMax = turnAngle > 20 ? 6 : 4; // 转弯时最大精度6米，直道时4米
      const accMin = 0.5; // 最小精度0.5米
      const accuracy = (Math.random() * (accMax - accMin) + accMin).toFixed(1);

      // 5. 添加当前轨迹点到结果数组
      result.push(`${outLng}-${outLat}-${startTime}-${accuracy}`);

      // 更新累计距离和上一个生成点
      generatedDistance += segMeters;
      lastOut = [outLng, outLat];

      // 若累计距离达到目标距离，提前退出插值循环
      if (generatedDistance >= distance) break;
    }

    // 更新当前地图点索引和坐标（准备下一段轨迹计算）
    idx = nextIdx;
    lng = nextLng;
    lat = nextLat;

    // 安全退出机制：若生成点数量超过20000，强制退出（防止无限循环）
    if (result.length > 20000) break;
  }

  // 将轨迹点数组转为JSON字符串并返回
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