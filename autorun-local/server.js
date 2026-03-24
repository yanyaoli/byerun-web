/**
 * Byerun Autorun Server - 校园跑定时自动打卡服务
 *
 * 功能：
 * - 提供前端所需的全部 API 接口
 * - 每分钟轮询检查定时任务
 * - 到达指定时间后，真实调用 Unirun API 完成跑步打卡
 * - 使用与前端完全相同的签名算法、轨迹生成算法、时间计算逻辑
 *
 * 部署：Node.js 16+，可部署到任意 VPS / 云服务器
 */

const express = require('express');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ──────────────────────────────────────────────
//  1. 应用初始化
// ──────────────────────────────────────────────
const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', '*');
  res.set('Access-Control-Allow-Methods', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ──────────────────────────────────────────────
//  2. 配置
// ──────────────────────────────────────────────
const CONFIG = {
  port: process.env.PORT || 5891,
  // Unirun API 上游地址（勿修改）
  upstream: 'https://run-lb.tanmasports.com/v1',
  // App 签名密钥（与前端保持一致，从源码中提取）
  appKey: process.env.APP_KEY || '389885588s0648fa',
  appSecret: process.env.APP_SECRET || '56E39A1658455588885690425C0FD16055A21676',
  appVersion: '1.8.3',
  // 数据持久化文件路径
  dataFile: path.join(__dirname, 'tasks.json'),
  // 地图文件目录（从项目 app/src/assets/maps 复制过来）
  mapsDir: path.join(__dirname, 'maps'),
};

// ──────────────────────────────────────────────
//  3. 数据持久化（JSON 文件）
// ──────────────────────────────────────────────
let tasks = {};    // { token: { map_id, enabled, cron, last_run_at, executed, user_info } }
let mapData = {};  // { mapId: [[lng, lat], ...] }
let mapNames = {}; // { mapId: name }

function loadTasks() {
  try {
    if (fs.existsSync(CONFIG.dataFile)) {
      const raw = fs.readFileSync(CONFIG.dataFile, 'utf8');
      tasks = JSON.parse(raw) || {};
      console.log(`[data] 已加载 ${Object.keys(tasks).length} 个任务`);
    }
  } catch (e) {
    console.error('[data] 加载任务失败:', e.message);
    tasks = {};
  }
}

function saveTasks() {
  try {
    fs.writeFileSync(CONFIG.dataFile, JSON.stringify(tasks, null, 2), 'utf8');
  } catch (e) {
    console.error('[data] 保存任务失败:', e.message);
  }
}

function loadMaps() {
  if (!fs.existsSync(CONFIG.mapsDir)) {
    console.warn(`[maps] 地图目录不存在: ${CONFIG.mapsDir}，将只提供默认地图列表`);
    return;
  }
  const files = fs.readdirSync(CONFIG.mapsDir).filter(f => f.endsWith('.json'));
  files.forEach(file => {
    try {
      const raw = fs.readFileSync(path.join(CONFIG.mapsDir, file), 'utf8');
      const parsed = JSON.parse(raw);
      const mapId = String(parsed.mapId || '').trim();
      if (!mapId || !Array.isArray(parsed.mapData)) return;
      mapData[mapId] = parsed.mapData.map(s => s.split(',').map(Number)).filter(p => p.length === 2);
      mapNames[mapId] = String(parsed.mapName || mapId).trim();
    } catch (e) {
      console.warn(`[maps] 解析 ${file} 失败:`, e.message);
    }
  });
  console.log(`[maps] 已加载 ${Object.keys(mapData).length} 个地图:`, Object.keys(mapNames).join(', '));
}

// ──────────────────────────────────────────────
//  4. 签名算法（与前端 genSign 完全一致）
// ──────────────────────────────────────────────
function genSign({ appKey, appSecret, query = null, body = null }) {
  let signStr = '';

  if (query !== null) {
    const normalizedQuery = Object.entries(query).reduce((acc, [k, v]) => {
      acc[k] = v === null ? '' : String(v);
      return acc;
    }, {});
    const sortedKeys = Object.keys(normalizedQuery).sort();
    for (const key of sortedKeys) {
      const value = normalizedQuery[key];
      if (value !== '') signStr += key + value;
    }
  }

  signStr += appKey;
  signStr += appSecret;

  if (body !== null) signStr += JSON.stringify(body);

  let replaced = false;
  const specialChars = [' ', '~', '!', '(', ')', "'"];
  for (const ch of specialChars) {
    if (signStr.includes(ch)) {
      signStr = signStr.replace(new RegExp(ch, 'g'), '');
      replaced = true;
    }
  }
  if (replaced) signStr = encodeURIComponent(signStr);

  let sign = crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();
  if (replaced) sign += 'encodeutf8';
  return sign;
}

// MD5 密码哈希
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

// ──────────────────────────────────────────────
//  5. Unirun API 调用封装
// ──────────────────────────────────────────────
async function unirunRequest({ path: apiPath, method = 'GET', token = '', query = null, body = null }) {
  const nodeFetch = (await import('node-fetch')).default;

  const sign = genSign({
    appKey: CONFIG.appKey,
    appSecret: CONFIG.appSecret,
    query,
    body,
  });

  const headers = {
    'Content-Type': 'application/json',
    'appKey': CONFIG.appKey,
    'sign': sign,
  };
  if (token) headers['token'] = token;

  let url = CONFIG.upstream + apiPath;
  if (query) {
    const params = new URLSearchParams(
      Object.entries(query).map(([k, v]) => [k, String(v)])
    );
    url += '?' + params.toString();
  }

  const init = { method, headers };
  if (body !== null && method !== 'GET') {
    init.body = JSON.stringify(body);
  }

  const resp = await nodeFetch(url, init);
  const data = await resp.json();
  return data;
}

// 登录获取 token（用账号密码换取 token）
async function loginAndGetToken(userPhone, password) {
  const body = {
    appVersion: CONFIG.appVersion,
    password: md5(password),
    userPhone,
    brand: 'Apple',
    deviceToken: '',
    deviceType: '2',
    mobileType: 'iPhone',
    sysVersion: '18.6',
  };
  const data = await unirunRequest({ path: '/auth/login/password', method: 'POST', body });
  if (data?.code === 10000 && data?.response?.token) {
    return data.response.token;
  }
  throw new Error(data?.msg || '登录失败');
}

// 获取跑步标准（用于确定合法的距离和时间范围）
async function getRunStandard(token, schoolId) {
  const query = { schoolId };
  const data = await unirunRequest({ path: '/unirun/query/runStandard', method: 'GET', token, query });
  return data?.response || {};
}

// 获取用户信息
async function getUserInfo(token) {
  const data = await unirunRequest({ path: '/auth/query/token', method: 'GET', token });
  return data?.response || {};
}

// 提交跑步记录
async function saveRunRecord({ token, trackPoints, runDistance, runTime, userId, recordDate, yearSemester }) {
  const body = {
    againRunStatus: '0',
    againRunTime: 0,
    appVersions: CONFIG.appVersion,
    brand: 'Apple',
    mobileType: 'iPhone',
    sysVersions: '18.6',
    trackPoints,
    distanceTimeStatus: '1',
    innerSchool: '1',
    runDistance: Math.round(runDistance),
    runTime: Math.round(runTime),
    userId: Number(userId),
    vocalStatus: '1',
    yearSemester,
    recordDate,
  };
  return unirunRequest({ path: '/unirun/save/run/record/new', method: 'POST', token, body });
}

// ──────────────────────────────────────────────
//  6. 轨迹生成算法（与前端 genTrackPoints 完全一致）
// ──────────────────────────────────────────────
function getDistance(start, end) {
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
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(v, hi));
}

