const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  devServer: {
    proxy: {
      '/api/auth/login/password': {
        target: 'https://run-lb.tanmasports.com/v1/auth/login/password',
        changeOrigin: true,
        pathRewrite: { '^/api/auth/login/password': '' },
      },
      '/api/auth/query/token': {
        target: 'https://run-lb.tanmasports.com/v1/auth/query/token',
        changeOrigin: true,
        pathRewrite: { '^/api/auth/query/token': '' },
      },
      '/api/clubactivity/getJoinNum': {
        target: 'https://run-lb.tanmasports.com/v1/clubactivity/getJoinNum',
        changeOrigin: true,
        pathRewrite: { '^/api/clubactivity/getJoinNum': '' },
      },
      '/api/unirun/query/runStandard': {
        target: 'https://run-lb.tanmasports.com/v1/unirun/query/runStandard',
        changeOrigin: true,
        pathRewrite: { '^/api/unirun/query/runStandard': '' },
      },
      '/api/unirun/save/run/record/new': {
        target: 'https://run-lb.tanmasports.com/v1/unirun/save/run/record/new',
        changeOrigin: true,
        pathRewrite: { '^/api/unirun/save/run/record/new': '' },
      },
      '/api/clubactivity/querySemesterClubActivity': {
        target: 'https://run-lb.tanmasports.com/v1/clubactivity/querySemesterClubActivity',
        changeOrigin: true,
        pathRewrite: { '^/api/clubactivity/querySemesterClubActivity': '' },
      },
      '/api/clubactivity/queryMyActivityList': {
        target: 'https://run-lb.tanmasports.com/v1/clubactivity/queryMyActivityList',
        changeOrigin: true,
        pathRewrite: { '^/api/clubactivity/queryMyActivityList': '' },
      },
      '/api/clubactivity/queryMySemesterClubActivity': {
        target: 'https://run-lb.tanmasports.com/v1/clubactivity/queryMySemesterClubActivity',
        changeOrigin: true,
        pathRewrite: { '^/api/clubactivity/queryMySemesterClubActivity': '' },
      },
      '/api/clubactivity/joinOrCancelSchoolSemesterActivity': {
        target: 'https://run-lb.tanmasports.com/v1/clubactivity/joinOrCancelSchoolSemesterActivity',
        changeOrigin: true,
        pathRewrite: { '^/api/clubactivity/joinOrCancelSchoolSemesterActivity': '' },
      },
    },
  },
})
