// const baseURL = process.env.VUE_APP_BASE_API || '';
const baseURL = "https://worker.run.ohnnn.com"; // Worker代理,自定义域名解除污染
const homeURL = "https://ohnnn.com/"
const noticeURL = "https://ohnnn.com/unirun/notice"; // 公告通知
const donateURL = "https://ohnnn.com/donate" // 赞赏页
const downloadURL = "https://byerundownload.pages.dev/" // 下载页

export default {
  baseURL,
  homeURL,
  noticeURL,
  donateURL,
  downloadURL,
  login: `${baseURL}/auth/login/password`,
  user: `${baseURL}/auth/query/token`,
  activity: `${baseURL}/clubactivity/getJoinNum`,
  runStandard: `${baseURL}/unirun/query/runStandard`,
  newActivity: `${baseURL}/unirun/save/run/record/new`,
  weeklyClub: `${baseURL}/clubactivity/querySemesterClubActivity`,
  clubHistory: `${baseURL}/clubactivity/queryMyActivityList`,
  clubTask: `${baseURL}/clubactivity/queryMySemesterClubActivity`,
  joinClub: `${baseURL}/clubactivity/joinOrCancelSchoolSemesterActivity`,
  sendSms: `${baseURL}/auth/sendSmsForPassWord`,
  updatePassword: `${baseURL}/auth/updateUserPassWord`,
};
