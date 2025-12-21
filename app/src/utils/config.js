const vBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

// 主要应用配置
export const appConfig = {
  appVersion: '1.8.3',
  api: {
    baseUrl: vBaseUrl || '/devproxy',
    endpoints: {
      login: '/auth/login/password',
      token: '/auth/query/token',
      joinNum: '/clubactivity/getJoinNum',
      runStandard: '/unirun/query/runStandard',
      runInfo: '/unirun/query/runInfo',
      runRecord: '/unirun/query/student/all/run/record',
      saveNewRecord: '/unirun/save/run/record/new',
      sendVerifyCode: '/auth/sendSmsForPassWord',
      updatePassword: '/auth/updateUserPassWord',
      schoolBound: '/unirun/querySchoolBound',
      clubInfo: '/clubactivity/querySemesterClubActivity',
      myClubRecord: '/clubactivity/queryMyActivityList',
      myClubTask: '/clubactivity/queryMySemesterClubActivity',
      joinClub: '/clubactivity/joinOrCancelSchoolSemesterActivity',
    },
  },
  auth: {
    appKey: import.meta.env.VITE_APP_KEY || '389885588s0648fa',
    appSecret: import.meta.env.VITE_APP_SECRET || '56E39A1658455588885690425C0FD16055A21676',
  },
};

// 定时任务配置
export const scheduledTaskConfig = {
  apiBaseUrl: import.meta.env.VITE_AUTORUN_SERVER_BASE || '',
  isAutomationEnabled: import.meta.env.VITE_AUTORUN_ENABLED !== 'false',
};

// ArTalk评论系统配置
export const artalkConfig = {
  baseUrl: import.meta.env.VITE_ARTALK_SERVER || '',
  siteName: import.meta.env.VITE_ARTALK_SITE || 'Byerun',
};

// 高德地图SDK配置
export const amapConfig = {
  jsApiKey: import.meta.env.VITE_AMAP_KEY || '',
  securityJsCode: import.meta.env.VITE_AMAP_SECURITY || '',
};

// 外部链接
export const urls = {
  notice: 'https://unirun-notice.where.nyc.mn/',
  github: 'https://github.com/yanyaoli/byerun-web',
};