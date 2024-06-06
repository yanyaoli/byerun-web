// loginStore.ts
import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { login } from '@/apis/login';

interface User {
  oauthToken: {
    token: string;
  };
  [key: string]: any;
}

export const useLoginStore = defineStore('login', {
  state: (): { loginLoading: boolean; userData: User | null; token: string | null; isLoggedIn: boolean } => ({
    loginLoading: false,
    userData: JSON.parse(localStorage.getItem('userData') || 'null'),
    token: localStorage.getItem('token'),
    isLoggedIn: false,
  }),
  actions: {
    async login(phone: number, password: string) {
      this.loginLoading = true;
      try {
        const response = await login(phone, password);
        if (response.data.code === 10000) {
          this.userData = response.data.response as User;
          this.token = response.data.response.oauthToken.token;
          this.isLoggedIn = true;
          ElMessage.success('登录成功');
          // 保存用户信息和token到本地存储
          localStorage.setItem('userData', JSON.stringify(this.userData));
          if (this.token !== null) {
            localStorage.setItem('token', this.token);
          }
        } else {
          ElMessage.error('登录失败: ' + response.data.msg);
        }
      } catch (error: any) {
        ElMessage.error('登录失败: ' + error.message);
      } finally {
        this.loginLoading = false;
      }
    }
  }
});