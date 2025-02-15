export interface MapItem {
  id: number;
  location: string;
  edge: number[];
}

export interface MapData {
  [key: string]: MapItem[];
}

export interface MapOption {
  label: string;
  value: string;
}

export interface MapPoint {
  lat: number;
  lng: number;
}

export interface MapData {
  value: string;
  label: string;
  pathLength: number;
  startPoint: MapPoint;
  endPoint: MapPoint;
  path: MapPoint[];
}

export interface MapPathData {
  pathLength: number;
  startPoint: PathPoint;
  endPoint: PathPoint;
  path: PathPoint[];
  mapChoice: string;
}
