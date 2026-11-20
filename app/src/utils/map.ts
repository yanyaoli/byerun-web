const mapModules = import.meta.glob<any>('../assets/maps/*.json', { eager: true });

const CUSTOM_MAPS_KEY = 'byerun.custom_maps';

export interface CustomMapItem {
  name: string;
  data: string[];
  createdAt: number;
  updatedAt: number;
}

let mapDataCollection: Record<string, string[]> = { default: [] };
let availableMapIds: string[] = [];
let mapNameCollection: Record<string, string> = {};
let hasLoadedMapFiles = false;
let mapFilesLoadingPromise: Promise<string[]> | null = null;
let customMapsLoaded = false;
let customMapDataCollection: Record<string, CustomMapItem> = {};
let customMapIds: string[] = [];
let customMapNames: Record<string, string> = {};

export async function loadMapFiles(forceReload = false): Promise<string[]> {
  if (hasLoadedMapFiles && !forceReload) {
    return [...availableMapIds];
  }

  if (mapFilesLoadingPromise && !forceReload) {
    return mapFilesLoadingPromise;
  }

  mapFilesLoadingPromise = (async () => {
    try {
      mapDataCollection = {};
      availableMapIds = [];
      mapNameCollection = {};

      Object.values(mapModules).forEach((moduleData: any) => {
        const mapFileData = moduleData?.default ?? moduleData;
        const mapId = String(mapFileData?.mapId || '').trim();
        const mapData = mapFileData?.mapData;
        if (!mapId || !Array.isArray(mapData)) return;

        mapDataCollection[mapId] = mapData;
        availableMapIds.push(mapId);
        mapNameCollection[mapId] = String(mapFileData?.mapName || mapId).trim() || mapId;
      });

      if (availableMapIds.length > 0) {
        mapDataCollection.default = mapDataCollection[availableMapIds[0]];
      } else {
        console.warn('No map files found.');
        mapDataCollection.default = [];
      }

      hasLoadedMapFiles = true;
      return [...availableMapIds];
    } catch (error) {
      console.error('Failed to load map files:', error);
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

function persistCustomMapsToStorage(): void {
  localStorage.setItem(CUSTOM_MAPS_KEY, JSON.stringify(customMapDataCollection));
}

export function loadCustomMaps(forceReload = false): string[] {
  if (customMapsLoaded && !forceReload) {
    return [...customMapIds];
  }

  customMapDataCollection = {};
  customMapIds = [];
  customMapNames = {};

  try {
    const stored = localStorage.getItem(CUSTOM_MAPS_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data && typeof data === 'object') {
        customMapDataCollection = { ...data };
        customMapIds = Object.keys(data);
        customMapNames = {};
        customMapIds.forEach((id) => {
          customMapNames[id] = data[id]?.name || id;
        });
      }
    }
  } catch (e) {
    console.error('Failed to load custom maps:', e);
  }

  customMapsLoaded = true;
  return [...customMapIds];
}

export function saveCustomMap(mapId: string, mapName: string, mapData: string[]): string {
  loadCustomMaps();

  const id = String(mapId || '').trim() || `custom_${Date.now()}`;
  const existing = customMapDataCollection[id] || ({} as Partial<CustomMapItem>);
  const name = String(mapName || '').trim() || String(existing.name || '').trim() || id;

  customMapDataCollection[id] = {
    name,
    data: mapData,
    createdAt: Number(existing.createdAt) || Date.now(),
    updatedAt: Date.now(),
  };
  customMapNames[id] = name;

  if (!customMapIds.includes(id)) {
    customMapIds.unshift(id);
  }

  persistCustomMapsToStorage();

  return id;
}

export function renameCustomMap(mapId: string, mapName: string): boolean {
  loadCustomMaps();

  const id = String(mapId || '').trim();
  const name = String(mapName || '').trim();
  if (!id || !name || !customMapDataCollection[id]) return false;

  customMapDataCollection[id] = {
    ...customMapDataCollection[id],
    name,
    updatedAt: Date.now(),
  };
  customMapNames[id] = name;
  persistCustomMapsToStorage();
  return true;
}

export function deleteCustomMap(mapId: string): boolean {
  loadCustomMaps();

  const id = String(mapId || '').trim();
  if (!id || !customMapDataCollection[id]) return false;

  delete customMapDataCollection[id];
  customMapIds = customMapIds.filter((i) => i !== id);
  delete customMapNames[id];

  persistCustomMapsToStorage();

  return true;
}

export function getCustomMapData(mapId: string): string[] {
  loadCustomMaps();
  const id = String(mapId || '').trim();
  return customMapDataCollection[id]?.data || [];
}

export function isCustomMap(mapId: string): boolean {
  loadCustomMaps();
  return customMapIds.includes(mapId);
}

export function getCustomMapNames(): Record<string, string> {
  loadCustomMaps();
  return { ...customMapNames };
}

export interface MapValidationResult {
  valid: boolean;
  error?: string;
  points?: [number, number][];
  mapName?: string;
}

export function validateMapData(data: any): MapValidationResult {
  if (!data) return { valid: false, error: '数据为空' };

  let parsed = data;
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);
    } catch {
      return { valid: false, error: 'JSON格式解析失败' };
    }
  }

  let extractedMapName: string | undefined;
  if (parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
    if (typeof parsed.mapName === 'string' && parsed.mapName.trim()) {
      extractedMapName = parsed.mapName.trim();
    }
    if (Array.isArray(parsed.mapData)) {
      parsed = parsed.mapData;
    } else if (Array.isArray(parsed.track)) {
      parsed = parsed.track;
    } else if (Array.isArray(parsed.points)) {
      parsed = parsed.points;
    }
  }

  if (!Array.isArray(parsed)) {
    return { valid: false, error: '数据必须是数组或包含 mapData 数组的对象' };
  }

  if (parsed.length < 2) {
    return { valid: false, error: '至少需要2个坐标点' };
  }

  const validPoints: [number, number][] = [];
  for (const item of parsed) {
    let lngRaw: any;
    let latRaw: any;

    if (Array.isArray(item) && item.length >= 2) {
      [lngRaw, latRaw] = item;
    } else if (item && typeof item === 'object') {
      lngRaw = item.lng ?? item.lon ?? item.longitude;
      latRaw = item.lat ?? item.latitude;
    } else if (typeof item === 'string') {
      const text = item.trim();
      if (!text) continue;
      if (text.includes(',')) {
        [lngRaw, latRaw] = text.split(',');
      } else {
        const matched = text.match(/^(-?\d+(?:\.\d+)?)\-(-?\d+(?:\.\d+)?)$/);
        if (!matched) continue;
        lngRaw = matched[1];
        latRaw = matched[2];
      }
    } else {
      continue;
    }

    const lng = Number(lngRaw);
    const lat = Number(latRaw);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) continue;

    validPoints.push([lng, lat]);
  }

  if (validPoints.length < 2) {
    return { valid: false, error: '至少需要2个有效坐标点' };
  }

  return { valid: true, points: validPoints, mapName: extractedMapName };
}

