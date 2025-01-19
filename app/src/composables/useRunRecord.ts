import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { userService } from "@/services/user";
import { formatDistance } from "@/utils/format";
import type { RunRecord, DisplayRunRecord } from "@/types/run";

export function useRunRecord() {
  const records = ref<DisplayRunRecord[]>([]);
  const loading = ref(false);
  const pagination = reactive({
    current: 1,
    pageSize: 5,
    total: 50,
  });

  const fetchRecords = async () => {
    loading.value = true;
    try {
      const { response } = await userService.getRunRecord(
        pagination.current,
        pagination.pageSize
      );

      const recordsList = Array.isArray(response)
        ? response
        : response?.records || [];

      if (recordsList.length === 0) {
        ElMessage.info("暂无跑步记录");
        records.value = [];
        return;
      }

      records.value = recordsList.map((record: RunRecord) => ({
        ...record,
        key: record.recordId,
        runDistance: Number(record.runValidDistance || record.runDistance),
        runTime: Number(record.runValidTime || record.runTime),
        runSpeed: record.runStatus === "1" ? record.runSpeed : 0,
      }));

      pagination.total = 25;
    } catch (error: any) {
      console.error("获取跑步记录失败:", error);
      ElMessage.error("获取跑步记录失败");
    } finally {
      loading.value = false;
    }
  };

  const handleTableChange = async (currentPage: number) => {
    pagination.current = currentPage;
    await fetchRecords();
  };

  return {
    records,
    loading,
    pagination,
    fetchRecords,
    handleTableChange,
  };
}
