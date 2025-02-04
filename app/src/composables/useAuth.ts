import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user";
import { authService } from "@/services/auth";
import { stringToMd5 } from "@/utils/crypto";

export function useAuth() {
  const router = useRouter();
  const userStore = useUserStore();
  const loading = ref(false);

  //   登录
  const login = async (phone: string, password: string) => {
    try {
      loading.value = true;
      const hashedPassword = stringToMd5(password);
      const data = await authService.login(phone, hashedPassword);

      if (data.code === 10000 && data.response) {
        const token = data.response.oauthToken?.token;
        if (!token) {
          console.error("No token in response:", data.response);
          ElMessage.error("登录失败：未获取到token");
          return;
        }
        userStore.setToken(token);

        const { studentName, schoolName, userId, studentId, gender, schoolId } =
          data.response;

        if (!studentName || !schoolName || !userId || !studentId || !schoolId) {
          console.error("Missing user info in response:", data.response);
          ElMessage.error("登录失败：用户信息不完整");
          return;
        }

        userStore.setUserInfo({
          phone,
          name: studentName,
          school: schoolName,
          userId,
          studentId,
          gender,
          schoolId,
        });

        localStorage.setItem("userResponse", JSON.stringify(data.response));

        ElMessage.success("登录成功");
        router.push("/dashboard");
      } else {
        console.error("Login failed:", data);
        ElMessage.error(data.msg || "登录失败");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      loading.value = false;
    }
  };

  //   发送验证码
  const sendVerificationCode = async (phone: string) => {
    try {
      await authService.sendSms(phone);
      ElMessage.success("验证码已发送");
    } catch (error) {
      console.error("发送验证码失败:", error);
      ElMessage.error("发送验证码失败，请重试");
      throw error;
    }
  };

  //   重置密码
  const resetPassword = async (
    phone: string,
    password: string,
    code: string
  ) => {
    try {
      loading.value = true;
      const hashedPassword = stringToMd5(password);
      const response = await authService.resetPassword({
        password: hashedPassword,
        passwordRes: hashedPassword,
        userPhone: Number(phone),
        code: Number(code),
      });

      if (response.code === 10000) {
        ElMessage.success("密码重置成功");
        router.push("/login");
        return true;
      } else {
        console.error("密码重置失败:", response);
        ElMessage.error(response.msg || "密码重置失败");
        return false;
      }
    } catch (error: any) {
      console.error("密码重置失败:", error);
      ElMessage.error(error.message || "密码重置失败，请重试");
      return false;
    } finally {
      loading.value = false;
    }
  };

  //   退出
  const logout = () => {
    userStore.logout();
    router.push("/login");
    ElMessage.success("已退出登录");
  };

  return {
    loading,
    login,
    logout,
    sendVerificationCode,
    resetPassword,
  };
}
