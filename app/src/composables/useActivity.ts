import { ref } from "vue";
import { ElMessage } from "element-plus";
import { userService } from "@/services/user";

interface ActivityData {
  totalNum: number;
  joinNum: number;
  runTotalNum: number;
  runJoinNum: number;
  club_completion_rate: string;
  running_completion_rate: string;
  club_completion_percentage: number;
  running_completion_percentage: number;
}

export function useActivity() {
  const activity = ref<ActivityData | null>(null);
  const isLoading = ref(false);

  const adjustCompletionPercentage = (percentage: number): number => {
    return percentage > 100 ? 100 : percentage;
  };

  const fetchActivity = async (schoolId: number, studentId: number) => {
    if (!schoolId || !studentId) {
      console.error("Missing required params:", { schoolId, studentId });
      ElMessage.error("获取活动信息失败：缺少必要参数");
      return;
    }

    isLoading.value = true;
    activity.value = null;

    try {
      const { response } = await userService.getActivityInfo(
        schoolId,
        studentId
      );
      const { totalNum, joinNum, runTotalNum, runJoinNum } = response;

      const club_completion_rate = `${joinNum}/${totalNum}`;
      const running_completion_rate = `${runJoinNum}/${runTotalNum}`;

      let club_completion_percentage =
        totalNum === 0 ? 0 : Math.floor((joinNum / totalNum) * 100);
      let running_completion_percentage =
        runTotalNum === 0 ? 0 : Math.floor((runJoinNum / runTotalNum) * 100);

      club_completion_percentage = adjustCompletionPercentage(
        club_completion_percentage
      );
      running_completion_percentage = adjustCompletionPercentage(
        running_completion_percentage
      );

      activity.value = {
        totalNum,
        joinNum,
        runTotalNum,
        runJoinNum,
        club_completion_rate,
        running_completion_rate,
        club_completion_percentage,
        running_completion_percentage,
      };

      localStorage.setItem("activityData", JSON.stringify(activity.value));
    } catch (error) {
      console.error("获取活动信息失败:", error);
      ElMessage.error("获取活动信息失败，请重试");
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
