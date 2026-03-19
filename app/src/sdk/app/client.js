import axios from 'axios';
import CryptoJS from 'crypto-js';

const REQUEST_TRACK_KEY = '__isPrimaryApiRequest';

function getDeviceInfo() {
  if (typeof navigator === 'undefined') {
    return {
      brand: 'Apple',
      mobileType: 'iPhone',
      deviceType: '2',
      sysVersion: '18.6',
    };
  }

  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';

  if (/android/i.test(ua)) {
    const buildMatch = ua.match(/Android[\s\d.;]*;\s*([^)]+?)\s+Build\//i);
    let mobileType = buildMatch?.[1]?.trim() || '';

    if (!mobileType) {
      const parenthesized = ua.match(/\(([^)]+)\)/);
      if (parenthesized?.[1]) {
        const parts = parenthesized[1]
          .split(';')
          .map((part) => part.trim())
          .filter(Boolean);
        mobileType = parts[parts.length - 1] || '';
      }
    }

    const versionMatch = ua.match(/Android\s+(\d+(?:\.\d+)?)/i);
    return {
      brand: 'Android',
      mobileType: mobileType || 'Android Device',
      deviceType: '1',
      sysVersion: versionMatch?.[1] || 'Android',
    };
  }

  const isIOS =
    /(iPhone|iPad|iPod)/i.test(ua) ||
    (platform === 'MacIntel' && Number(navigator.maxTouchPoints || 0) > 1);

  if (isIOS) {
    const modelMatch = ua.match(/(iPhone|iPad|iPod)/i);
    const versionMatch = ua.match(/OS (\d+)[._](\d+)(?:[._](\d+))?/i);
    return {
      brand: 'Apple',
      mobileType: modelMatch?.[1] || 'iPhone',
      deviceType: '2',
      sysVersion: versionMatch ? versionMatch.slice(1).filter(Boolean).join('.') : 'iOS',
    };
  }

  return {
    brand: 'Apple',
    mobileType: 'iPhone',
    deviceType: '2',
    sysVersion: '18.6',
  };
}

function genSign({ appKey, appSecret, query = null, body = null }) {
  let signStr = '';

  // 处理查询参数;
  if (query !== null) {
    const normalizedQuery = Object.entries(query).reduce((acc, [key, value]) => {
      acc[key] = value === null ? '' : String(value);
      return acc;
    }, {});
    const sortedKeys = Object.keys(normalizedQuery).sort();
    for (const key of sortedKeys) {
      const value = normalizedQuery[key];
      if (value !== '') {
        signStr += key + value;
      }
    }
  }

  // 添加 APPKEY 和 APPSECRET;
  signStr += appKey;
  signStr += appSecret;

  // 添加请求体;
  if (body !== null) {
    signStr += JSON.stringify(body);
  }

  // 处理特殊字符;
  let replaced = false;
  const specialChars = [' ', '~', '!', '(', ')', "'"];
  for (const ch of specialChars) {
    if (signStr.includes(ch)) {
      signStr = signStr.replace(new RegExp(ch, 'g'), '');
      replaced = true;
    }
  }

  if (replaced) {
    signStr = encodeURIComponent(signStr);
  }

  // 生成 MD5 签名;
  let sign = CryptoJS.MD5(signStr).toString().toUpperCase();
  if (replaced) {
    sign += 'encodeutf8';
  }
  return sign;
}

