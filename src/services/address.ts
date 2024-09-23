// const baseURL = process.env.VUE_APP_BASE_API || '';
const baseURL = "https://worker.run.where.nyc.mn"; // Worker代理,自定义域名解除污染
const homeURL = "https://byerun.pages.dev/" // 主页
const noticeURL = "https://where.nyc.mn/unirun/notice"; // 公告通知
const downloadURL = "https://byerundownload.pages.dev/" // 下载页
const opensrcURL = "https://github.com/yanyaoli/byerun-web" // 开源地址

export default {
  baseURL,
  homeURL,
  noticeURL,
  opensrcURL,
  downloadURL,
  login: `${baseURL}/auth/login/password`,
  user: `${baseURL}/auth/query/token`,
  activity: `${baseURL}/clubactivity/getJoinNum`,
  runStandard: `${baseURL}/unirun/query/runStandard`,
  runInfo: `${baseURL}/unirun/query/runInfo`,
  newActivity: `${baseURL}/unirun/save/run/record/new`,
  weeklyClub: `${baseURL}/clubactivity/querySemesterClubActivity`,
  clubHistory: `${baseURL}/clubactivity/queryMyActivityList`,
  clubTask: `${baseURL}/clubactivity/queryMySemesterClubActivity`,
  joinClub: `${baseURL}/clubactivity/joinOrCancelSchoolSemesterActivity`,
  sendSms: `${baseURL}/auth/sendSmsForPassWord`,
  updatePassword: `${baseURL}/auth/updateUserPassWord`,
  signInStatus: `${baseURL}/clubactivity/getSignInIf`,
};
