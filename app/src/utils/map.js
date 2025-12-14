// 动态导入所有地图文件
const mapModules = import.meta.glob("../assets/maps/*.json", { eager: true });

// 地图数据集合：键为地图名称，值为该地图的坐标数组（格式：["经度,纬度", ...]）
let mapDataCollection = {
  default: null, // 默认地图将在初始化时设置
};

// 存储所有可用地图ID的数组
let availableMapIds = [];

// 存储地图ID到名称的映射
let mapNameCollection = {};

/**
 * 动态加载地图文件
 */
export async function loadMapFiles() {
  try {
    // 清空现有数据
    mapDataCollection = {};
    availableMapIds = [];
    mapNameCollection = {};

    // 从动态导入的地图模块加载数据
    Object.keys(mapModules).forEach((modulePath) => {
      const mapFileData = mapModules[modulePath].default;
      mapDataCollection[mapFileData.mapId] = mapFileData.mapData;
      availableMapIds.push(mapFileData.mapId);
      mapNameCollection[mapFileData.mapId] = mapFileData.mapName;
      console.log(
        `成功加载地图: ${mapFileData.mapId} (${mapFileData.mapName})`
      );
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
 * @param durationMinutes 跑步总时长（分钟，可选，缺省时按 7-9 分钟/公里估算）
 * @returns 轨迹点JSON字符串（格式：["经度-纬度-时间戳-定位精度", ...]）
 */
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

/**
 * 获取地图ID到名称的映射
 * @returns 地图ID到名称的对象
 */
export function getMapNames() {
  return { ...mapNameCollection };
}
