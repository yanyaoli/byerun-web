import { createRouter, createWebHashHistory } from 'vue-router';
import UserLogin from '../components/UserLogin.vue';
import DashBoard from '../components/DashBoard.vue';
import ClubInfo from '../components/ClubInfo.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/login', component: UserLogin },
    { path: '/user', component: DashBoard },
    { path: '/club', component: ClubInfo },
    { path: '/myclub', component: ClubInfo },
    { path: '/:pathMatch(.*)*', component: DashBoard},
    { path: '/', redirect: '/user'}
  ]
});

export default router;