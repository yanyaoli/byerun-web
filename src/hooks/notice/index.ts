import axios from "axios";
import address from "@/services/address";
import { ElNotification, ElMessage } from "element-plus"; // 导入 ElMessage

export default function useNotice() {
  const fetchNotice = async () => {
    try {
      const response = await axios.get(address.noticeURL);
      if (response.status !== 200) {
        return null;
      }
      const title = response.data.title;
      const message = response.data.message;
      const type = response.data.type;

      if (!message) {
        return null;
      }

      return {
        title,
        message,
        type,
      };
    } catch (error) {
      console.error("获取通知出错：", error);
      return null;
    }
  };

  const getNotice = async () => {
    try {
      const notice = await fetchNotice();
      if (notice) {
        ElNotification({
          title: notice.title,
          message: notice.message,
          ...(notice.type ? { type: notice.type } : {}),
          duration: 5000,
          dangerouslyUseHTMLString: true,
          position: "top-left",
        });
      } else {
        return;
      }
    } catch (error) {
      return;
    }
  };

  return {
    fetchNotice,
    getNotice,
  };
}
