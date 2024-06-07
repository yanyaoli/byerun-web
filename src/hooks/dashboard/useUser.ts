import { ref, Ref } from "vue";
import { ElMessage } from "element-plus";
import { getUserInfo } from "@/apis/user";

interface User {
  oauthToken: {
    token: string;
  };
  [key: string]: any;
}

export default function useUser() {
  const user: Ref<User | null> = ref(null);
  const userLoading = ref(false);

  const fetchUser = async () => {
    userLoading.value = true;
    user.value = null;
    try {
      const response = await getUserInfo();
      if (response.data.code === 10000) {
        user.value = response.data.response;
        const token = response.data.response.oauthToken.token;
        const userData = response.data.response;
        localStorage.setItem("token", token);
        localStorage.setItem("userData", JSON.stringify(userData));
        return true;
      } else {
        user.value = null;
        ElMessage.error("获取用户信息失败: " + response.data.msg);
        return false;
      }
    } catch (error: any) {
      user.value = null;
      ElMessage.error("获取用户信息出错: " + error.message);
      return false;
    } finally {
      userLoading.value = false;
    }
  };
  return {
    user,
    userLoading,
    fetchUser,
  };
}
