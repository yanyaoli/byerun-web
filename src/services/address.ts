// const baseURL = process.env.VUE_APP_BASE_API || '';
const baseURL = 'https://worker.run.ohnnn.com';    //workerjs代理,自定义域名解除污染

export default {
    baseURL,
    login: `${baseURL}/auth/login/password`,
    user: `${baseURL}/auth/query/token`,
    activity: `${baseURL}/clubactivity/getJoinNum`,
    runStandard: `${baseURL}/unirun/query/runStandard`,
    newActivity: `${baseURL}/unirun/save/run/record/new`,
    club: `${baseURL}/clubactivity/querySemesterClubActivity`,
    myClub: `${baseURL}/clubactivity/queryMyActivityList`,
    myTask: `${baseURL}/clubactivity/queryMySemesterClubActivity`,
    joinClub: `${baseURL}/clubactivity/joinOrCancelSchoolSemesterActivity`,
    sendSms: `${baseURL}/auth/sendSmsForPassWord`,
    updatePassword: `${baseURL}/auth/updateUserPassWord`,
};
