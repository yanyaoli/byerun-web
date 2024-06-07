import { createRouter, createWebHashHistory } from "vue-router";
import Login from "../views/Login.vue";
import DashBoard from "../views/DashBoard.vue";
import Club from "../views/Club.vue";
import Home from "../views/Home.vue";

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
