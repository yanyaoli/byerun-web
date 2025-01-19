import { ref } from "vue";
import { userService } from "@/services/user";
import { ElMessage } from "element-plus";

export function useNotice() {
  const notice = ref<{ message: string } | null>(null);

  const fetchNotice = async () => {
    try {
      const response = await userService.getNotice();
      notice.value = {
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("获取通知失败:", error);
      ElMessage.error("获取通知失败：" + error.message)
    }
  };

  return {
    notice,
    fetchNotice,
  };
}
