import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // 根据当前工作目录中的 mode（development/production）加载 .env 文件
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [tailwindcss(), vue()],
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
      cors: true,

      proxy: {
        '/devproxy': {
          target: 'https://run-lb.tanmasports.com/v1',
          secure: false,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/devproxy/, ''),
        },
        // --- 动态代理配置 ---
        '/autorunserver': {
          // 动态引用环境变量中的后端地址
          target: env.VITE_AUTORUN_SERVER_BASE,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/autorunserver/, ''),
        },
      },
    },
  };
});