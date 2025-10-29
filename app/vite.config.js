import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    hot: true,
    hmr: true,
    host: '0.0.0.0',
  },
  transpileDependencies: true,
  lintOnSave: false,  // 关闭语法检查 防止不必要的语法报错
})
