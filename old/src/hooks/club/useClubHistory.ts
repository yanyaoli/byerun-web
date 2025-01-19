import { ref } from "vue";
import { queryClubHistory } from "@/apis/club";
import { ElMessage } from "element-plus";

export default function useClubHistory() {
  const ClubHistory = ref([]);
  const fetchClubHistory = async (studentId: number) => {
    ClubHistory.value = [];
    try {
      const response = await queryClubHistory(studentId);
      if (response.data.code === 10000) {
        if (response.data.response.length === 0) {
          ClubHistory.value = [];
        } else {
          ClubHistory.value = response.data.response.map((club: any) => ({
            ...club,
            joinStatus: club.joinStatus !== undefined ? club.joinStatus : 4,
          }));
        }
      } else {
        ElMessage.error(response.data.msg);
        ClubHistory.value = [];
      }
    } catch (error: any) {
		ElMessage.error("获取俱乐部历史信息出错: " + error.message);
    }
  };
  return {
    ClubHistory,
    fetchClubHistory,
  };
}
