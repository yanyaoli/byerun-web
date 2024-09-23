import { ref, Ref } from "vue";
import { getActivityInfo } from "@/apis/user";
import { ElMessage } from "element-plus";

interface ActivityData {
  club_completion_rate: string;
  running_completion_rate: string;
  club_completion_percentage: number;
  running_completion_percentage: number;
}

export default function useActivity() {
  const activity: Ref<ActivityData | null> = ref(null);
  const isLoading = ref(false);

  const adjustCompletionPercentage = (percentage: number): number => {
    return percentage > 100 ? 100 : percentage;
  };

  const fetchActivity = async (schoolId: number, studentId: number) => {
    isLoading.value = true;
    activity.value = null;
    try {
      const response = await getActivityInfo(schoolId, studentId);
      if (response.data.code === 10000) {
        const totalNum = response.data.response.totalNum;
        const joinNum = response.data.response.joinNum;
        const runTotalNum = response.data.response.runTotalNum;
        const runJoinNum = response.data.response.runJoinNum;
        const club_completion_rate = `${joinNum}/${totalNum}`;
        const running_completion_rate = `${runJoinNum}/${runTotalNum}`;
        let club_completion_percentage = totalNum === 0 ? 0 : Math.floor((joinNum / totalNum) * 100);
        let running_completion_percentage = runTotalNum === 0 ? 0 : Math.floor((runJoinNum / runTotalNum) * 100);

        club_completion_percentage = adjustCompletionPercentage(club_completion_percentage);
        running_completion_percentage = adjustCompletionPercentage(running_completion_percentage);

        activity.value = {
          club_completion_rate: club_completion_rate,
          running_completion_rate: running_completion_rate,
          club_completion_percentage: club_completion_percentage,
          running_completion_percentage: running_completion_percentage,
        };
      } else {
        ElMessage.error("获取活动信息失败: " + response.data.msg);
      }
    } catch (error: any) {
      ElMessage.error("获取活动信息出错: " + error.message);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    activity,
    isLoading,
    fetchActivity,
  };
}