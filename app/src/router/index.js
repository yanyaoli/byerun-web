import { createRouter, createWebHistory } from 'vue-router';
import AuthPage from '@/views/AuthPage.vue';
import HomePage from '@/views/HomePage.vue';
import { useDataStore } from '@/composables/useDataStore';

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/auth', name: 'auth', component: AuthPage },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
});

// 处理未知路由，重定向到首页
router.addRoute({ path: '/:catchAll(.*)', redirect: '/' });

// 未登录则重定向到 /auth
router.beforeEach((to, from, next) => {
  try {
    const store = useDataStore();
    const token = store.token && store.token.value;
    if (to.name !== 'auth' && !token) {
      return next({ name: 'auth' });
    }
  } catch (e) {
    // ignore
  }
  next();
});

export default router;
