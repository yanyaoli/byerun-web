// userStore.ts
import { defineStore } from "pinia";
import { ElMessage } from "element-plus";
import { login } from "@/apis/login";
import router from "@/routers";

interface User {
  oauthToken: {
    token: string;
  };
  [key: string]: any;
}

export const useUserStore = defineStore("user", {
  state: (): {
    userLoading: boolean;
    userData: User | null;
    token: string | null;
    isLoggedIn: boolean;
  } => ({
    userLoading: false,
    // 从 localStorage 中获取 userData 和 token
    userData: JSON.parse(localStorage.getItem("userData") || "null"),
    token: localStorage.getItem("token"),
    isLoggedIn: false,
  }),
  actions: {
    async login(phone: number, password: string) {
      this.userLoading = true;
      try {
        const response = await login(phone, password);
        if (response.data.code === 10000) {
          this.userData = response.data.response as User;
          this.token = response.data.response.oauthToken.token;
          this.isLoggedIn = true;
          ElMessage.success("登录成功");
          // 保存用户信息和token到本地存储
          localStorage.setItem("userData", JSON.stringify(this.userData));
          if (this.token !== null) {
            localStorage.setItem("token", this.token);
          }
        } else {
          ElMessage.error("登录失败: " + response.data.msg);
        }
      } catch (error: any) {
        ElMessage.error("登录失败: " + error.message);
      } finally {
        this.userLoading = false;
      }
    },
    logout() {
      localStorage.clear();
      this.userData = null;
      this.token = null;
      this.isLoggedIn = false;
      ElMessage.info("账号已退出");
      router.push("/login");
    },
    checkAuth() {
      if (this.token !== null) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    },
  },
});
