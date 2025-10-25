export const config = {
  key: {
    amapKey: import.meta.env.VITE_AMAP_KEY,
    amapSecurity: import.meta.env.VITE_AMAP_SECURITY,
  },
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL,
    appKey: "389885588s0648fa",
    appSecret: "56E39A1658455588885690425C0FD16055A21676",
    artalkServer: import.meta.env.VITE_ARTALK_SERVER,
    artalkSite: import.meta.env.VITE_ARTALK_SITE,
    autorunServerBase: import.meta.env.VITE_AUTORUN_SERVER_BASE,
  },
  device: {
    appVersion: "1.8.3",
    brand: "iPhone",
    deviceToken: "",
    deviceType: "2",
    mobileType: "iPhone 16",
    sysVersion: "18.5",
  },
  urls: {
    home: "https://byerun.pages.dev/",
    notice: "https://unirun-notice.where.nyc.mn/",
    github: "https://github.com/yanyaoli/byerun-web",
  },
};

export const API_URLS = {
  login: "/auth/login/password",
  user: "/auth/query/token",
  activity: "/clubactivity/getJoinNum",
  runStandard: "/unirun/query/runStandard",
  runInfo: "/unirun/query/runInfo",
  runRecord: "/unirun/query/student/all/run/record",
  newActivity: "/unirun/save/run/record/new",
  sendSms: "/auth/sendSmsForPassWord",
  updatePassword: "/auth/updateUserPassWord",
  schoolBound: "/unirun/querySchoolBound",
};

/**
 * 获取登录参数的基础配置
 */
export function getLoginParams() {
  return {
    appVersion: config.device.appVersion,
    brand: config.device.brand,
    deviceToken: config.device.deviceToken,
    deviceType: config.device.deviceType,
    mobileType: config.device.mobileType,
    sysVersion: config.device.sysVersion,
  };
}