function genTrackPoints(distance, mapId = 'default', durationMinutes) {
  const targetDistance = Number(distance);
  if (!Number.isFinite(targetDistance) || targetDistance <= 0) return '[]';

  const mapId2 = String(mapId || 'default').trim() || 'default';
  const coords = mapData[mapId2] || mapData[Object.keys(mapData)[0]] || [];
  if (coords.length < 2) return '[]';

  const sanitized = [];
  coords.forEach((point, index) => {
    const prev = coords[index - 1];
    if (
      index === 0 ||
      Math.abs(point[0] - prev[0]) > 1e-9 ||
      Math.abs(point[1] - prev[1]) > 1e-9
    ) {
      sanitized.push(point);
    }
  });
  if (
    sanitized.length > 1 &&
    Math.abs(sanitized[0][0] - sanitized[sanitized.length - 1][0]) <= 1e-9 &&
    Math.abs(sanitized[0][1] - sanitized[sanitized.length - 1][1]) <= 1e-9
  ) sanitized.pop();
  if (sanitized.length < 2) return '[]';

  const bounds = sanitized.reduce(
    (acc, [lng, lat]) => ({
      minLng: Math.min(acc.minLng, lng),
      maxLng: Math.max(acc.maxLng, lng),
      minLat: Math.min(acc.minLat, lat),
      maxLat: Math.max(acc.maxLat, lat),
    }),
    { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity },
  );

  const segments = [];
  for (let i = 0; i < sanitized.length; i++) {
    const from = sanitized[i];
    const to = sanitized[(i + 1) % sanitized.length];
    const length = getDistance(from, to);
    if (length >= 0.5) segments.push({ from, to, length });
  }
  if (segments.length === 0) return '[]';

  const pace = clamp(
    Number(durationMinutes) > 0 ? durationMinutes / (targetDistance / 1000) : 7.6 + Math.random() * 1.2,
    6, 10,
  );
  const durationMs = Math.round((targetDistance / 1000) * pace * 60 * 1000);
  const baseSpeed = 1000 / (pace * 60);
  const baseSpacing = clamp(targetDistance / 1200, 4, 8);
  const jitter = 0.000003;
  const bboxPad = 0.00005;

  const addJitter = ([lng, lat]) => [
    clamp(lng + (Math.random() - 0.5) * 2 * jitter, bounds.minLng - bboxPad, bounds.maxLng + bboxPad),
    clamp(lat + (Math.random() - 0.5) * 2 * jitter, bounds.minLat - bboxPad, bounds.maxLat + bboxPad),
  ];

  let segIndex = Math.floor(Math.random() * segments.length);
  let segOffset = Math.random() * Math.max(1, segments[segIndex].length * 0.6);
  let lastPoint = addJitter([
    segments[segIndex].from[0] + (segments[segIndex].to[0] - segments[segIndex].from[0]) * clamp(segOffset / segments[segIndex].length, 0, 1),
    segments[segIndex].from[1] + (segments[segIndex].to[1] - segments[segIndex].from[1]) * clamp(segOffset / segments[segIndex].length, 0, 1),
  ]);

  let elapsedMs = 0;
  let generatedDistance = 0;
  let currentSpeed = baseSpeed;
  const result = [`${lastPoint[0]}-${lastPoint[1]}`];

  while (generatedDistance < targetDistance && result.length < 4000) {
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
      segment.from[0] + (segment.to[0] - segment.from[0]) * clamp(segOffset / segment.length, 0, 1),
      segment.from[1] + (segment.to[1] - segment.from[1]) * clamp(segOffset / segment.length, 0, 1),
    ]);
    const traveled = getDistance(lastPoint, point);
    generatedDistance += traveled;

    const remainingTime = Math.max(2000, durationMs - elapsedMs);
    const neededSpeed = remainingDistance > 0 ? remainingDistance / (remainingTime / 1000) : baseSpeed;
    const targetSpeed = clamp(
      (baseSpeed * 0.6 + neededSpeed * 0.4) * (0.95 + Math.random() * 0.1),
      baseSpeed * 0.8, baseSpeed * 1.2,
    );
    currentSpeed = clamp(currentSpeed * 0.65 + targetSpeed * 0.35, baseSpeed * 0.75, baseSpeed * 1.25);
    elapsedMs += (traveled / Math.max(0.5, currentSpeed)) * 1000;

    result.push(`${point[0]}-${point[1]}`);
    lastPoint = point;
  }

  return JSON.stringify(result);
}