export class AppApiClient {
  constructor({
    baseURL,
    appVersion,
    appKey,
    appSecret,
    tokenProvider = () => '',
    onAuthFailure = () => {},
    onRequestStart = () => {},
    onRequestEnd = () => {},
    deviceResolver = getDeviceInfo,
  }) {
    this.appVersion = appVersion;
    this.appKey = appKey;
    this.appSecret = appSecret;
    this.tokenProvider = tokenProvider;
    this.onAuthFailure = onAuthFailure;
    this.onRequestStart = onRequestStart;
    this.onRequestEnd = onRequestEnd;
    this.deviceResolver = deviceResolver;

    this.http = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        appKey: this.appKey,
        'Content-Type': 'application/json',
      },
    });

    this.http.interceptors.request.use(
      (config) => {
        const token = this.tokenProvider();
        if (token) config.headers.token = token;

        const sign = genSign({
          appKey: this.appKey,
          appSecret: this.appSecret,
          query: config.params ?? null,
          body: config.data ?? null,
        });
        config.headers.sign = sign;
        config[REQUEST_TRACK_KEY] = true;
        this.onRequestStart();
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.http.interceptors.response.use(
      (response) => {
        this.finishTrackedRequest(response?.config);

        const data = response.data;
        if (data && (data.code === 10001 || data.msg === 'not_login')) {
          this.onAuthFailure();
        }
        return response;
      },
      (error) => {
        this.finishTrackedRequest(error?.config || error?.response?.config);

        if (error.response && [401, 403].includes(error.response.status)) {
          this.onAuthFailure();
        }
        console.error('API Error:', error.response || error.message);
        return Promise.reject(error);
      },
    );
  }

  finishTrackedRequest(config) {
    if (!config || config[REQUEST_TRACK_KEY] !== true) return;
    this.onRequestEnd();
  }

  login(userPhone, password) {
    const device = this.deviceResolver();
    return this.http.post('/auth/login/password', {
      appVersion: this.appVersion,
      password: CryptoJS.MD5(password).toString(),
      userPhone,
      brand: device.brand,
      deviceToken: '',
      deviceType: device.deviceType,
      mobileType: device.mobileType,
      sysVersion: device.sysVersion,
    });
  }

  sendVerifyCode(phoneNum) {
    return this.http.get('/auth/sendSmsForPassWord', {
      params: { phoneNum },
    });
  }

  updatePassword(phone, password, code) {
    return this.http.post('/auth/updateUserPassWord', {
      password: CryptoJS.MD5(password).toString(),
      passwordRes: CryptoJS.MD5(password).toString(),
      userPhone: Number(phone),
      code: Number(code),
    });
  }

  getToken() {
    return this.http.get('/auth/query/token');
  }

  getRunRecords(pageNum = 1, pageSize = 15) {
    return this.http.get('/unirun/query/student/all/run/record', {
      params: { pageNum, pageSize },
    });
  }

  saveNewRecord(trackPoints, runDistance, runTime, userId, recordDate, yearSemester) {
    const device = this.deviceResolver();
    return this.http.post('/unirun/save/run/record/new', {
      againRunStatus: '0',
      againRunTime: 0,
      appVersions: this.appVersion,
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
  }

  getJoinNum(schoolId, studentId) {
    return this.http.get('/clubactivity/getJoinNum', {
      params: { schoolId, studentId },
    });
  }

  getRunStandard(schoolId) {
    return this.http.get('/unirun/query/runStandard', {
      params: { schoolId },
    });
  }

  getRunInfo(userId, yearSemester) {
    return this.http.get('/unirun/query/runInfo', {
      params: { userId, yearSemester },
    });
  }

  queryClubInfo({ queryTime, schoolId, studentId, pageNo = 1, pageSize = 15 } = {}) {
    return this.http.get('/clubactivity/queryActivityList', {
      params: {
        pageNo,
        pageSize,
        queryTime,
        schoolId,
        studentId,
      },
    });
  }

  queryMyPendingClub(studentId, pageNo = 1, pageSize = 15) {
    return this.http.get('/clubactivity/queryMyActivityList', {
      params: {
        pageNo,
        pageSize,
        studentId,
      },
    });
  }

  queryMyClubTask() {
    return this.http.get('/clubactivity/queryMySemesterClubActivity');
  }

  queryMyClubRecord(studentId, pageNo = 1, pageSize = 15) {
    return this.http.get('/clubactivity/getStudentClubRecord', {
      params: {
        pageNo,
        pageSize,
        studentId,
      },
    });
  }

  joinClub(activityId, studentId) {
    return this.http.get('/clubactivity/joinClubActivity', {
      params: {
        activityId,
        studentId,
      },
    });
  }

  cancelClub(activityId, studentId) {
    return this.http.get('/clubactivity/cancelActivity', {
      params: {
        activityId,
        studentId,
      },
    });
  }

  countValidSignUp(studentId) {
    return this.http.get('/clubactivity/countValidSignUp', {
      params: { studentId },
    });
  }

  queryMyClubItemList({ schoolId, studentId, type } = {}) {
    const params = { schoolId, studentId };
    if (type !== undefined && type !== null && `${type}`.trim() !== '') {
      params.type = type;
    }

    return this.http.get('/clubactivity/getMyClubItemList', {
      params,
    });
  }

  queryClubSignStatus(studentId) {
    return this.http.get('/clubactivity/getSignInTf', {
      params: { studentId },
    });
  }

  signInOrSignBack({ activityId, latitude, longitude, signType, studentId }) {
    return this.http.post('/clubactivity/signInOrSignBack', {
      activityId: Number(activityId),
      latitude: String(latitude),
      longitude: String(longitude),
      signType: String(signType),
      studentId: Number(studentId),
    });
  }
}
