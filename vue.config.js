const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  devServer: {
    proxy: {
      '/auth/login/password': {
        target: 'https://run-lb.tanmasports.com/v1/auth/login/password',
        changeOrigin: true,
        pathRewrite: { '^/auth/login/password': '' },
      },
      '/auth/query/token': {
        target: 'https://run-lb.tanmasports.com/v1/auth/query/token',
        changeOrigin: true,
        pathRewrite: { '^/auth/query/token': '' },
      },
      '/clubactivity/getJoinNum': {
        target: 'https://run-lb.tanmasports.com/v1/clubactivity/getJoinNum',
        changeOrigin: true,
        pathRewrite: { '^/clubactivity/getJoinNum': '' },
      },
      '/unirun/query/runStandard': {
        target: 'https://run-lb.tanmasports.com/v1/unirun/query/runStandard',
        changeOrigin: true,
        pathRewrite: { '^/unirun/query/runStandard': '' },
      },
      '/unirun/save/run/record/new': {
        target: 'https://run-lb.tanmasports.com/v1/unirun/save/run/record/new',
        changeOrigin: true,
        pathRewrite: { '^/unirun/save/run/record/new': '' },
      },
      '/clubactivity/querySemesterClubActivity': {
        target: 'https://run-lb.tanmasports.com/v1/clubactivity/querySemesterClubActivity',
        changeOrigin: true,
        pathRewrite: { '^/clubactivity/querySemesterClubActivity': '' },
      },
      '/clubactivity/queryMyActivityList': {
        target: 'https://run-lb.tanmasports.com/v1/clubactivity/queryMyActivityList',
        changeOrigin: true,
        pathRewrite: { '^/clubactivity/queryMyActivityList': '' },
      },
      '/clubactivity/queryMySemesterClubActivity': {
        target: 'https://run-lb.tanmasports.com/v1/clubactivity/queryMySemesterClubActivity',
        changeOrigin: true,
        pathRewrite: { '^/clubactivity/queryMySemesterClubActivity': '' },
      },
      '/clubactivity/joinOrCancelSchoolSemesterActivity': {
        target: 'https://run-lb.tanmasports.com/v1/clubactivity/joinOrCancelSchoolSemesterActivity',
        changeOrigin: true,
        pathRewrite: { '^/clubactivity/joinOrCancelSchoolSemesterActivity': '' },
      },
    },
  },
})
