import { getMapData, getDistance } from "./map";

const clampValue = (v, a, b) => {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return Math.max(lo, Math.min(v, hi));
};

const arePointsEqual = (p1, p2, epsilon = 1e-9) =>
  Math.abs(p1[0] - p2[0]) <= epsilon && Math.abs(p1[1] - p2[1]) <= epsilon;

/**
 * 轨迹生成算
 * @param distance 目标跑步距离（单位：米）
 * @param mapChoice 地图名称（默认 "default"）
 * @param durationMinutes 跑步总时长（分钟，可选，缺省时按 7-9 分钟/公里估算）
 * @returns 轨迹点JSON字符串（格式：["经度-纬度-时间戳-定位精度", ...]）
 */
export function genTrackPoints(distance, mapChoice = "default", durationMinutes) {
  const targetDistance = Number(distance);
  if (!Number.isFinite(targetDistance) || targetDistance <= 0) return "[]";

  const locations = getMapData(mapChoice);
  if (!locations || locations.length === 0) return "[]";

  const coords = locations
    .map((point) => point.split(",").map(Number))
    .filter((pair) => pair.length === 2 && pair.every((num) => !Number.isNaN(num)));
  if (coords.length < 2) return "[]";

  const sanitized = [];
  coords.forEach((pt, idx) => {
    if (idx === 0 || !arePointsEqual(pt, coords[idx - 1])) {
      sanitized.push(pt);
    }
  });
  if (sanitized.length > 1 && arePointsEqual(sanitized[0], sanitized[sanitized.length - 1])) {
    sanitized.pop();
  }
  if (sanitized.length < 2) return "[]";

  // 预计算包围盒与线段
  const bounds = sanitized.reduce(
    (acc, [lng, lat]) => {
      acc.minLng = Math.min(acc.minLng, lng);
      acc.maxLng = Math.max(acc.maxLng, lng);
      acc.minLat = Math.min(acc.minLat, lat);
      acc.maxLat = Math.max(acc.maxLat, lat);
      return acc;
    },
    { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
  );

  const segments = [];
  for (let i = 0; i < sanitized.length; i++) {
    const from = sanitized[i];
    const to = sanitized[(i + 1) % sanitized.length];
    const len = getDistance(from, to);
    if (len >= 0.5) {
      segments.push({ from, to, length: len });
    }
  }
  if (segments.length === 0) return "[]";

  // 节奏与配速控制
  const minPace = 6; // min min/km
  const maxPace = 10; // max min/km
  const inferredPace = Number(durationMinutes) > 0
    ? durationMinutes / (targetDistance / 1000)
    : 7.6 + Math.random() * 1.2; // 7.6-8.8 min/km 默认
  const pace = clampValue(inferredPace, minPace, maxPace);
  const durationMs = Math.round((targetDistance / 1000) * pace * 60 * 1000);
  const baseSpeed = 1000 / (pace * 60); // m/s

  const baseSpacing = clampValue(targetDistance / 1200, 4, 8); // 米
  const maxTotalPoints = 4000;
  const jitter = 0.000003; // 约 0.3 米
  const bboxPad = 0.00005;

  const addJitter = ([lng, lat]) => [
    clampValue(lng + (Math.random() - 0.5) * 2 * jitter, bounds.minLng - bboxPad, bounds.maxLng + bboxPad),
    clampValue(lat + (Math.random() - 0.5) * 2 * jitter, bounds.minLat - bboxPad, bounds.maxLat + bboxPad),
  ];

  const projectOnSegment = (seg, offsetMeters) => {
    const t = clampValue(offsetMeters / seg.length, 0, 1);
    const lng = seg.from[0] + (seg.to[0] - seg.from[0]) * t;
    const lat = seg.from[1] + (seg.to[1] - seg.from[1]) * t;
    return [lng, lat];
  };

  // 随机起点，避免每次同一位置
  let segIndex = Math.floor(Math.random() * segments.length);
  let segOffset = Math.random() * Math.max(1, segments[segIndex].length * 0.6);
  let lastPoint = addJitter(projectOnSegment(segments[segIndex], segOffset));

  const startTime = Date.now() - durationMs - Math.floor(Math.random() * 60000 + 20000);
  let currentTime = startTime;
  let elapsedMs = 0;
  let generatedDistance = 0;
  let currentSpeed = baseSpeed;

  const result = [`${lastPoint[0]}-${lastPoint[1]}-${currentTime}-${(Math.random() * 2 + 3).toFixed(1)}`];

  while (generatedDistance < targetDistance && result.length < maxTotalPoints) {
    const remainingDistance = targetDistance - generatedDistance;
    const stepTarget = Math.min(remainingDistance, baseSpacing * (0.9 + Math.random() * 0.35));
    let advance = stepTarget;

    // 沿线段前进，支持跨段与循环
    while (advance > 0) {
      const seg = segments[segIndex];
      const remainingOnSeg = seg.length - segOffset;
      const stepThisSeg = Math.min(advance, remainingOnSeg);
      segOffset += stepThisSeg;
      advance -= stepThisSeg;

      if (segOffset >= seg.length - 1e-6) {
        segIndex = (segIndex + 1) % segments.length;
        segOffset = 0;
      }
    }

    const rawPoint = projectOnSegment(segments[segIndex], segOffset);
    const point = addJitter(rawPoint);

    const traveled = getDistance(lastPoint, point);
    generatedDistance += traveled;

    // 根据剩余距离与目标时长微调速度，避免过快/过慢
    const remainingTime = Math.max(2000, durationMs - elapsedMs);
    const neededSpeed = remainingDistance > 0 ? remainingDistance / (remainingTime / 1000) : baseSpeed;
    const targetSpeed = clampValue(
      (baseSpeed * 0.6 + neededSpeed * 0.4) * (0.95 + Math.random() * 0.1),
      baseSpeed * 0.8,
      baseSpeed * 1.2
    );
    currentSpeed = clampValue(currentSpeed * 0.65 + targetSpeed * 0.35, baseSpeed * 0.75, baseSpeed * 1.25);

    const stepTime = (traveled / Math.max(0.5, currentSpeed)) * 1000;
    elapsedMs += stepTime;
    currentTime += Math.round(stepTime);

    const accuracy = (Math.random() * 2.5 + 2.5).toFixed(1);
    result.push(`${point[0]}-${point[1]}-${currentTime}-${accuracy}`);
    lastPoint = point;
  }

  return JSON.stringify(result);
}
