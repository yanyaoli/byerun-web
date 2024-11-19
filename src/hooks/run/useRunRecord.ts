import { ref } from "vue";
import { queryRunRecord } from "@/apis/run";
import { ElMessage } from "element-plus";

export default function useRunRecord() {
  const runRecord = ref<any[]>([]);
  const fetchRunRecord = async (pageNum: number, pageSize: number) => {
    try {
      const response = await queryRunRecord(pageNum, pageSize);
      if (response.data.code === 10000) {
        if (response.data.response.length === 0) {
          ElMessage.success("暂无跑步记录");
        } else {
          runRecord.value = [...runRecord.value, ...response.data.response];
        }
      } else {
        ElMessage.error(response.data.msg);
        return { code: response.data.code, msg: response.data.msg, response: [] };
      }
      return response.data;
    } catch (error: any) {
      ElMessage.error("获取跑步记录出错: " + error.message);
      return { code: 500, msg: "获取跑步记录出错", response: [] };
    }
  };
  return {
    runRecord,
    fetchRunRecord,
  };
}