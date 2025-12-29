import { ref, reactive } from "vue";
import { api } from "@/composables/useApi";

export function useRunRecords({ pageSize = 10, onMessage } = {}) {
  const records = ref([]);
  const loading = ref(false);
  const pagination = reactive({ current: 1, pageSize, total: 0 });
  const isLoading = ref(false);

  function formatCreateTime(createTime) {
    if (!createTime) return "";
    return createTime.slice(0, 16);
  }

  function formatPaceDetail(time, distance) {
    if (!distance || !time) return "0'00''";
    const pace = time / (distance / 1000);
    const min = Math.floor(pace);
    const sec = Math.round((pace - min) * 60)
      .toString()
      .padStart(2, "0");
    return `${min}'${sec}''`;
  }

  const fetchRecords = async () => {
    loading.value = true;
    pagination.current = 1;
    try {
      const { data } = await api.getRunRecords(
        pagination.current,
        pagination.pageSize
      );

      const recordsList = Array.isArray(data.response)
        ? data.response
        : data.response?.records || [];

      records.value = recordsList.map((record) => ({
        ...record,
        key: record.recordId,
        runDistance: Number(record.runValidDistance || record.runDistance),
        runTime: Number(record.runValidTime || record.runTime),
        runSpeed: record.runStatus === "1" ? Number(record.runSpeed) : 0,
      }));

      pagination.total = data.response?.total || records.value.length || 0;
    } catch (error) {
      console.error("获取跑步记录失败:", error);
      records.value = [];
      pagination.total = 0;
      if (typeof onMessage === "function") onMessage("获取跑步记录失败", "error");
    } finally {
      loading.value = false;
    }
  };

  const loadMoreRecords = async () => {
    if (isLoading.value) return;
    isLoading.value = true;

    try {
      const nextPage = pagination.current + 1;
      const { data } = await api.getRunRecords(nextPage, pagination.pageSize);

      const recordsList = Array.isArray(data.response)
        ? data.response
        : data.response?.records || [];

      if (recordsList.length > 0) {
        const newRecords = recordsList.map((record) => ({
          ...record,
          key: record.recordId,
          runDistance: Number(record.runValidDistance || record.runDistance),
          runTime: Number(record.runValidTime || record.runTime),
          runSpeed: record.runStatus === "1" ? Number(record.runSpeed) : 0,
        }));

        records.value = [...records.value, ...newRecords];
        pagination.current = nextPage;
      } else {
        if (typeof onMessage === "function") onMessage("没有更多数据了", "info");
      }
    } catch (error) {
      if (typeof onMessage === "function") onMessage("加载更多记录失败", "error");
    } finally {
      isLoading.value = false;
    }
  };

  return {
    records,
    loading,
    pagination,
    isLoading,
    fetchRecords,
    loadMoreRecords,
    formatCreateTime,
    formatPaceDetail,
  };
}
