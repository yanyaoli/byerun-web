import cdutcm_wj from './cdutcm/wj'
import cuit_hkg from './cuit/hkg'
import cuit_lqy from './cuit/lqy'

interface MapItem {
  id: number;
  location: string;
  edge: number[];
}

interface MapData {
  [key: string]: MapItem[];
}

const mapData: MapData = {
  cdutcm_wj: cdutcm_wj.mapdata,
  cuit_hkg: cuit_hkg.mapdata,
  cuit_lqy: cuit_lqy.mapdata
};

export function getMapData(mapChoice: string): MapItem[] {
  return mapData[mapChoice] || [];
}