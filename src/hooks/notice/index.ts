import axios from "axios";
import { ElNotification } from "element-plus"; // 导入 ElMessage

export default function useNotice() {
  const noticeUrl = "https://unirun-notice.ohnnn.com/";

  const fetchNotice = async () => {
    try {
      const response = await axios.get(noticeUrl);
      if (response.status !== 200) {
        return null;
      }
      const title = response.data.title;
      const message = response.data.message;
      const type = response.data.type;
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
          duration: 3000,
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
