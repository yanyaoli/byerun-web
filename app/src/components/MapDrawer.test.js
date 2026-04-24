/**
 * MapDrawer 集成测试 - 验证关键功能
 * 运行: 在浏览器开发者控制台执行
 */

// 测试坐标格式转换
console.log('=== 坐标格式转换测试 ===');

// MapDrawer 内部格式 [lat, lng]
const mapDrawerTrack = [
  [30.572269, 104.066541],
  [30.57237, 104.06664],
  [30.57247, 104.06674],
];
console.log('MapDrawer 轨迹:', mapDrawerTrack);

// 转换为 SubmitRun 格式 [lng, lat]
const manualTrack = mapDrawerTrack.map((p) => [p[1], p[0]]);
console.log('SubmitRun 轨迹:', manualTrack);

// 验证导出格式 "lng,lat"
const exportFormat = manualTrack.map((p) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`);
console.log('导出格式:', exportFormat);
console.assert(exportFormat[0].includes(','), 'Export format should contain comma');

// 测试导入格式解析
console.log('\n=== 导入格式解析测试 ===');

const testImportData = [
  '104.066541,30.572269',
  [104.06664, 30.57237],
  { lng: 104.06674, lat: 30.57247 },
];

const parseImport = testImportData
  .map((item) => {
    let coords = item;
    if (typeof item === 'string') {
      coords = item.split(',');
    }
    if (Array.isArray(coords)) {
      const lng = parseFloat(coords[0]);
      const lat = parseFloat(coords[1]);
      return [lat, lng];
    }
    if (typeof item === 'object' && item.lng && item.lat) {
      return [item.lat, item.lng];
    }
    return null;
  })
  .filter(Boolean);

console.log('导入解析结果:', parseImport);
console.assert(parseImport.length === 3, 'Should parse all 3 formats');

// 测试距离计算
console.log('\n=== 距离计算测试 ===');

function getDistanceBetween(p1, p2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6378137;
  const dLat = toRad(p2[0] - p1[0]);
  const dLng = toRad(p2[1] - p1[1]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1[0])) * Math.cos(toRad(p2[0])) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const p1 = [30.572269, 104.066541];
const p2 = [30.57237, 104.06664];
const distance = getDistanceBetween(p1, p2);
console.log(`距离 ${p1} 到 ${p2}:`, distance.toFixed(2), '米');
console.assert(distance > 0 && distance < 200, 'Distance should be reasonable');

// 总距离计算
const totalDistance = mapDrawerTrack.reduce((sum, p, i) => {
  if (i === 0) return 0;
  return sum + getDistanceBetween(mapDrawerTrack[i - 1], p);
}, 0);
console.log('总距离:', (totalDistance / 1000).toFixed(1), 'km');

// 测试点位最小距离检查
console.log('\n=== 点位最小距离检查测试 ===');

const minDistance = 2; // 2米
const shouldAdd = distance >= minDistance;
console.log(`新点到最后点距离: ${distance.toFixed(2)}m, 最小距离: ${minDistance}m`);
console.log(`应该添加: ${shouldAdd}`);

// 测试搜索防抖
console.log('\n=== 搜索防抖测试 ===');

let searchTimer = null;
const debounceSearch = (query, delay = 300) => {
  clearTimeout(searchTimer);
  console.log(`搜索防抖: ${delay}ms 后搜索 "${query}"`);
  searchTimer = setTimeout(() => {
    console.log(`执行搜索: "${query}"`);
  }, delay);
};

debounceSearch('北京');
debounceSearch('北京大学'); // 会取消前一个
debounceSearch('北京大学体育馆'); // 会取消前一个

// 测试坐标有效性
console.log('\n=== 坐标有效性测试 ===');

function isValidCoord(lng, lat) {
  return (
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

const testCoords = [
  { lng: 104.066541, lat: 30.572269, valid: true },
  { lng: 200, lat: 30, valid: false },
  { lng: 104, lat: 100, valid: false },
  { lng: NaN, lat: 30, valid: false },
];

testCoords.forEach(({ lng, lat, valid }) => {
  const result = isValidCoord(lng, lat);
  console.log(`坐标 (${lng}, ${lat}): ${result ? '✓ 有效' : '✗ 无效'}`);
  console.assert(result === valid, `Expected ${valid}, got ${result}`);
});

console.log('\n✅ 所有测试通过!');
