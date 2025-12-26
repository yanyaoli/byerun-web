/**
 * 设备信息模块
 */

const STORAGE_KEY = 'unirun_device_info';

// iPhone 设备列表
const IPHONE_DEVICES = [
	{ brand: 'iPhone', model: 'iPhone17,3' }, // iPhone 15 Pro Max
	{ brand: 'iPhone', model: 'iPhone17,1' }, // iPhone 15 Pro
	{ brand: 'iPhone', model: 'iPhone16,5' }, // iPhone 15 Plus
	{ brand: 'iPhone', model: 'iPhone16,2' }, // iPhone 15
	{ brand: 'iPhone', model: 'iPhone15,5' }, // iPhone 14 Pro Max
	{ brand: 'iPhone', model: 'iPhone15,4' }, // iPhone 14 Pro
	{ brand: 'iPhone', model: 'iPhone15,3' }, // iPhone 14 Plus
	{ brand: 'iPhone', model: 'iPhone15,2' }, // iPhone 14
	{ brand: 'iPhone', model: 'iPhone14,3' }, // iPhone 13 Pro Max
	{ brand: 'iPhone', model: 'iPhone14,2' }, // iPhone 13 Pro
];

// Android 设备列表
const ANDROID_DEVICES = [
	{ brand: 'HUAWEI', model: 'HUAWEI Mate 60 Pro' },
	{ brand: 'HUAWEI', model: 'HUAWEI P60 Pro' },
	{ brand: 'Xiaomi', model: 'Xiaomi 14 Pro' },
	{ brand: 'Xiaomi', model: 'Xiaomi 13 Ultra' },
	{ brand: 'OPPO', model: 'OPPO Find X7 Pro' },
	{ brand: 'OPPO', model: 'OPPO Find X6 Pro' },
	{ brand: 'vivo', model: 'vivo X100 Pro' },
	{ brand: 'vivo', model: 'vivo X90 Pro+' },
	{ brand: 'HONOR', model: 'HONOR Magic6 Pro' },
	{ brand: 'samsung', model: 'SM-S9180' },
];

// 生成随机iOS版本 (15.6 - 18.7)
function getRandomIOSVersion() {
	const major = Math.floor(Math.random() * 4) + 15; // 15-18
	const minor =
		major === 15
			? 6 + Math.floor(Math.random() * 4) // 15.6-15.9
			: major === 18
			? Math.floor(Math.random() * 8) // 18.0-18.7
			: Math.floor(Math.random() * 10); // 16.0-16.9, 17.0-17.9

	return `${major}.${minor}`;
}

// 生成随机Android版本 (12.0 - 14.0)
function getRandomAndroidVersion() {
	const major = Math.floor(Math.random() * 3) + 12; // 12-14
	const minor = Math.floor(Math.random() * 10);

	return `${major}.${minor}`;
}

// 选择随机设备
function selectRandomDevice() {
	const isIPhone = Math.random() > 0.5; // 50%概率iPhone

	if (isIPhone) {
		const device =
			IPHONE_DEVICES[Math.floor(Math.random() * IPHONE_DEVICES.length)];
		return {
			brand: device.brand,
			mobileType: device.model,
			deviceType: '2',
			sysVersion: getRandomIOSVersion(),
		};
	} else {
		const device =
			ANDROID_DEVICES[Math.floor(Math.random() * ANDROID_DEVICES.length)];
		return {
			brand: device.brand,
			mobileType: device.model,
			deviceType: '1',
			sysVersion: getRandomAndroidVersion(),
		};
	}
}

/**
 * 获取设备信息
 * 优先从localStorage获取，不存在则随机生成并缓存
 */
export function getDeviceInfo() {
	// 尝试从缓存读取
	try {
		const cached = localStorage.getItem(STORAGE_KEY);
		if (cached) {
			return JSON.parse(cached);
		}
	} catch {
		// 缓存读取失败，继续生成新设备
	}

	// 生成新设备信息
	const device = selectRandomDevice();

	// 保存到缓存
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(device));
	} catch {
		// 缓存保存失败，但依然返回设备信息
	}

	return device;
}

export default getDeviceInfo;
