import { ref } from "vue";
import { ElMessage } from "element-plus";
import { updatePassword } from "@/apis/login";

interface ResetResponse {
  data: {
    code: number;
    msg: string;
  };
}

export default function useResetPassword() {
  const ResetLoading = ref(false);

  const fetchResetPassword = async (
    phoneNum: number,
    newPassword: string,
    smsCode: number
  ) => {
    ResetLoading.value = true;
    try {
      const response: ResetResponse = await updatePassword(
        phoneNum,
        newPassword,
        smsCode
      );
      if (response.data.code === 10000) {
        ElMessage.success("密码重置成功");
        return true;
      } else {
        ElMessage.error("密码重置失败: " + response.data.msg);
        return false;
      }
    } catch (error: any) {
      console.error("密码重置出错: " + error.message);
      return false;
    } finally {
      ResetLoading.value = false;
    }
  };

  return {
    ResetLoading,
    fetchResetPassword,
  };
}
