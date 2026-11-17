const fs = require('fs');
const path = require('path');

const ROOT_VERSION_FILE = path.join(__dirname, '..', 'version.json');
const PUBLIC_VERSION_FILE = path.join(__dirname, '..', 'app', 'public', 'version.json');
const SRC_VERSION_FILE = path.join(__dirname, '..', 'app', 'src', 'version.json');

/**
 * 获取当前北京时间字符串 (UTC+8)
 * 格式: YYYY-MM-DD HH:mm:ss
 */
function getBeijingTimeString() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const beijingTime = new Date(utc + 3600000 * 8);

  const pad = (n) => String(n).padStart(2, '0');
  const year = beijingTime.getFullYear();
  const month = pad(beijingTime.getMonth() + 1);
  const day = pad(beijingTime.getDate());
  const hours = pad(beijingTime.getHours());
  const minutes = pad(beijingTime.getMinutes());
  const seconds = pad(beijingTime.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 版本递增规则：
 * 每次成功打包递增末位，满 100 向前进位
 * 例如：1.0.0 -> 1.0.1, 1.0.99 -> 1.1.0, 1.99.99 -> 2.0.0
 */
function incrementVersion(versionStr) {
  const clean = String(versionStr || '1.0.0').trim().replace(/^v/, '');
  const parts = clean.split('.').map((p) => parseInt(p, 10) || 0);

  let major = parts[0] !== undefined ? parts[0] : 1;
  let minor = parts[1] !== undefined ? parts[1] : 0;
  let patch = parts[2] !== undefined ? parts[2] : 0;

  patch += 1;
  if (patch >= 100) {
    patch = 0;
    minor += 1;
    if (minor >= 100) {
      minor = 0;
      major += 1;
    }
  }

  return `${major}.${minor}.${patch}`;
}

function readVersionData() {
  if (fs.existsSync(ROOT_VERSION_FILE)) {
    try {
      const content = fs.readFileSync(ROOT_VERSION_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('读取 version.json 失败:', e);
    }
  }
  return {
    version: '1.0.0',
    buildTime: getBeijingTimeString(),
    releaseNotes: '常规版本更新',
  };
}

function saveVersionData(data) {
  const str = JSON.stringify(data, null, 2) + '\n';
  [ROOT_VERSION_FILE, PUBLIC_VERSION_FILE, SRC_VERSION_FILE].forEach((file) => {
    try {
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(file, str, 'utf-8');
    } catch (e) {
      console.error(`写入文件 ${file} 失败:`, e);
    }
  });

  const packageJsonFile = path.join(__dirname, '..', 'app', 'package.json');
  if (fs.existsSync(packageJsonFile)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonFile, 'utf-8'));
      pkg.version = data.version;
      fs.writeFileSync(packageJsonFile, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    } catch (e) {
      console.error(`更新 package.json 失败:`, e);
    }
  }
}

const arg = process.argv[2] || '--peek-next';

const currentData = readVersionData();
const currentVersion = currentData.version || '1.0.0';
const nextVersion = incrementVersion(currentVersion);
const beijingTime = getBeijingTimeString();

if (arg === '--get') {
  process.stdout.write(currentVersion);
} else if (arg === '--peek-next') {
  process.stdout.write(nextVersion);
} else if (arg === '--beijing-time') {
  process.stdout.write(beijingTime);
} else if (arg === '--set') {
  const targetVersion = process.argv[3] || '1.0.3';
  const notes = process.argv[4] || currentData.releaseNotes || '移动端构建版本发布';
  const updatedData = {
    version: targetVersion,
    buildTime: beijingTime,
    releaseNotes: notes,
  };
  saveVersionData(updatedData);
  console.log(`版本已设置为: ${targetVersion} (${beijingTime})`);
  process.stdout.write(targetVersion);
} else if (arg === '--bump') {
  const updatedData = {
    version: nextVersion,
    buildTime: beijingTime,
    releaseNotes: currentData.releaseNotes || '移动端构建版本发布',
  };
  saveVersionData(updatedData);
  console.log(`版本已成功递增: ${currentVersion} -> ${nextVersion} (${beijingTime})`);
  process.stdout.write(nextVersion);
} else {
  console.log(`当前版本: ${currentVersion}`);
  console.log(`下个版本: ${nextVersion}`);
  console.log(`北京时间: ${beijingTime}`);
}
