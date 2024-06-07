import { ref } from "vue";
import { ElMessage } from "element-plus";
import { login } from "@/apis/login";
import { useRouter } from "vue-router";

interface LoginResponse {
  data: {
    code: number;
    msg: string;
    response: {
      oauthToken: { token: string };
      [key: string]: any;
    };
  };
}

export default function useLogin() {
  const LoginLoading = ref(false);
  const router = useRouter();
  const isLoggedIn = ref(false);
  const fetchLogin = async (phone: number, password: string) => {
    LoginLoading.value = true;

    try {
      const response: LoginResponse = await login(phone, password);
      if (response.data.code === 10000) {
        const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
        accounts.push({ phone, password });
        localStorage.setItem("accounts", JSON.stringify(accounts));
        const token = response.data.response.oauthToken.token;
        const userData = response.data.response;
        localStorage.setItem("token", token);
        localStorage.setItem("userData", JSON.stringify(userData));
        ElMessage.success("登录成功");
        isLoggedIn.value = true;
        router.push("/user");
      } else {
        ElMessage.error("登录失败: " + response.data.msg);
      }
    } catch (error: any) {
		ElMessage.error("登录失败: " + error.message);
    } finally {
      LoginLoading.value = false;
    }
  };

  const LoginState = () => {
    const token = localStorage.getItem("token");
    const userDataItem = localStorage.getItem("userData");
    const userData = userDataItem ? JSON.parse(userDataItem) : null;

    if (!token || !userData) {
      return false;
    } else {
      return true;
    }
  };
  return {
    LoginLoading,
    isLoggedIn,
    fetchLogin,
    LoginState,
  };
}
