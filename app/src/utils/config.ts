export const config = {
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL,
    appKey: import.meta.env.VITE_APP_KEY,
    appSecret: import.meta.env.VITE_APP_SECRET,
    artalkServer: import.meta.env.VITE_ARTALK_SERVER,
    artalkSite: import.meta.env.VITE_ARTALK_SITE,
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
} as const;

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
} as const;

/**
 * 获取登录参数的基础配置（使用简单的默认参数）
 */
export function getLoginParams(): {
  appVersion: string;
  brand: string;
  deviceToken: string;
  deviceType: string;
  mobileType: string;
  sysVersion: string;
} {
  return {
    appVersion: config.device.appVersion,
    brand: config.device.brand,
    deviceToken: config.device.deviceToken,
    deviceType: config.device.deviceType,
    mobileType: config.device.mobileType,
    sysVersion: config.device.sysVersion,
  };
}
