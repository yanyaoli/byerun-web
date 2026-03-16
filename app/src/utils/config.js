const vBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

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

      clubInfo: '/clubactivity/queryActivityList',
      myPendingClub: '/clubactivity/queryMyActivityList',
      myClubTask: '/clubactivity/queryMySemesterClubActivity',
      myClubRecord: '/clubactivity/getStudentClubRecord',
      joinClub: '/clubactivity/joinClubActivity',
      cancelClub: '/clubactivity/cancelActivity',
      clubSummary: '/clubactivity/countValidSignUp',
      clubItems: '/clubactivity/getMyClubItemList',

      clubSignStatus: '/clubactivity/getSignInTf',
      clubSignAction: '/clubactivity/signInOrSignBack',
    },
  },
  auth: {
    appKey: import.meta.env.VITE_APP_KEY || '389885588s0648fa',
    appSecret: import.meta.env.VITE_APP_SECRET || '56E39A1658455588885690425C0FD16055A21676',
  },
};

export const scheduledTaskConfig = {
  apiBaseUrl: import.meta.env.DEV
    ? '/autorunserver'
    : import.meta.env.VITE_AUTORUN_SERVER_BASE || '',
};

export const urls = {
  github: 'https://github.com/yanyaoli/byerun-web',
};

