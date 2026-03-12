// 动态导入所有地图文件
const mapModules = import.meta.glob('../assets/maps/*.json', { eager: true });

// 地图数据集合：键为地图ID，值为该地图的坐标数组（格式：["经度,纬度", ...]）
let mapDataCollection = {
  default: [], // 默认地图在初始化时设置
};

// 存储所有可用地图ID的数组
let availableMapIds = [];

// 存储地图ID到名称的映射
let mapNameCollection = {};
let hasLoadedMapFiles = false;
let mapFilesLoadingPromise = null;

function parseMapModule(moduleData) {
  const mapFileData = moduleData?.default ?? moduleData;
  if (!mapFileData || typeof mapFileData !== 'object') return null;

  const mapId = String(mapFileData.mapId || '').trim();
  const mapData = mapFileData.mapData;
  if (!mapId || !Array.isArray(mapData)) return null;

  return {
    mapId,
    mapName: String(mapFileData.mapName || mapId).trim() || mapId,
    mapData,
  };
}

/**
 * 动态加载地图文件
 */
export async function loadMapFiles(forceReload = false) {
  if (hasLoadedMapFiles && !forceReload) {
    return [...availableMapIds];
  }

  if (mapFilesLoadingPromise && !forceReload) {
    return mapFilesLoadingPromise;
  }

  mapFilesLoadingPromise = (async () => {
    try {
      // 清空现有数据
      mapDataCollection = {};
      availableMapIds = [];
      mapNameCollection = {};

      // 从动态导入的地图模块加载数据
      Object.keys(mapModules).forEach((modulePath) => {
        const parsed = parseMapModule(mapModules[modulePath]);
        if (!parsed) return;

        mapDataCollection[parsed.mapId] = parsed.mapData;
        availableMapIds.push(parsed.mapId);
        mapNameCollection[parsed.mapId] = parsed.mapName;
      });

      // 设置默认地图
      if (availableMapIds.length > 0) {
        const firstMapId = availableMapIds[0];
        mapDataCollection.default = mapDataCollection[firstMapId];
      } else {
        console.warn('未找到任何地图文件！');
        mapDataCollection.default = [];
      }

      hasLoadedMapFiles = true;
      return [...availableMapIds];
    } catch (error) {
      console.error('加载地图文件时发生错误:', error);
      mapDataCollection = { default: [] };
      availableMapIds = [];
      mapNameCollection = {};
      hasLoadedMapFiles = false;
      return [];
    } finally {
      mapFilesLoadingPromise = null;
    }
  })();

  return mapFilesLoadingPromise;
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
 * @param mapChoice 地图ID（可选，默认值为"default"）
 * @returns 对应地图的坐标数组（格式：["经度,纬度", ...]），若指定地图不存在则返回默认地图数据
 */
export function getMapData(mapChoice = 'default') {
  const mapId = String(mapChoice || 'default').trim() || 'default';
  return mapDataCollection[mapId] || mapDataCollection.default || [];
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
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 返回最终距离（米）
}

/**
 * 获取地图ID到名称的映射
 * @returns 地图ID到名称的对象
 */
export function getMapNames() {
  return { ...mapNameCollection };
}
