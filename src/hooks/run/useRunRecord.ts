import { ref } from "vue";
import { queryRunRecord } from "@/apis/run";
import { ElMessage } from "element-plus";

export default function useRunRecord() {
  const runRecord = ref([]);
  const fetchRunRecord = async (pageNum: number, pageSize: number) => {
    runRecord.value = [];
    try {
      const response = await queryRunRecord(pageNum, pageSize);
      if (response.data.code === 10000) {
        if (response.data.response.length === 0) {
          runRecord.value = [];
        } else {
          runRecord.value = response.data.response.map((record: any) => ({
            ...record,
          }));
        }
      } else {
        ElMessage.error(response.data.msg);
        runRecord.value = [];
      }
    } catch (error: any) {
      ElMessage.error("获取跑步记录出错: " + error.message);
    }
  };
  return {
    runRecord,
    fetchRunRecord,
  };
}