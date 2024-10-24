import cuit_hkg from "./cuit/hkg";
import cuit_lqy from "./cuit/lqy";
import cdutcm_wj from "./cdutcm/wj";
import ncwsxx from "./ncwsxx/index";

interface MapItem {
  id: number;
  location: string;
  edge: number[];
}

interface MapData {
  [key: string]: MapItem[];
}

const mapData: MapData = {
  cuit_hkg: cuit_hkg.mapdata,   // 成都信息工程大学航空港校区
  cuit_lqy: cuit_lqy.mapdata,   // 成都信息工程大学龙泉校区
  cdutcm_wj: cdutcm_wj.mapdata, // 成都中医药大学温江校区
  ncwsxx: ncwsxx.mapdata,       // 南充卫生学校
};

export function getMapData(mapChoice: string): MapItem[] {
  return mapData[mapChoice] || [];
}

export function getSchoolMaps(): { label: string, value: string }[] {
  const schoolMaps: { [key: string]: string } = {
    "成都信息工程大学航空港校区": "cuit_hkg",
    "成都信息工程大学龙泉校区": "cuit_lqy",
    "成都中医药大学温江校区": "cdutcm_wj",
    "南充卫生学校": "ncwsxx",
  };

  return Object.keys(schoolMaps).map(schoolName => ({
    label: schoolName,
    value: schoolMaps[schoolName]
  }));
}