// ──────────────────────────────────────────────
//  7. 随机距离和时间生成（与前端逻辑一致）
// ──────────────────────────────────────────────
const DEFAULT_DISTANCE_MIN = 1001;
const DEFAULT_DISTANCE_MAX = 9000;
const MIN_PACE = 6;
const MAX_PACE = 10;

function randomIntNonThousand(min = DEFAULT_DISTANCE_MIN, max = DEFAULT_DISTANCE_MAX) {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  for (let i = 0; i < 64; i++) {
    const v = lo + Math.floor(Math.random() * (hi - lo + 1));
    if (v % 10 !== 0) return v;
  }
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function computeRunTime(distanceMeters, minMinutes = 0, maxMinutes = 0) {
  const km = distanceMeters / 1000;
  let minPace = MIN_PACE;
  let maxPace = MAX_PACE;
  if (minMinutes > 0) minPace = Math.max(minPace, minMinutes / km);
  if (maxMinutes > 0) maxPace = Math.min(maxPace, maxMinutes / km);

  const pace = minPace <= maxPace
    ? minPace + (maxPace - minPace) * Math.random()
    : MIN_PACE + (MAX_PACE - MIN_PACE) * Math.random();

  let seconds = Math.round(km * pace * 60);

  // 避免整千秒
  if (seconds % 1000 === 0) seconds += Math.floor(Math.random() * 55) + 5;

  let duration = Math.max(1, Math.round(seconds / 60));
  if (minMinutes > 0 && duration < Math.ceil(minMinutes)) duration = Math.ceil(minMinutes);
  if (maxMinutes > 0 && duration > Math.floor(maxMinutes)) duration = Math.floor(maxMinutes);

  // 避免整十分钟
  if (duration % 10 === 0) duration += 1;

  return duration;
}

function resolveDistanceBounds(runStandard, gender) {
  const g = String(gender || '').trim();
  const isM = ['1', 'male', 'm'].includes(g.toLowerCase());
  const isF = ['2', 'female', 'f'].includes(g.toLowerCase());

  const boyMin = Number(runStandard?.boyOnceDistanceMin || 0);
  const boyMax = Number(runStandard?.boyOnceDistanceMax || 0);
  const girlMin = Number(runStandard?.girlOnceDistanceMin || 0);
  const girlMax = Number(runStandard?.girlOnceDistanceMax || 0);

  let onceMin = 0, onceMax = 0;
  if (isM) { onceMin = boyMin; onceMax = boyMax; }
  else if (isF) { onceMin = girlMin; onceMax = girlMax; }
  else { onceMin = Math.max(boyMin, girlMin); onceMax = Math.max(boyMax, girlMax); }

  let distMin = DEFAULT_DISTANCE_MIN;
  let distMax = DEFAULT_DISTANCE_MAX;
  if (onceMin > 0) distMin = Math.max(1, Math.trunc(onceMin) + 1);
  if (onceMax > 0) distMax = Math.max(distMin, Math.trunc(onceMax) + 1001);

  return { distMin, distMax };
}

function resolveTimeBounds(runStandard, gender) {
  const g = String(gender || '').trim();
  const isM = ['1', 'male', 'm'].includes(g.toLowerCase());
  const isF = ['2', 'female', 'f'].includes(g.toLowerCase());

  const boyMin = Number(runStandard?.boyOnceTimeMin || 0);
  const boyMax = Number(runStandard?.boyOnceTimeMax || 0);
  const girlMin = Number(runStandard?.girlOnceTimeMin || 0);
  const girlMax = Number(runStandard?.girlOnceTimeMax || 0);

  let timeMin = 0, timeMax = 0;
  if (isM) { timeMin = boyMin; timeMax = boyMax; }
  else if (isF) { timeMin = girlMin; timeMax = girlMax; }
  else {
    if (boyMin > 0 && girlMin > 0) timeMin = Math.min(boyMin, girlMin);
    else timeMin = boyMin > 0 ? boyMin : girlMin;
    timeMax = Math.max(boyMax, girlMax);
  }

  return { timeMin, timeMax };
}

// ──────────────────────────────────────────────
//  8. 执行真实打卡
// ──────────────────────────────────────────────
async function executeRun(token, task) {
  console.log(`[run] 开始执行打卡 token=${token.slice(0, 8)}... map_id=${task.map_id}`);

  // 1. 获取用户信息（userId, schoolId, gender）
  const userInfo = task.user_info || (await getUserInfo(token));
  const userId = userInfo.userId || userInfo.id;
  const schoolId = userInfo.schoolId;
  const gender = userInfo.gender;

  if (!userId || !schoolId) {
    throw new Error('无法获取用户信息，请重新配置账号');
  }

  // 2. 获取跑步标准
  const runStandard = await getRunStandard(token, schoolId);

  // 3. 随机生成距离和时间
  const { distMin, distMax } = resolveDistanceBounds(runStandard, gender);
  const { timeMin, timeMax } = resolveTimeBounds(runStandard, gender);
  const runDistance = randomIntNonThousand(distMin, distMax);
  const runTime = computeRunTime(runDistance, timeMin, timeMax);

  console.log(`[run] 生成参数: distance=${runDistance}m  time=${runTime}min  map=${task.map_id}`);

  // 4. 生成轨迹
  const trackPoints = genTrackPoints(runDistance, task.map_id, runTime);
  if (!trackPoints || trackPoints === '[]') {
    throw new Error(`地图 ${task.map_id} 轨迹生成失败，请确认地图文件已放在 maps/ 目录`);
  }

  // 5. 组装时间参数
  const now = new Date();
  const recordDate = now.toISOString().split('T')[0];
  const yearSemester = `${now.getFullYear()}${now.getMonth() + 1 < 8 ? '1' : '2'}`;

  // 6. 提交
  const result = await saveRunRecord({ token, trackPoints, runDistance, runTime, userId, recordDate, yearSemester });
  console.log(`[run] 提交结果: code=${result?.code} msg=${result?.msg} desc=${result?.response?.resultDesc}`);

  if (result?.code === 10000) {
    return { ok: true, runDistance, runTime, resultDesc: result?.response?.resultDesc };
  }
  throw new Error(result?.msg || '打卡失败，未知错误');
}

// ──────────────────────────────────────────────
//  9. API 路由
// ──────────────────────────────────────────────
app.get('/ping', (req, res) => {
  res.json({ success: true, data: { version: '1.0.0' } });
});

app.get('/api/maps', (req, res) => {
  const mapIds = Object.keys(mapData);
  const maps = mapIds.map(id => ({ id, name: mapNames[id] || id }));
  const defaultId = mapIds[0] || '';
  res.json({ success: true, data: { maps, default: defaultId } });
});

// 注册/更新定时任务配置（前端保存时调用）
app.post('/api/register', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { map_id, enabled, cron: cronExpr } = req.body;
  if (!tasks[token]) tasks[token] = {};
  Object.assign(tasks[token], {
    map_id,
    enabled: enabled === 1 || enabled === true,
    cron: cronExpr,
    last_run_at: tasks[token].last_run_at || null,
    executed: tasks[token].executed || false,
    user_info: tasks[token].user_info || null,
  });
  saveTasks();

  console.log(`[register] 更新任务 token=${token.slice(0, 8)} map=${map_id} cron=${cronExpr} enabled=${enabled}`);
  res.json({ success: true, data: tasks[token] });
});

