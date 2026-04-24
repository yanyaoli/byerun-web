import { createRouter, createWebHistory } from 'vue-router';
import RootPage from '@/views/RootPage.vue';
import MapDrawerPage from '@/views/MapDrawerPage.vue';

const routes = [
  { path: '/', name: 'home', component: RootPage },
  { path: '/map-drawer', name: 'map-drawer', component: MapDrawerPage },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
});

router.addRoute({ path: '/:catchAll(.*)', redirect: '/' });

export default router;
