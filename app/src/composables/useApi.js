import axios from 'axios';
import CryptoJS from 'crypto-js';
import getDeviceInfo from '@/utils/device';
import { genSign } from '@/utils/sign.js';
import { appConfig } from '@/utils/config.js';
import { getSessionToken, clearAuthSessionStorage } from '@/utils/authStorage';
import { beginApiRequest, endApiRequest } from '@/composables/useApiRequestGate';

const req = axios.create({
  baseURL: appConfig.api.baseUrl,
  timeout: 15000,
  headers: {
    appKey: appConfig.auth.appKey,
    'Content-Type': 'application/json',
  },
});

const REQUEST_TRACK_KEY = '__isPrimaryApiRequest';

const startTrackedRequest = (config) => {
  config[REQUEST_TRACK_KEY] = true;
  beginApiRequest();
  return config;
};

const finishTrackedRequest = (config) => {
  if (!config || config[REQUEST_TRACK_KEY] !== true) return;
  endApiRequest();
};

const clearClientSideState = () => {
  clearAuthSessionStorage();
};

const handleAuthFailure = () => {
  clearClientSideState();

  if (typeof window === 'undefined') return;
  if (window.location.pathname !== '/auth') {
    window.location.replace('/auth');
  }
};

req.interceptors.request.use(
  (config) => {
    const token = getSessionToken();
    if (token) config.headers.token = token;

    const sign = genSign(config.params ?? null, config.data ?? null);
    config.headers.sign = sign;

    return startTrackedRequest(config);
  },
  (error) => Promise.reject(error),
);

// 响应拦截器
req.interceptors.response.use(
  (response) => {
    finishTrackedRequest(response?.config);

    const data = response.data;
    // 处理业务逻辑错误，如验证过期
    if (data && (data.code === 10001 || data.msg === 'not_login')) {
      handleAuthFailure();
    }
    return response;
  },
  (error) => {
    finishTrackedRequest(error?.config);

    if (error.response && [401, 403].includes(error.response.status)) {
      handleAuthFailure();
    }
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  },
);

export const api = {
  login: async (userPhone, password) => {
    const device = getDeviceInfo();
    return req.post(appConfig.api.endpoints.login, {
      appVersion: appConfig.appVersion,
      password: CryptoJS.MD5(password).toString(),
      userPhone,
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
  saveNewRecord: async (trackPoints, runDistance, runTime, userId, recordDate, yearSemester) => {
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
      params: { schoolId, studentId },
    });
  },

  // 获取跑步标准
  getRunStandard: async (schoolId) => {
    return req.get(appConfig.api.endpoints.runStandard, {
      params: { schoolId },
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
