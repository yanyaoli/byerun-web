import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { createRouter, createWebHistory } from 'vue-router';
import UserLogin from './components/UserLogin.vue';
import UserInfo from './components/UserInfo.vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ClubInfo from './components/ClubInfo.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: UserLogin },
    { path: '/user', component: UserInfo },
    { path: '/club', component: ClubInfo },
    { path: '/myclub', component: ClubInfo },
    { path: '/:pathMatch(.*)*', component: UserLogin},
    { path: '/:pathMatch(.*)*', redirect: '/login'}
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