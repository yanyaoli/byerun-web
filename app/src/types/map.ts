// 基础地图点位类型
export interface MapPoint {
  lat: number;
  lng: number;
}

// 地图数据项类型
export interface MapItem {
  id: number;
  location: string;
  edge: number[];
}

// 地图选项类型
export interface MapOption {
  label: string;
  value: string;
}

// 地图数据集合类型
export interface MapDataCollection {
  [key: string]: MapItem[];
}

// 地图路径数据类型
export interface MapPathData {
  pathLength: number;
  startPoint: MapPoint;
  endPoint: MapPoint;
  path: MapPoint[];
  mapChoice: string;
}
