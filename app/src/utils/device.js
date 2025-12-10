/**
 * 设备信息工具模块
 * 提供随机生成手机设备信息的功能
 */

const DEVICE_STORAGE_KEY = "deviceInfo";

// 预设手机设备列表
const DEVICE_POOL = [
  // iPhone 设备
  { brand: "iPhone", mobileType: "iPhone17,3", sysVersions: "18.6" },  // iPhone 15 Pro Max
  { brand: "iPhone", mobileType: "iPhone17,1", sysVersions: "18.0" },  // iPhone 15 Pro
  { brand: "iPhone", mobileType: "iPhone16,5", sysVersions: "17.5" },  // iPhone 15 Plus
  { brand: "iPhone", mobileType: "iPhone16,2", sysVersions: "17.2" },  // iPhone 15
  { brand: "iPhone", mobileType: "iPhone15,5", sysVersions: "16.6" },  // iPhone 14 Pro Max
  { brand: "iPhone", mobileType: "iPhone15,4", sysVersions: "16.5" },  // iPhone 14 Pro
  { brand: "iPhone", mobileType: "iPhone15,3", sysVersions: "16.4" },  // iPhone 14 Plus
  { brand: "iPhone", mobileType: "iPhone15,2", sysVersions: "16.3" },  // iPhone 14
  { brand: "iPhone", mobileType: "iPhone14,3", sysVersions: "15.7" },  // iPhone 13 Pro Max
  { brand: "iPhone", mobileType: "iPhone14,2", sysVersions: "15.6" },  // iPhone 13 Pro

  // Android 设备
  { brand: "HUAWEI", mobileType: "HUAWEI Mate 60 Pro", sysVersions: "14.0" },  // 华为 Mate 60 Pro
  { brand: "HUAWEI", mobileType: "HUAWEI P60 Pro", sysVersions: "13.0" },      // 华为 P60 Pro
  { brand: "Xiaomi", mobileType: "Xiaomi 14 Pro", sysVersions: "14.0" },       // 小米 14 Pro
  { brand: "Xiaomi", mobileType: "Xiaomi 13 Ultra", sysVersions: "13.0" },     // 小米 13 Ultra
  { brand: "OPPO", mobileType: "OPPO Find X7 Pro", sysVersions: "14.0" },      // OPPO Find X7 Pro
  { brand: "OPPO", mobileType: "OPPO Find X6 Pro", sysVersions: "13.0" },      // OPPO Find X6 Pro
  { brand: "vivo", mobileType: "vivo X100 Pro", sysVersions: "14.0" },         // vivo X100 Pro
  { brand: "vivo", mobileType: "vivo X90 Pro+", sysVersions: "13.0" },         // vivo X90 Pro+
  { brand: "HONOR", mobileType: "HONOR Magic6 Pro", sysVersions: "14.0" },     // 荣耀 Magic6 Pro
  { brand: "samsung", mobileType: "SM-S9180", sysVersions: "14.0" },           // 三星 Galaxy S24 Ultra
];

function loadStoredDevice() {
  try {
    const raw = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.brand === "string" &&
      typeof parsed.mobileType === "string" &&
      typeof parsed.sysVersions === "string"
    ) {
      return parsed;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function persistDevice(device) {
  try {
    localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(device));
  } catch (e) {
    // ignore
  }
}

/**
 * 从设备池中随机选择一个设备
 * @returns {Object} 包含 brand, mobileType, sysVersions 的对象
 */
function getRandomDevice() {
  const randomIndex = Math.floor(Math.random() * DEVICE_POOL.length);
  return { ...DEVICE_POOL[randomIndex] };
}

/**
 * 获取设备信息（随机选择策略）
 * @returns {Object} 包含 brand, mobileType, sysVersions 的对象
 */
export function getDeviceInfo() {
  const cached = loadStoredDevice();
  if (cached) return cached;

  const device = getRandomDevice();
  persistDevice(device);
  console.log("从设备池随机选择:", device);
  return device;
}

/**
 * 生成随机 iPhone 设备信息
 * @returns {Object} 包含 brand, mobileType, sysVersions 的对象
 */
export function getRandomiPhoneInfo() {
  return getRandomDevice();
}