// 查询当前配置
app.post('/api/config', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  res.json({ success: true, data: tasks[token] || null });
});

// 查询今日执行状态
app.post('/api/status', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const task = tasks[token] || {};
  res.json({
    success: true,
    data: { executed: task.executed || false, last_run_at: task.last_run_at || null },
  });
});

// ──────────────────────────────────────────────
//  10. 定时调度
// ──────────────────────────────────────────────

// 每天 00:00 重置执行状态
cron.schedule('0 0 * * *', () => {
  let resetCount = 0;
  Object.values(tasks).forEach(t => {
    if (t.executed) { t.executed = false; resetCount++; }
  });
  if (resetCount > 0) {
    saveTasks();
    console.log(`[cron] 每日重置：${resetCount} 个任务已重置`);
  }
});

// 每分钟检查并执行到期任务
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const currentH = now.getHours();
  const currentM = now.getMinutes();

  const pendingTokens = Object.keys(tasks).filter(token => {
    const task = tasks[token];
    if (!task.enabled || task.executed) return false;

    const parts = String(task.cron || '').trim().split(/\s+/);
    if (parts.length < 2) return false;

    const cronMin = parseInt(parts[0]);
    const cronHour = parseInt(parts[1]);
    return currentH === cronHour && currentM === cronMin;
  });

  for (const token of pendingTokens) {
    const task = tasks[token];
    console.log(`[cron] 触发任务 token=${token.slice(0, 8)}... map_id=${task.map_id}`);
    try {
      const result = await executeRun(token, task);
      task.last_run_at = now.toISOString();
      task.executed = true;
      saveTasks();
      console.log(`[cron] ✅ 打卡成功: distance=${result.runDistance}m time=${result.runTime}min desc=${result.resultDesc}`);
    } catch (err) {
      console.error(`[cron] ❌ 打卡失败 token=${token.slice(0, 8)}: ${err.message}`);
    }
  }
});

// ──────────────────────────────────────────────
//  11. 启动
// ──────────────────────────────────────────────
loadTasks();
loadMaps();

app.listen(CONFIG.port, () => {
  console.log('\n============================================');
  console.log(`🚀 Byerun Autorun Server 已启动`);
  console.log(`   监听地址: http://0.0.0.0:${CONFIG.port}`);
  console.log(`   地图目录: ${CONFIG.mapsDir}`);
  console.log(`   数据文件: ${CONFIG.dataFile}`);
  console.log(`   已加载地图: ${Object.keys(mapNames).join(', ') || '（无，请放入 maps/ 目录）'}`);
  console.log('============================================\n');
});
