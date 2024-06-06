// smsStore.ts
import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { sendSms } from '@/apis/login'; // 假设这是您的 API 调用文件

export const useSmsStore = defineStore('sms', {
  state: (): { smsLoading: boolean; phoneNum: string; smsCode: string; codeDisabled: boolean; codeText: string } => ({
    smsLoading: false,
    phoneNum: '',
    smsCode: '',
    codeDisabled: false,
    codeText: '获取验证码',
  }),
  actions: {
    async sendSms(phoneNum: number) {
      this.smsLoading = true;
      this.codeDisabled = true;
      try {
        const response = await sendSms(phoneNum);
        if (response.data.code === 10000) {
          ElMessage.success('验证码发送成功');
        } else {
          ElMessage.error('验证码发送失败: ' + response.data.msg);
        }
        this.startTimer(10);
      } catch (error: any) {
        ElMessage.error('发送验证码失败: ' + error.message);
      } finally {
        this.smsLoading = false;
      }
    },
    startTimer(duration: number) {
      let seconds = duration;
      const intervalId = setInterval(() => {
        if (seconds <= 0) {
          clearInterval(intervalId);
          this.codeText = '获取验证码';
          this.codeDisabled = false;
        } else {
          seconds -= 1;
          this.codeText = `${seconds} 秒后重新获取`;
        }
      }, 1000);
    }
  }
});