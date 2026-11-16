export interface DeviceInfo {
  brand: string;
  mobileType: string;
  deviceType: string; // '1' = Android, '2' = iOS
  sysVersion: string;
}

export interface OAuthToken {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface UserInfo {
  userId: number | string;
  studentId: number | string;
  schoolId: number | string;
  studentName?: string;
  registerCode?: string;
  userPhone?: string;
  schoolName?: string;
  gender?: string;
  sex?: string;
  oauthToken?: OAuthToken;
}

export interface ApiResponse<T = any> {
  code: number;
  msg?: string;
  message?: string;
  response?: T;
  data?: T;
}

export interface SignParams {
  appKey: string;
  appSecret: string;
  query?: Record<string, any> | null;
  body?: any;
}
