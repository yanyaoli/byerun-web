import { createRouter, createWebHistory } from 'vue-router';
import RootPage from '@/views/RootPage.vue';

const routes = [{ path: '/', name: 'home', component: RootPage }];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
});

router.addRoute({ path: '/:catchAll(.*)', redirect: '/' });

export default router;
