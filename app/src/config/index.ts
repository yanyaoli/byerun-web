export const config = {
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL,
    appKey: import.meta.env.VITE_APP_KEY,
    appSecret: import.meta.env.VITE_APP_SECRET,
  },
  device: {
    appVersion: "1.8.3",
    brand: "iPhone",
    deviceToken: "",
    deviceType: "2",
    mobileType: "iPhone 15 Pro Max",
    sysVersion: "10",
  },
  headers: {
    contentType: "application/json",
    userAgent: "okhttp/3.12.0",
  },
  urls: {
    home: "https://byerun.pages.dev/",
    notice: "https://where.nyc.mn/unirun/notice",
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
