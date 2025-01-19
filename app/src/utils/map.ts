import type { MapItem, MapOption } from "@/types/map";
import cuit_hkg from "@/data/maps/cuit/hkg";
import cuit_lqy from "@/data/maps/cuit/lqy";
import cdutcm_wj from "@/data/maps/cdutcm/wj";
import ncwsxx from "@/data/maps/ncwsxx/index";

type MapData = {
  [key: string]: { id: number; location: string; edge: number[] }[];
};

const mapData: MapData = {
  cuit_hkg: cuit_hkg.mapdata,
  cuit_lqy: cuit_lqy.mapdata,
  cdutcm_wj: cdutcm_wj.mapdata,
  ncwsxx: ncwsxx.mapdata,
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
  };

  return Object.entries(schoolMaps).map(([label, value]) => ({
    label,
    value,
  }));
}