export function getMapData(mapChoice = 'default'): string[] {
  const mapId = String(mapChoice || 'default').trim() || 'default';

  if (isCustomMap(mapId)) {
    const customData = getCustomMapData(mapId);
    if (customData && customData.length > 0) {
      return customData;
    }
  }

  return mapDataCollection[mapId] || mapDataCollection.default || [];
}

export function genTrackPoints(
  distance: number | string,
  mapChoice = 'default',
  durationMinutes?: number,
): string {
  const targetDistance = Number(distance);
  if (!Number.isFinite(targetDistance) || targetDistance <= 0) return '[]';

  let mapData: string[] = [];
  if (String(mapChoice).startsWith('custom_')) {
    const customId = mapChoice.replace('custom_', '');
    mapData = getCustomMapData(customId);
  } else {
    mapData = getMapData(mapChoice);
  }

  const coords = mapData
    .map((point) => point.split(',').map(Number))
    .filter((pair) => pair.length === 2 && pair.every((num) => !Number.isNaN(num)));
  if (coords.length < 2) return '[]';

  const sanitized: [number, number][] = [];
  coords.forEach((point, index) => {
    const prev = coords[index - 1];
    if (
      index === 0 ||
      Math.abs(point[0] - prev[0]) > 1e-9 ||
      Math.abs(point[1] - prev[1]) > 1e-9
    ) {
      sanitized.push([point[0], point[1]]);
    }
  });

  if (
    sanitized.length > 1 &&
    Math.abs(sanitized[0][0] - sanitized[sanitized.length - 1][0]) <= 1e-9 &&
    Math.abs(sanitized[0][1] - sanitized[sanitized.length - 1][1]) <= 1e-9
  ) {
    sanitized.pop();
  }
  if (sanitized.length < 2) return '[]';

  const bounds = sanitized.reduce(
    (acc, [lng, lat]) => {
      acc.minLng = Math.min(acc.minLng, lng);
      acc.maxLng = Math.max(acc.maxLng, lng);
      acc.minLat = Math.min(acc.minLat, lat);
      acc.maxLat = Math.max(acc.maxLat, lat);
      return acc;
    },
    { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity },
  );

  const getDistance = (start: [number, number], end: [number, number]): number => {
    const [lng1, lat1] = start;
    const [lng2, lat2] = end;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    return 6378137 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const segments: { from: [number, number]; to: [number, number]; length: number }[] = [];
  for (let i = 0; i < sanitized.length; i++) {
    const from = sanitized[i];
    const to = sanitized[(i + 1) % sanitized.length];
    const length = getDistance(from, to);
    if (length >= 0.5) {
      segments.push({ from, to, length });
    }
  }
  if (segments.length === 0) return '[]';

  const clampValue = (value: number, a: number, b: number): number => {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    return Math.max(lo, Math.min(value, hi));
  };

  const pace = clampValue(
    Number(durationMinutes) > 0
      ? Number(durationMinutes) / (targetDistance / 1000)
      : 7.6 + Math.random() * 1.2,
    6,
    10,
  );
  const durationMs = Math.round((targetDistance / 1000) * pace * 60 * 1000);
  const baseSpeed = 1000 / (pace * 60);
  const baseSpacing = clampValue(targetDistance / 1200, 4, 8);
  const maxTotalPoints = 4000;
  const jitter = 0.000003;
  const bboxPad = 0.00005;

  const addJitter = ([lng, lat]: [number, number]): [number, number] => [
    clampValue(
      lng + (Math.random() - 0.5) * 2 * jitter,
      bounds.minLng - bboxPad,
      bounds.maxLng + bboxPad,
    ),
    clampValue(
      lat + (Math.random() - 0.5) * 2 * jitter,
      bounds.minLat - bboxPad,
      bounds.maxLat + bboxPad,
    ),
  ];

  let segIndex = Math.floor(Math.random() * segments.length);
  let segOffset = Math.random() * Math.max(1, segments[segIndex].length * 0.6);
  let lastPoint = addJitter([
    segments[segIndex].from[0] +
      (segments[segIndex].to[0] - segments[segIndex].from[0]) *
        clampValue(segOffset / segments[segIndex].length, 0, 1),
    segments[segIndex].from[1] +
      (segments[segIndex].to[1] - segments[segIndex].from[1]) *
        clampValue(segOffset / segments[segIndex].length, 0, 1),
  ]);

  let elapsedMs = 0;
  let generatedDistance = 0;
  let currentSpeed = baseSpeed;
  const result = [`${lastPoint[0]}-${lastPoint[1]}`];

  while (generatedDistance < targetDistance && result.length < maxTotalPoints) {
    const remainingDistance = targetDistance - generatedDistance;
    let advance = Math.min(remainingDistance, baseSpacing * (0.9 + Math.random() * 0.35));

    while (advance > 0) {
      const segment = segments[segIndex];
      const remainingOnSeg = segment.length - segOffset;
      const stepOnSegment = Math.min(advance, remainingOnSeg);
      segOffset += stepOnSegment;
      advance -= stepOnSegment;

      if (segOffset >= segment.length - 1e-6) {
        segIndex = (segIndex + 1) % segments.length;
        segOffset = 0;
      }
    }

    const segment = segments[segIndex];
    const point = addJitter([
      segment.from[0] + (segment.to[0] - segment.from[0]) * clampValue(segOffset / segment.length, 0, 1),
      segment.from[1] + (segment.to[1] - segment.from[1]) * clampValue(segOffset / segment.length, 0, 1),
    ]);
    const traveled = getDistance(lastPoint, point);
    generatedDistance += traveled;

    const remainingTime = Math.max(2000, durationMs - elapsedMs);
    const neededSpeed =
      remainingDistance > 0 ? remainingDistance / (remainingTime / 1000) : baseSpeed;
    const targetSpeed = clampValue(
      (baseSpeed * 0.6 + neededSpeed * 0.4) * (0.95 + Math.random() * 0.1),
      baseSpeed * 0.8,
      baseSpeed * 1.2,
    );
    currentSpeed = clampValue(
      currentSpeed * 0.65 + targetSpeed * 0.35,
      baseSpeed * 0.75,
      baseSpeed * 1.25,
    );
    elapsedMs += (traveled / Math.max(0.5, currentSpeed)) * 1000;

    result.push(`${point[0]}-${point[1]}`);
    lastPoint = point;
  }

  return JSON.stringify(result);
}

export function getMapNames(): Record<string, string> {
  loadCustomMaps();
  const names = { ...mapNameCollection };
  customMapIds.forEach((id) => {
    names[`custom_${id}`] = customMapNames[id];
  });
  return names;
}

export function getAllMapIds(): string[] {
  loadCustomMaps();
  const customIds = customMapIds.map((id) => `custom_${id}`);
  return [...customIds, ...availableMapIds];
}
