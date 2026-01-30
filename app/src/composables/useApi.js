import axios from 'axios';
import { genSign } from '@/utils/sign.js';
import { appConfig } from '@/utils/config.js';
import CryptoJS from 'crypto-js';
import getDeviceInfo from '@/utils/device';
import { decrypt } from '@/utils/crypto';

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
  // 尝试从新的加密存储中获取 token
  let token = null;
  try {
    const encryptedData = localStorage.getItem('unirun_data');
    if (encryptedData) {
      const decrypted = decrypt(encryptedData);
      token = decrypted?.userInfo?.oauthToken?.token;
    }
  } catch (e) {
    // 如果解密失败或数据结构不对，尝试读取遗留字段
    token = localStorage.getItem('unirun_token');
  }

  if (!token) {
    token = localStorage.getItem('unirun_token');
  }

  if (token) config.headers['token'] = token;

  // 生成 sign，query 为 config.params，body 为 config.data
  const sign = genSign(config.params ?? null, config.data ?? null);
  config.headers['sign'] = sign;

  return config;
});

// 响应拦截器
req.interceptors.response.use(
  (response) => {
    const data = response.data;
    // 处理业务逻辑错误，如验证过期
    if (data && (data.code === 10001 || data.msg === 'not_login')) {
      handleAuthFailure();
    }
    return response;
  },
  (error) => {
    // 处理 HTTP 状态码错误
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      handleAuthFailure();
    }
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

// 提取验证失败的处理逻辑，避免直接引用 store 导致的循环依赖
function handleAuthFailure() {
  localStorage.removeItem('unirun_data');
  // 清理所有相关字段以防脏数据残留
  const keysToRemove = [
    'unirun_token',
    'unirun_userId',
    'unirun_studentId',
    'unirun_schoolId',
    'unirun_userInfo',
    'unirun_runInfo',
    'unirun_runStandard',
    'unirun_activityInfo',
    'unirun_device_info',
    'activeTab',
    'unorun_chat_userData',
    'unorun_chat_userId',
    'unorun_chat_token',
  ];
  keysToRemove.forEach((k) => localStorage.removeItem(k));

  // 如果在浏览器环境，且距离上次刷新超过 2 秒（防止死循环）
  if (typeof window !== 'undefined') {
    const lastReload = sessionStorage.getItem('last_auth_reload') || 0;
    const now = Date.now();
    if (now - lastReload > 2000) {
      sessionStorage.setItem('last_auth_reload', String(now));
      window.location.reload();
    }
  }
}

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
  getRunRecords: async (pageNum = 1, pageSize = 15) => {
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
  getRunInfo: async (userId, yearSemester) => {
    return req.get(appConfig.api.endpoints.runInfo, {
      params: { userId, yearSemester },
    });
  },

  // 查询指定星期的俱乐部信息
  queryClubInfo: async (weekDay = 1) => {
    return req.get(appConfig.api.endpoints.clubInfo, {
      params: {
        pageNo: 1,
        pageSize: 15,
        weekDay,
      },
    });
  },

  // 查询我的俱乐部活动记录
  queryMyClubRecord: async (studentId) => {
    return req.get(appConfig.api.endpoints.myClubRecord, {
      params: {
        pageNo: 1,
        pageSize: 15,
        studentId,
      },
    });
  },

  // 查询我的俱乐部任务
  queryMyClubTask: async () => {
    return req.get(appConfig.api.endpoints.myClubTask);
  },

  // 加入俱乐部/退出俱乐部
  joinClub: async (configurationId, type) => {
    return req.get(appConfig.api.endpoints.joinClub, {
      params: {
        configurationId,
        type,
      },
    });
  },
};
