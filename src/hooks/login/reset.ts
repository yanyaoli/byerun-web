// resetPasswordStore.ts
import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { updatePassword } from '@/apis/login';

export const useResetPasswordStore = defineStore('resetPassword', {
  state: (): { resetLoading: boolean; newPassword: string } => ({
    resetLoading: false,
    newPassword: '',
  }),
  actions: {
    async resetPassword(phoneNum: number, newPassword: string, smsCode: string) {
      this.resetLoading = true;
      try {
        const response = await updatePassword(phoneNum, newPassword, smsCode);
        if (response.data.code === 10000) {
          ElMessage.success('密码重置成功');
        } else {
          ElMessage.error('密码重置失败: ' + response.data.msg);
        }
      } catch (error: any) {
        ElMessage.error('密码重置失败: ' + error.message);
      } finally {
        this.resetLoading = false;
      }
    }
  }
});