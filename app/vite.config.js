import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [tailwindcss(), vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    optimizeDeps: {
      include: ['leaflet'],
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
        '/autorunserver': {
          target: env.VITE_AUTORUN_SERVER_BASE,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/autorunserver/, ''),
        },
      },
    },
  };
});
