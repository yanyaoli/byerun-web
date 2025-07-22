import cuit_hkg from '../maps/cuit_hkg';
import cuit_lqy from '../maps/cuit_lqy';
import cdutcm_wj from '../maps/cdutcm_wj';
import ncwsxx from '../maps/ncwsxx';
import sctbc from '../maps/sctbc';

const mapDataCollection: Record<string, string[]> = {
  cuit_hkg,
  cuit_lqy,
  cdutcm_wj,
  ncwsxx,
  sctbc,
  default: cuit_hkg, // 默认地图
};

export function getMapData(mapChoice: string = "default"): string[] {
  return mapDataCollection[mapChoice] || mapDataCollection["default"];
}

// 距离计算
export function getDistance(start: number[], end: number[]) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const [lng1, lat1] = start;
  const [lng2, lat2] = end;
  const R = 6378137;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function randPos(start: number[], end: number[]) {
  const random = Math.random();
  const dy = end[1] - start[1];
  const dx = end[0] - start[0];
  return [start[0] + dx * random, start[1] + dy * random];
}
function randAccuracy() {
  return (10 * Math.random()).toFixed(1);
}
function randInt(start: number, end: number) {
  if (start === end) return start;
  const len = end - start;
  return Math.floor(start + len * Math.random());
}

// 新轨迹生成算法：仅依赖 location 数组
export function genTrackPoints(distance: number, mapChoice: string = "default"): string {
  const locations = getMapData(mapChoice);
  if (!locations || locations.length === 0) return "[]";
  let currentDistance = 0;
  let startTime = Date.now() - 30 * 60 * 1000;
  const result: string[] = [];
  // 顺序遍历所有点，循环形成环形
  let idx = 0;
  let [lng, lat] = locations[0].split(",").map(Number);
  result.push(`${lng}-${lat}-${startTime}-${randAccuracy()}`);
  while (currentDistance < distance) {
    const nextIdx = (idx + 1) % locations.length;
    const [nextLng, nextLat] = locations[nextIdx].split(",").map(Number);
    const segDist = getDistance([lng, lat], [nextLng, nextLat]);
    currentDistance += segDist;
    // 插值抖动
    let lastRandPos = [lng, lat];
    for (let j = 0; j < 10; j++) {
      const newRandPos = randPos(lastRandPos, [nextLng, nextLat]);
      const distance1 = getDistance(lastRandPos, newRandPos);
      lastRandPos = newRandPos;
      startTime += (distance1 / randInt(1, 5)) * 1000;
      result.push(`${lastRandPos[0]}-${lastRandPos[1]}-${startTime}-${randAccuracy()}`);
    }
    startTime += randInt(5, 10) * 1000;
    result.push(`${nextLng}-${nextLat}-${startTime}-${randAccuracy()}`);
    idx = nextIdx;
    lng = nextLng;
    lat = nextLat;
  }
  return JSON.stringify(result);
}

export function getDate() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - 30);
  return now.toISOString().replace("T", " ").substring(0, 19);
}
