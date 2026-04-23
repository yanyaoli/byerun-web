import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [tailwindcss(), vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      cssMinify: 'lightningcss',
      cssCodeSplit: true, // 开启 CSS 拆分
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          // 静态资源分类
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            const info = name.split('.');
            let extType = info[info.length - 1];

            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(name)) {
              extType = 'media';
            } else if (/\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/i.test(name)) {
              extType = 'img';
            } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(name)) {
              extType = 'fonts';
            } else if (/\.css($|\?)/.test(name)) {
              extType = 'css';
            }
            return `assets/${extType}/[name]-[hash][extname]`;
          },
          // JS
          entryFileNames: 'assets/js/[name]-[hash].js',
          chunkFileNames: 'assets/js/[name]-[hash].js',
          // 第三方库
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('leaflet')) return 'vendor-map';
              if (id.includes('axios') || id.includes('socket.io')) return 'vendor-network';
              if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router'))
                return 'vendor-framework';
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
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
