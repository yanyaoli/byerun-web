const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: './',
  devServer: {
    proxy: {
      '/auth/login/password': {
        target: 'https://run-lb.tanmasports.com/v1',
        changeOrigin: true,
        ws: true,
        secure: true,
        // pathRewrite: { '^/auth/login/password': '/auth/login/password' },
      },
      '/auth/query/token': {
        target: 'https://run-lb.tanmasports.com/v1',
        changeOrigin: true,
        secure: true,
        // pathRewrite: { '^/auth/query/token': '/auth/query/token' },
      },
      '/clubactivity/getJoinNum': {
        target: 'https://run-lb.tanmasports.com/v1',
        changeOrigin: true,
        secure: true,
        // pathRewrite: { '^/clubactivity/getJoinNum': '/clubactivity/getJoinNum' },
      },
      '/unirun/query/runStandard': {
        target: 'https://run-lb.tanmasports.com/v1',
        changeOrigin: true,
        secure: true,
        // pathRewrite: { '^/unirun/query/runStandard': '' },
      },
      '/unirun/save/run/record/new': {
        target: 'https://run-lb.tanmasports.com/v1',
        changeOrigin: true,
        secure: true,
        pathRewrite: { '^/unirun/save/run/record/new': '' },
      },
      '/clubactivity/querySemesterClubActivity': {
        target: 'https://run-lb.tanmasports.com/v1',
        changeOrigin: true,
        secure: true,
        // pathRewrite: { '^/clubactivity/querySemesterClubActivity': '' },
      },
      '/clubactivity/queryMyActivityList': {
        target: 'https://run-lb.tanmasports.com/v1',
        changeOrigin: true,
        secure: true,
        // pathRewrite: { '^/clubactivity/queryMyActivityList': '' },
      },
      '/clubactivity/queryMySemesterClubActivity': {
        target: 'https://run-lb.tanmasports.com/v1',
        changeOrigin: true,
        secure: true,
        // pathRewrite: { '^/clubactivity/queryMySemesterClubActivity': '' },
      },
      '/clubactivity/joinOrCancelSchoolSemesterActivity': {
        target: 'https://run-lb.tanmasports.com/v1',
        changeOrigin: true,
        secure: true,
        // pathRewrite: { '^/clubactivity/joinOrCancelSchoolSemesterActivity': '' },
      },
    },
  },
})
