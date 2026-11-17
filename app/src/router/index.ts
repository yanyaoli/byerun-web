import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import RootPage from '@/views/RootPage.vue';
import MapDrawerPage from '@/views/MapDrawerPage.vue';
import SettingsPage from '@/views/SettingsPage.vue';
import AppearancePage from '@/views/AppearancePage.vue';
import ServerSettingsPage from '@/views/ServerSettingsPage.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: RootPage },
  { path: '/map-drawer', name: 'map-drawer', component: MapDrawerPage },
  { path: '/settings', name: 'settings', component: SettingsPage },
  { path: '/settings/appearance', name: 'appearance-settings', component: AppearancePage },
  { path: '/settings/server', name: 'server-settings', component: ServerSettingsPage },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
});

router.addRoute({ path: '/:catchAll(.*)', redirect: '/' });

export default router;
