import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import CryptoJS from 'crypto-js';
import type { DeviceInfo, ApiResponse, SignParams } from '@/types/auth';

export class ApiBusinessError extends Error {
  public envelope: any;

  constructor(envelope: any) {
    super(envelope?.message || `API business error: ${envelope?.code}`);
    this.name = 'ApiBusinessError';
    this.envelope = envelope;
  }
}

function getDeviceInfo(): DeviceInfo {
  if (typeof navigator === 'undefined') {
    return {
      brand: 'Apple',
      mobileType: 'iPhone',
      deviceType: '2',
      sysVersion: '18.6',
    };
  }

  const ua = navigator.userAgent || '';
  const platform = (navigator as any).platform || '';

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

function genSign({ appKey, appSecret, query = null, body = null }: SignParams): string {
  let signStr = '';

  // 处理查询参数;
  if (query !== null && query !== undefined) {
    const normalizedQuery = Object.entries(query).reduce((acc: Record<string, string>, [key, value]) => {
      acc[key] = value === null || value === undefined ? '' : String(value);
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
  if (body !== null && body !== undefined) {
    signStr += JSON.stringify(body);
  }

  // 处理特殊字符;
  let replaced = false;
  const specialChars = [' ', '~', '!', '(', ')', "'"];
  for (const ch of specialChars) {
    if (signStr.includes(ch)) {
      signStr = signStr.replace(new RegExp('\\' + ch, 'g'), '');
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

export interface AppApiClientOptions {
  baseURL: string;
  appVersion: string;
  appKey: string;
  appSecret: string;
  tokenProvider?: () => string | null;
  onAuthFailure?: () => void;
  deviceResolver?: () => DeviceInfo;
}

export class AppApiClient {
  public http: AxiosInstance;
  public baseURL: string;
  public appVersion: string;
  public appKey: string;
  public appSecret: string;
  public tokenProvider: () => string | null;
  public onAuthFailure: () => void;
  public deviceResolver: () => DeviceInfo;
  private pendingGets: Map<string, Promise<any>>;

  constructor({
    baseURL,
    appVersion,
    appKey,
    appSecret,
    tokenProvider = () => '',
    onAuthFailure = () => {},
    deviceResolver = getDeviceInfo,
  }: AppApiClientOptions) {
    this.baseURL = baseURL.replace(/\/+$/, '');
    this.appVersion = appVersion;
    this.appKey = appKey;
    this.appSecret = appSecret;
    this.tokenProvider = tokenProvider;
    this.onAuthFailure = onAuthFailure;
    this.deviceResolver = deviceResolver;
    this.pendingGets = new Map();

    this.http = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        appKey: this.appKey,
        'Content-Type': 'application/json',
      },
    });

    this.http.interceptors.request.use(
      (config) => {
        // 如果是 autorun 接口（带 Authorization），保留它，不附加 app sign
        if (config.headers.Authorization) {
          return config;
        }

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

  getCacheKey(url: string, params?: any): string {
    return `GET ${url} ${params ? JSON.stringify(params) : ''}`;
  }

  dedupeGet<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const key = this.getCacheKey(url, config?.params);
    const existing = this.pendingGets.get(key);
    if (existing) return existing;

    const promise = this.http.get<T>(url, config);
    this.pendingGets.set(key, promise);
    promise.finally(() => this.pendingGets.delete(key)).catch(() => {});
    return promise;
  }

  // --- Auth & User ---
  login(userPhone: string, password: string, turnstileToken?: string): Promise<AxiosResponse<ApiResponse>> {
    const device = this.deviceResolver();
    const headers: Record<string, string> = {};
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

  sendVerifyCode(phoneNum: string): Promise<AxiosResponse<ApiResponse>> {
    return this.http.get('/auth/sendSmsForPassWord', {
      params: { phoneNum },
    });
  }

  updatePassword(phone: string | number, password: string, code: string | number): Promise<AxiosResponse<ApiResponse>> {
    return this.http.post('/auth/updateUserPassWord', {
      password: CryptoJS.MD5(password).toString(),
      passwordRes: CryptoJS.MD5(password).toString(),
      userPhone: Number(phone),
      code: Number(code),
    });
  }

  getToken(): Promise<AxiosResponse<ApiResponse>> {
    return this.dedupeGet('/auth/query/token');
  }

  // --- Run ---
  getRunRecords(pageNum = 1, pageSize = 15): Promise<AxiosResponse<ApiResponse>> {
    return this.dedupeGet('/unirun/query/student/all/run/record', {
      params: { pageNum, pageSize },
    });
  }

  saveNewRecord(
    trackPoints: string,
    runDistance: number,
    runTime: number,
    userId: number | string,
    recordDate: string,
    yearSemester: string,
    turnstileToken?: string,
  ): Promise<AxiosResponse<ApiResponse>> {
    const device = this.deviceResolver();
    const headers: Record<string, string> = {};
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

  getJoinNum(schoolId: number | string, studentId: number | string): Promise<AxiosResponse<ApiResponse>> {
    return this.dedupeGet('/clubactivity/getJoinNum', {
      params: { schoolId, studentId },
    });
  }

  getRunStandard(schoolId: number | string): Promise<AxiosResponse<ApiResponse>> {
    return this.dedupeGet('/unirun/query/runStandard', {
      params: { schoolId },
    });
  }

  getRunInfo(userId: number | string, yearSemester: string): Promise<AxiosResponse<ApiResponse>> {
    return this.dedupeGet('/unirun/query/runInfo', {
      params: { userId, yearSemester },
    });
  }

  // --- Club Activity ---
  queryClubInfo({
    queryTime,
    schoolId,
    studentId,
    pageNo = 1,
    pageSize = 15,
  }: {
    queryTime?: string;
    schoolId?: number | string;
    studentId?: number | string;
    pageNo?: number;
    pageSize?: number;
  } = {}): Promise<AxiosResponse<ApiResponse>> {
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

  queryMyPendingClub(studentId: number | string, pageNo = 1, pageSize = 15): Promise<AxiosResponse<ApiResponse>> {
    return this.dedupeGet('/clubactivity/queryMyActivityList', {
      params: {
        pageNo,
        pageSize,
        studentId,
      },
    });
  }

  queryMyClubTask(): Promise<AxiosResponse<ApiResponse>> {
    return this.dedupeGet('/clubactivity/queryMySemesterClubActivity');
  }

  queryMyClubRecord(studentId: number | string, pageNo = 1, pageSize = 15): Promise<AxiosResponse<ApiResponse>> {
    return this.dedupeGet('/clubactivity/getStudentClubRecord', {
      params: {
        pageNo,
        pageSize,
        studentId,
      },
    });
  }

  joinClub(activityId: number | string, studentId: number | string, turnstileToken?: string): Promise<AxiosResponse<ApiResponse>> {
    const headers: Record<string, string> = {};
    if (turnstileToken) headers['X-Cf-Turnstile-Token'] = turnstileToken;
    return this.http.get('/clubactivity/joinClubActivity', {
      params: { activityId, studentId },
      headers,
    });
  }

  cancelClub(activityId: number | string, studentId: number | string, turnstileToken?: string): Promise<AxiosResponse<ApiResponse>> {
    const headers: Record<string, string> = {};
    if (turnstileToken) headers['X-Cf-Turnstile-Token'] = turnstileToken;
    return this.http.get('/clubactivity/cancelActivity', {
      params: { activityId, studentId },
      headers,
    });
  }

  countValidSignUp(studentId: number | string): Promise<AxiosResponse<ApiResponse>> {
    return this.dedupeGet('/clubactivity/countValidSignUp', {
      params: { studentId },
    });
  }

  queryMyClubItemList({
    schoolId,
    studentId,
    type,
  }: {
    schoolId?: number | string;
    studentId?: number | string;
    type?: string | number;
  } = {}): Promise<AxiosResponse<ApiResponse>> {
    const params: Record<string, any> = { schoolId, studentId };
    if (type !== undefined && type !== null && `${type}`.trim() !== '') {
      params.type = type;
    }

    return this.dedupeGet('/clubactivity/getMyClubItemList', {
      params,
    });
  }

  queryClubSignStatus(studentId: number | string): Promise<AxiosResponse<ApiResponse>> {
    return this.dedupeGet('/clubactivity/getSignInTf', {
      params: { studentId },
    });
  }

  signInOrSignBack({
    activityId,
    latitude,
    longitude,
    signType,
    studentId,
    turnstileToken,
  }: {
    activityId: number | string;
    latitude: string | number;
    longitude: string | number;
    signType: string;
    studentId: number | string;
    turnstileToken?: string;
  }): Promise<AxiosResponse<ApiResponse>> {
    const headers: Record<string, string> = {};
    if (turnstileToken) headers['X-Cf-Turnstile-Token'] = turnstileToken;
    return this.http.post('/clubactivity/signInOrSignBack', {
      activityId: Number(activityId),
      latitude: String(latitude),
      longitude: String(longitude),
      signType: String(signType),
      studentId: Number(studentId),
    }, { headers });
  }

  // --- Push Messages ---
  getStudentMessageList(pageNum = 1, pageSize = 15): Promise<AxiosResponse<ApiResponse>> {
    return this.dedupeGet('/push/getStudentMessageList', {
      params: { pageNum, pageSize },
    });
  }

  getStudentRemindList(pageNum = 1, pageSize = 15): Promise<AxiosResponse<ApiResponse>> {
    return this.dedupeGet('/push/getStudentRemindList', {
      params: { pageNum, pageSize },
    });
  }

  getStudentAllMessageCount(): Promise<AxiosResponse<ApiResponse>> {
    return this.dedupeGet('/push/getStudentAllMessageCount');
  }

  getStudentWindowsMessageList(): Promise<AxiosResponse<ApiResponse>> {
    return this.dedupeGet('/push/getStudentWindowsMessageList');
  }

  readMessage(pushId: string | number): Promise<AxiosResponse<ApiResponse>> {
    return this.http.get('/push/single/readRecord', {
      params: { pushId },
    });
  }

  readRemind(pushId: string | number, sendType?: string | number): Promise<AxiosResponse<ApiResponse>> {
    return this.http.get('/push/single/remind/readRecord', {
      params: { pushId, sendType },
    });
  }

  // ==========================================
  // --- Autorun Services (Unified Backend) ---
  // ==========================================

  private autorunAuthHeaders(token?: string | null): Record<string, string> {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }

  async autorunRequest(path: string, method: string = 'GET', data?: any, headers?: Record<string, string>, requestId?: string): Promise<any> {
    const reqHeaders: Record<string, string> = { ...headers };
    if (requestId) reqHeaders['X-Request-Id'] = requestId;

    try {
      const resp = await this.http.request({
        url: path,
        method,
        data,
        headers: reqHeaders,
        validateStatus: () => true,
      });

      const envelope = resp.data;
      if (resp.status >= 400 || (envelope && envelope.success === false)) {
        if (envelope && envelope.message) {
          throw new ApiBusinessError(envelope);
        }
        throw new Error(`HTTP error: ${resp.status}`);
      }
      return envelope;
    } catch (error: any) {
      if (error instanceof ApiBusinessError) throw error;
      if (error?.response?.data?.message) {
        throw new ApiBusinessError(error.response.data);
      }
      throw error;
    }
  }

  ping(requestId?: string): Promise<any> {
    return this.autorunRequest('/ping', 'GET', undefined, undefined, requestId);
  }

  getMaps(requestId?: string): Promise<any> {
    return this.autorunRequest('/api/maps', 'GET', undefined, undefined, requestId);
  }

  autorunLogin(body: any, requestId?: string): Promise<any> {
    return this.autorunRequest('/api/login', 'POST', body, undefined, requestId);
  }

  autorunRegister(token: string, body?: any, requestId?: string): Promise<any> {
    return this.getStatus(token, body, requestId);
  }

  register(token: string, body?: any, requestId?: string): Promise<any> {
    return this.getStatus(token, body, requestId);
  }

  getConfig(token: string, requestId?: string): Promise<any> {
    return this.autorunRequest(
      '/api/config',
      'POST',
      {},
      this.autorunAuthHeaders(token),
      requestId,
    );
  }

  getStatus(token: string, body: any = {}, requestId?: string): Promise<any> {
    return this.autorunRequest(
      '/api/status',
      'POST',
      body || {},
      this.autorunAuthHeaders(token),
      requestId,
    );
  }

  getRunHistory(token: string, body: any = {}, requestId?: string): Promise<any> {
    return this.autorunRequest(
      '/api/history',
      'POST',
      body || {},
      this.autorunAuthHeaders(token),
      requestId,
    );
  }

  setClubAutoConfig(token: string, body: any, requestId?: string): Promise<any> {
    return this.getClubAutoStatus(token, body, requestId);
  }

  getClubAutoStatus(token: string, body: any = {}, requestId?: string): Promise<any> {
    return this.autorunRequest(
      '/api/club/status',
      'POST',
      body || {},
      this.autorunAuthHeaders(token),
      requestId,
    );
  }

  getClubAutoHistory(token: string, body: any = {}, requestId?: string): Promise<any> {
    return this.autorunRequest(
      '/api/club/history',
      'POST',
      body || {},
      this.autorunAuthHeaders(token),
      requestId,
    );
  }

  rushClub(token: string, body: any, requestId?: string): Promise<any> {
    return this.autorunRequest(
      '/api/club/rush',
      'POST',
      body,
      this.autorunAuthHeaders(token),
      requestId,
    );
  }

  getClubRushStatus(token: string, requestId?: string): Promise<any> {
    return this.autorunRequest(
      '/api/club/rush/status',
      'POST',
      {},
      this.autorunAuthHeaders(token),
      requestId,
    );
  }

  cancelClubRush(token: string, body: any, requestId?: string): Promise<any> {
    return this.autorunRequest(
      '/api/club/rush/cancel',
      'POST',
      body,
      this.autorunAuthHeaders(token),
      requestId,
    );
  }

  getNotification(requestId?: string): Promise<any> {
    return this.autorunRequest('/api/notification', 'GET', undefined, undefined, requestId);
  }

  getRandom(token: string, query: Record<string, any> = {}, requestId?: string): Promise<any> {
    const params = new URLSearchParams();
    const mapId = String(query?.map_id ?? '').trim();
    const mapIdCompat = String(query?.mapid ?? '').trim();
    if (mapId) params.set('map_id', mapId);
    if (!mapId && mapIdCompat) params.set('mapid', mapIdCompat);

    const suffix = params.toString();
    const path = suffix ? `/api/random?${suffix}` : '/api/random';

    return this.autorunRequest(path, 'GET', undefined, this.autorunAuthHeaders(token), requestId);
  }
}
