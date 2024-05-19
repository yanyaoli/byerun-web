const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'https://run-lb.tanmasports.com/v1',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }, // 将/api替换为空
      },
    },
  },
})

