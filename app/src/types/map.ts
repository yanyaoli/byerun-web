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
