import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    hot: true,
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: 'all',
    hostCheck: false,
    cors: true,
    hmr: {
      enabled: true,
      host: '0.0.0.0',
      port: 5173,
      clientPort: 5173,
      path: '/ws',
      protocol: 'ws'
    }
  }
})