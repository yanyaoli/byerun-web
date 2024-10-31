import { createRouter, createWebHistory } from "vue-router";

const Login = () => import(/* webpackChunkName: "login" */ "../views/Login.vue");
const DashBoard = () => import(/* webpackChunkName: "dashboard" */ "../views/DashBoard.vue");
const Club = () => import(/* webpackChunkName: "club" */ "../views/Club.vue");
const Home = () => import(/* webpackChunkName: "home" */ "../views/Home.vue");
const RunRecord = () => import(/* webpackChunkName: "runrecord" */ "../views/RunRecord.vue");

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/home", component: Home },
    { path: "/login", component: Login },
    { path: "/dashboard", component: DashBoard },
    { path: "/run/record", component: RunRecord },
    { path: "/club", component: Club },
    { path: "/myclub", component: Club },
    { path: "/:pathMatch(.*)*", component: Home },
    { path: "/", redirect: "/home" },
  ],
});

export default router;