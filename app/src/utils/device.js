/**
 * 设备检测工具模块
 */

const IOS_DEVICE_TYPE = '2'; // iOS 设备类型标识码
const Android_DEVICE_TYPE = '1'; // Android 设备类型标识码

// 默认兜底配置
const DEFAULT_DEVICE_INFO = {
  brand: 'Apple',
  mobileType: 'iPhone',
  deviceType: IOS_DEVICE_TYPE,
  sysVersion: '18.6',
};

// 检查是否存在 navigator 对象（判断是否在浏览器环境）
const hasNavigator = () => typeof navigator !== 'undefined';

/**
 * 安全转换字符串
 * @param {any} value - 待转换的值
 * @param {string} fallback - 默认回退值
 */
const toSafeString = (value, fallback = '') => {
  const text = String(value ?? '').trim();
  return text || fallback;
};

/**
 * 解析 iOS 版本号
 */
const parseIOSVersion = (ua) => {
  const match = ua.match(/OS (\d+)[._](\d+)(?:[._](\d+))?/i);
  if (!match) return '';
  const [, major, minor, patch] = match;
  return [major, minor, patch].filter(Boolean).join('.');
};

/**
 * 解析 Android 版本号
 */
const parseAndroidVersion = (ua) => {
  const match = ua.match(/Android\s+(\d+(?:\.\d+)?)/i);
  return match?.[1] || '';
};

/**
 * 解析 Android 设备型号
 */
const parseAndroidModel = (ua) => {
  const buildMatch = ua.match(/Android[\s\d.;]*;\s*([^)]+?)\s+Build\//i);
  if (buildMatch?.[1]) return buildMatch[1].trim();

  const parenthesized = ua.match(/\(([^)]+)\)/);
  if (!parenthesized?.[1]) return 'Android Device';
  const parts = parenthesized[1]
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);
  const candidate = parts[parts.length - 1];
  return candidate || 'Android Device';
};

/**
 * 核心识别逻辑
 */
const detectDeviceFromNavigator = () => {
  if (!hasNavigator()) {
    return DEFAULT_DEVICE_INFO;
  }

  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';

  // 1. 识别 Android
  if (/android/i.test(ua)) {
    const model = parseAndroidModel(ua);
    return {
      brand: 'Android',
      mobileType: toSafeString(model, 'Android Device'),
      deviceType: Android_DEVICE_TYPE,
      sysVersion: toSafeString(parseAndroidVersion(ua), 'Android'),
    };
  }

  // 2. 识别 iOS (包含对 iPad OS 伪装的处理)
  const isIOS =
    /(iPhone|iPad|iPod)/i.test(ua) ||
    (platform === 'MacIntel' && Number(navigator.maxTouchPoints || 0) > 1);

  if (isIOS) {
    const modelMatch = ua.match(/(iPhone|iPad|iPod)/i);
    const model = modelMatch?.[1] || 'iPhone';
    return {
      brand: 'Apple',
      mobileType: model,
      deviceType: IOS_DEVICE_TYPE,
      sysVersion: toSafeString(parseIOSVersion(ua), 'iOS'),
    };
  }

  // 兜底默认
  return DEFAULT_DEVICE_INFO;
};

/**
 * 对外接口
 * @param {Object} existingInfo - 已有设备信息
 */
export function getDeviceInfo(existingInfo = null) {
  if (existingInfo && typeof existingInfo === 'object' && existingInfo.brand) {
    return existingInfo;
  }
  const device = detectDeviceFromNavigator();
  return device;
}

export default getDeviceInfo;
