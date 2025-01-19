import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    name: 'home',
    path: '/home',
    component: () => import('@/views/Home.vue'),
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('@/views/LoginViews/Login.vue'),
  },
  {
    name: 'dashboard',
    path: '/dashboard',
    component: () => import('@/views/DashBoard.vue'),
  },
  {
    name: 'runrecord',
    path: '/run/record',
    component: () => import('@/views/RunRecord.vue'),
  },
  {
    name: 'club',
    path: '/club',
    component: () => import('@/views/Club.vue'),
  },
  {
    name: 'myclub',
    path: '/myclub',
    component: () => import('@/views/Club.vue'),
  },
  {
    name: 'notfound',
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/',
    redirect: '/home',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;