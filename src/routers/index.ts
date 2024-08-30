import { createRouter, createWebHashHistory } from "vue-router";

const Login = () => import(/* webpackChunkName: "login" */ "../views/Login.vue");
const DashBoard = () => import(/* webpackChunkName: "dashboard" */ "../views/DashBoard.vue");
const Club = () => import(/* webpackChunkName: "club" */ "../views/Club.vue");
const Home = () => import(/* webpackChunkName: "home" */ "../views/Home.vue");

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/home", component: Home },
    { path: "/login", component: Login },
    { path: "/dashboard", component: DashBoard },
    { path: "/club", component: Club },
    { path: "/myclub", component: Club },
    { path: "/:pathMatch(.*)*", component: Home },
    { path: "/", redirect: "/home" },
  ],
});

export default router;