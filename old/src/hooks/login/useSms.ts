import { ref } from "vue";
import { ElMessage } from "element-plus";
import { sendSms } from "@/apis/login";

interface SmsResponse {
  data: {
    code: number;
    msg: string;
  };
}

export default function useSms() {
  const SmsLoading = ref(false);
  const codeText = ref("获取验证码");
  const codeDisabled = ref(false);

  const startTimer = (
    duration: number,
    onTick: (seconds: number) => void,
    onComplete: () => void
  ) => {
    let seconds = duration;
    const intervalId = setInterval(() => {
      if (seconds <= 0) {
        clearInterval(intervalId);
        onComplete();
      } else {
        seconds -= 1;
        onTick(seconds);
      }
    }, 1000);
  };

  const fetchSendSMS = async (phoneNum: number) => {
    SmsLoading.value = true;
    codeText.value = "正在发送";
    try {
      const response: SmsResponse = await sendSms(phoneNum);
      if (response.data.code === 10000) {
        ElMessage.success("验证码发送成功");
      } else {
        ElMessage.error("验证码发送失败: " + response.data.msg);
      }
    } catch (error: any) {
      ElMessage.error("验证码发送出错" + error.message);
      codeText.value = "获取验证码";
      codeDisabled.value = false;
    } finally {
      SmsLoading.value = false;
      startTimer(
        60,
        (seconds) => {
          codeText.value = `${seconds} 秒后重新获取`;
          codeDisabled.value = true;
        },
        () => {
          codeText.value = "获取验证码";
          codeDisabled.value = false;
        }
      );
    }
  };

  return {
    SmsLoading,
    codeText,
    codeDisabled,
    fetchSendSMS,
  };
}
