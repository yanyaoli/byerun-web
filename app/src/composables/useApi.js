import axios from 'axios';
import { genSign } from '@/utils/sign.js';
import { appConfig } from '@/utils/config.js';
import CryptoJS from 'crypto-js';
import getDeviceInfo from '@/utils/device';

// 创建 axios 实例
const req = axios.create({
	baseURL: appConfig.api.baseUrl,
	timeout: 15000,
	headers: {
		appKey: appConfig.auth.appKey,
		'Content-Type': 'application/json',
	},
});

// 请求拦截器
req.interceptors.request.use((config) => {
	// token
	const token = localStorage.getItem('token');
	if (token) config.headers['token'] = token;

	// 生成 sign，query 为 config.params，body 为 config.data
	const sign = genSign(config.params ?? null, config.data ?? null);
	config.headers['sign'] = sign;

	return config;
});

// // 响应拦截器
// req.interceptors.response.use(
// 	(response) => response,
// 	(error) => {
// 		// 统一错误处理
// 		console.error('API Error:', error.response || error.message);
// 		return Promise.reject(error);
// 	}
// );

// API 方法封装
export const api = {
	// 登录
	login: async (userPhone, password) => {
		const device = getDeviceInfo();
		return req.post(appConfig.api.endpoints.login, {
			appVersion: appConfig.appVersion,
			password: CryptoJS.MD5(password).toString(),
			userPhone: userPhone,
			brand: device.brand,
			deviceToken: '',
			deviceType: device.deviceType,
			mobileType: device.mobileType,
			sysVersion: device.sysVersion,
		});
	},
	// 发送验证码
	sendVerifyCode: async (phoneNum) => {
		return req.get(appConfig.api.endpoints.sendVerifyCode, {
			params: { phoneNum },
		});
	},
	// 重置密码
	updatePassword: async (phone, password, code) => {
		return req.post(appConfig.api.endpoints.updatePassword, {
			password: CryptoJS.MD5(password).toString(),
			passwordRes: CryptoJS.MD5(password).toString(),
			userPhone: Number(phone),
			code: Number(code),
		});
	},

	// 获取令牌信息
	getToken: async () => {
		return req.get(appConfig.api.endpoints.token);
	},

	// 获取跑步记录
	getRunRecords: async (pageNum, pageSize) => {
		return req.get(appConfig.api.endpoints.runRecord, {
			params: { pageNum, pageSize },
		});
	},

	// 提交跑步记录
	saveNewRecord: async (
		trackPoints,
		runDistance,
		runTime,
		userId,
		recordDate,
		yearSemester
	) => {
		const device = getDeviceInfo();
		return req.post(appConfig.api.endpoints.saveNewRecord, {
			againRunStatus: '0',
			againRunTime: 0,
			appVersions: appConfig.appVersion,
			brand: device.brand,
			mobileType: device.mobileType,
			sysVersions: device.sysVersion,
			trackPoints,
			distanceTimeStatus: '1',
			innerSchool: '1',
			runDistance: Math.round(runDistance),
			runTime: Math.round(runTime),
			userId: Number(userId),
			vocalStatus: '1',
			yearSemester,
			recordDate,
		});
	},

	// 获取活动信息
	getJoinNum: async (schoolId, studentId) => {
		return req.get(appConfig.api.endpoints.joinNum, {
			params: {
				schoolId,
				studentId,
			},
		});
	},

	// 获取跑步标准
	getRunStandard: async (schoolId) => {
		return req.get(appConfig.api.endpoints.runStandard, {
			params: {
				schoolId,
			},
		});
	},

	// 获取跑步信息
	getRunInfo: async (userId) => {
		return req.get(appConfig.api.endpoints.runInfo, {
			params: {
				userId,
				yearSemester: 1,
			},
		});
	},
};
