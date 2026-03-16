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

function startTrackedRequest(config) {
  config[REQUEST_TRACK_KEY] = true;
  beginApiRequest();
  return config;
}

function finishTrackedRequest(config) {
  if (!config || config[REQUEST_TRACK_KEY] !== true) return;
  endApiRequest();
}

function clearClientSideState() {
  clearAuthSessionStorage();
}

function handleAuthFailure() {
  clearClientSideState();

  if (typeof window === 'undefined') return;
  if (window.location.pathname !== '/auth') {
    window.location.replace('/auth');
  }
}

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

req.interceptors.response.use(
  (response) => {
    finishTrackedRequest(response?.config);

    const data = response.data;
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

  sendVerifyCode: async (phoneNum) => {
    return req.get(appConfig.api.endpoints.sendVerifyCode, {
      params: { phoneNum },
    });
  },

  updatePassword: async (phone, password, code) => {
    return req.post(appConfig.api.endpoints.updatePassword, {
      password: CryptoJS.MD5(password).toString(),
      passwordRes: CryptoJS.MD5(password).toString(),
      userPhone: Number(phone),
      code: Number(code),
    });
  },

  getToken: async () => {
    return req.get(appConfig.api.endpoints.token);
  },

  getRunRecords: async (pageNum = 1, pageSize = 15) => {
    return req.get(appConfig.api.endpoints.runRecord, {
      params: { pageNum, pageSize },
    });
  },

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

  getJoinNum: async (schoolId, studentId) => {
    return req.get(appConfig.api.endpoints.joinNum, {
      params: { schoolId, studentId },
    });
  },

  getRunStandard: async (schoolId) => {
    return req.get(appConfig.api.endpoints.runStandard, {
      params: { schoolId },
    });
  },

  getRunInfo: async (userId, yearSemester) => {
    return req.get(appConfig.api.endpoints.runInfo, {
      params: { userId, yearSemester },
    });
  },

  // queryActivityList: pageNo/pageSize/queryTime/schoolId/studentId
  queryClubInfo: async ({ queryTime, schoolId, studentId, pageNo = 1, pageSize = 15 } = {}) => {
    return req.get(appConfig.api.endpoints.clubInfo, {
      params: {
        pageNo,
        pageSize,
        queryTime,
        schoolId,
        studentId,
      },
    });
  },

  // queryMyActivityList
  queryMyPendingClub: async (studentId, pageNo = 1, pageSize = 15) => {
    return req.get(appConfig.api.endpoints.myPendingClub, {
      params: {
        pageNo,
        pageSize,
        studentId,
      },
    });
  },
  // queryMySemesterClubActivity
  queryMyClubTask: async () => {
    return req.get(appConfig.api.endpoints.myClubTask);
  },

  // getStudentClubRecord
  queryMyClubRecord: async (studentId, pageNo = 1, pageSize = 15) => {
    return req.get(appConfig.api.endpoints.myClubRecord, {
      params: {
        pageNo,
        pageSize,
        studentId,
      },
    });
  },

  // joinClubActivity
  joinClub: async (activityId, studentId) => {
    return req.get(appConfig.api.endpoints.joinClub, {
      params: {
        activityId,
        studentId,
      },
    });
  },

  // cancelActivity
  cancelClub: async (activityId, studentId) => {
    return req.get(appConfig.api.endpoints.cancelClub, {
      params: {
        activityId,
        studentId,
      },
    });
  },

  // countValidSignUp
  countValidSignUp: async (studentId) => {
    return req.get(appConfig.api.endpoints.clubSummary, {
      params: { studentId },
    });
  },

  // getMyClubItemList
  queryMyClubItemList: async ({ schoolId, studentId, type } = {}) => {
    const params = { schoolId, studentId };
    if (type !== undefined && type !== null && `${type}`.trim() !== '') {
      params.type = type;
    }

    return req.get(appConfig.api.endpoints.clubItems, {
      params,
    });
  },

  // getSignInTf
  queryClubSignStatus: async (studentId) => {
    return req.get(appConfig.api.endpoints.clubSignStatus, {
      params: { studentId },
    });
  },

  // signInOrSignBack signType: 1-签到 2-签退
  signInOrSignBack: async ({ activityId, latitude, longitude, signType, studentId }) => {
    return req.post(appConfig.api.endpoints.clubSignAction, {
      activityId: Number(activityId),
      latitude: String(latitude),
      longitude: String(longitude),
      signType: String(signType),
      studentId: Number(studentId),
    });
  },
};
