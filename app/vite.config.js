import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
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
		// hostCheck: false, // Vite 4+ 以后通常不需要这个，保持 allowedHosts 即可
		cors: true,

		// --- 本地开发代理配置 ---
		proxy: {
			'/devproxy': {
				target: 'https://run-lb.tanmasports.com/v1',
        secure: false, // 禁用证书检查
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/devproxy/, ''), // 去掉请求路径中的前缀
			},
		},
	},
});
