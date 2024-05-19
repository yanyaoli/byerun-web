import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import UserLogin from './components/UserLogin.vue';
import UserInfo from './components/UserInfo.vue';
import ClubInfo from './components/ClubInfo.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/login', component: UserLogin },
    { path: '/user', component: UserInfo },
    { path: '/club', component: ClubInfo },
    { path: '/myclub', component: ClubInfo },
    { path: '/:pathMatch(.*)*', component: UserInfo},
    { path: '/', redirect: '/user'}
  ]
});

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

document.title = "UNIRUN HELPER";

app.use(ElementPlus);
app.use(router);

app.mount('#app');