import axios from 'axios';
import CryptoJS from 'crypto-js';

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
    deviceResolver = getDeviceInfo,
  }) {
    this.appVersion = appVersion;
    this.appKey = appKey;
    this.appSecret = appSecret;
    this.tokenProvider = tokenProvider;
    this.onAuthFailure = onAuthFailure;
    this.deviceResolver = deviceResolver;
    this.pendingGets = new Map();

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
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.http.interceptors.response.use(
      (response) => {
        const data = response.data;
        if (data && (data.code === 10001 || data.code === 30005 || data.msg === 'not_login')) {
          this.onAuthFailure();
        }
        return response;
      },
      (error) => {
        if (error.response && [401, 403].includes(error.response.status)) {
          this.onAuthFailure();
        }
        console.error('API Error:', error.response || error.message);
        return Promise.reject(error);
      },
    );
  }

  getCacheKey(url, params) {
    return `GET ${url} ${params ? JSON.stringify(params) : ''}`;
  }

  dedupeGet(url, config) {
    const key = this.getCacheKey(url, config?.params);
    const existing = this.pendingGets.get(key);
    if (existing) return existing;

    const promise = this.http.get(url, config);
    this.pendingGets.set(key, promise);
    promise.finally(() => this.pendingGets.delete(key)).catch(() => {});
    return promise;
  }

  login(userPhone, password, turnstileToken) {
    const device = this.deviceResolver();
    const headers = {};
    if (turnstileToken) {
      headers['X-Cf-Turnstile-Token'] = turnstileToken;
    }
    return this.http.post('/auth/login/password', {
      appVersion: this.appVersion,
      password: CryptoJS.MD5(password).toString(),
      userPhone,
      brand: device.brand,
      deviceToken: '',
      deviceType: device.deviceType,
      mobileType: device.mobileType,
      sysVersion: device.sysVersion,
    }, { headers });
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
    return this.dedupeGet('/auth/query/token');
  }

  getRunRecords(pageNum = 1, pageSize = 15) {
    return this.dedupeGet('/unirun/query/student/all/run/record', {
      params: { pageNum, pageSize },
    });
  }

  saveNewRecord(trackPoints, runDistance, runTime, userId, recordDate, yearSemester, turnstileToken) {
    const device = this.deviceResolver();
    const headers = {};
    if (turnstileToken) headers['X-Cf-Turnstile-Token'] = turnstileToken;
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
    }, { headers });
  }

  getJoinNum(schoolId, studentId) {
    return this.dedupeGet('/clubactivity/getJoinNum', {
      params: { schoolId, studentId },
    });
  }

  getRunStandard(schoolId) {
    return this.dedupeGet('/unirun/query/runStandard', {
      params: { schoolId },
    });
  }

  getRunInfo(userId, yearSemester) {
    return this.dedupeGet('/unirun/query/runInfo', {
      params: { userId, yearSemester },
    });
  }

  queryClubInfo({ queryTime, schoolId, studentId, pageNo = 1, pageSize = 15 } = {}) {
    return this.dedupeGet('/clubactivity/queryActivityList', {
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
    return this.dedupeGet('/clubactivity/queryMyActivityList', {
      params: {
        pageNo,
        pageSize,
        studentId,
      },
    });
  }

  queryMyClubTask() {
    return this.dedupeGet('/clubactivity/queryMySemesterClubActivity');
  }

  queryMyClubRecord(studentId, pageNo = 1, pageSize = 15) {
    return this.dedupeGet('/clubactivity/getStudentClubRecord', {
      params: {
        pageNo,
        pageSize,
        studentId,
      },
    });
  }

  joinClub(activityId, studentId, turnstileToken) {
    const headers = {};
    if (turnstileToken) headers['X-Cf-Turnstile-Token'] = turnstileToken;
    return this.http.get('/clubactivity/joinClubActivity', {
      params: { activityId, studentId },
      headers,
    });
  }

  cancelClub(activityId, studentId, turnstileToken) {
    const headers = {};
    if (turnstileToken) headers['X-Cf-Turnstile-Token'] = turnstileToken;
    return this.http.get('/clubactivity/cancelActivity', {
      params: { activityId, studentId },
      headers,
    });
  }

  countValidSignUp(studentId) {
    return this.dedupeGet('/clubactivity/countValidSignUp', {
      params: { studentId },
    });
  }

  queryMyClubItemList({ schoolId, studentId, type } = {}) {
    const params = { schoolId, studentId };
    if (type !== undefined && type !== null && `${type}`.trim() !== '') {
      params.type = type;
    }

    return this.dedupeGet('/clubactivity/getMyClubItemList', {
      params,
    });
  }

  queryClubSignStatus(studentId) {
    return this.dedupeGet('/clubactivity/getSignInTf', {
      params: { studentId },
    });
  }

  getStudentMessageList(pageNum = 1, pageSize = 15) {
    return this.dedupeGet('/push/getStudentMessageList', {
      params: { pageNum, pageSize },
    });
  }

  getStudentRemindList(pageNum = 1, pageSize = 15) {
    return this.dedupeGet('/push/getStudentRemindList', {
      params: { pageNum, pageSize },
    });
  }

  getStudentAllMessageCount() {
    return this.dedupeGet('/push/getStudentAllMessageCount');
  }

  getStudentWindowsMessageList() {
    return this.dedupeGet('/push/getStudentWindowsMessageList');
  }

  readMessage(pushId) {
    return this.http.get('/push/single/readRecord', {
      params: { pushId },
    });
  }

  readRemind(pushId, sendType) {
    return this.http.get('/push/single/remind/readRecord', {
      params: { pushId, sendType },
    });
  }

  signInOrSignBack({ activityId, latitude, longitude, signType, studentId, turnstileToken }) {
    const headers = {};
    if (turnstileToken) headers['X-Cf-Turnstile-Token'] = turnstileToken;
    return this.http.post('/clubactivity/signInOrSignBack', {
      activityId: Number(activityId),
      latitude: String(latitude),
      longitude: String(longitude),
      signType: String(signType),
      studentId: Number(studentId),
    }, { headers });
  }
}
