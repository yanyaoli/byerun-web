// const baseURL = process.env.VUE_APP_BASE_API || '';
const baseURL = "https://worker.run.where.nyc.mn"; // Worker代理,自定义域名解除污染
const homeURL = "https://byerun.pages.dev/" // 主页
const noticeURL = "https://where.nyc.mn/unirun/notice"; // 公告通知
const downloadURL = "https://byerundownload.pages.dev/" // 下载页
const githubURL = "https://github.com/yanyaoli/byerun-web" // 开源地址

export default {
  baseURL,
  homeURL,
  noticeURL,
  githubURL,
  downloadURL,
  // 登录
  login: `${baseURL}/auth/login/password`,
  // 用户信息查询
  user: `${baseURL}/auth/query/token`,
  // 完成率信息查询
  activity: `${baseURL}/clubactivity/getJoinNum`,
  // 标准信息查询
  runStandard: `${baseURL}/unirun/query/runStandard`,
  // 跑步信息查询
  runInfo: `${baseURL}/unirun/query/runInfo`,
  // 跑步历史记录查询
  runRecord: `${baseURL}/unirun/query/student/all/run/record`,
  // 跑步新纪录提交
  newActivity: `${baseURL}/unirun/save/run/record/new`,
  // 俱乐部活动查询
  weeklyClub: `${baseURL}/clubactivity/querySemesterClubActivity`,
  // 俱乐部参与记录查询
  clubHistory: `${baseURL}/clubactivity/queryMyActivityList`,
  // 已报名俱乐部查询
  clubTask: `${baseURL}/clubactivity/queryMySemesterClubActivity`,
  // 俱乐部状态查询
  joinClub: `${baseURL}/clubactivity/joinOrCancelSchoolSemesterActivity`,
  // 发送验证码
  sendSms: `${baseURL}/auth/sendSmsForPassWord`,
  // 重置密码
  updatePassword: `${baseURL}/auth/updateUserPassWord`,
  // 俱乐部签到签退状态查询
  signInStatus: `${baseURL}/clubactivity/getSignInIf`,
};
