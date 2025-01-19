import { ref } from "vue";
import { ElMessage } from "element-plus";
import { userService } from "@/services/user";
import type { RunInfo } from "@/types/run";

export function useRunInfo() {
  const runInfo = ref<RunInfo | null>(null);

  const adjustCompletionPercentage = (percentage: number): number => {
    return percentage > 100 ? 100 : percentage;
  };

  const fetchRunInfo = async (userId: number) => {
    runInfo.value = null;
    try {
      const runStandardData = JSON.parse(
        localStorage.getItem("runStandardData") || "{}"
      );
      if (!runStandardData.semesterYear) {
        ElMessage.error("错误: 缺少学期年份信息");
        return false;
      }

      const yearSemester = runStandardData.semesterYear;
      const needRunDistance = Number(runStandardData.girlAllRunDistance);

      const { response } = await userService.getRunInfo(userId, yearSemester);
      const runValidDistance = Number(response.runValidDistance);
      const runDistanceCompletionRate = `${runValidDistance}/${needRunDistance}`;
      let runDistanceCompletionPercentage =
        needRunDistance === 0 || runValidDistance === 0
          ? 0
          : Math.floor((runValidDistance / needRunDistance) * 100);

      runDistanceCompletionPercentage = adjustCompletionPercentage(
        runDistanceCompletionPercentage
      );

      runInfo.value = {
        ...response,
        needRunDistance,
        runValidDistance,
        runDistanceCompletionRate,
        runDistanceCompletionPercentage,
      };

      localStorage.setItem("runInfoData", JSON.stringify(runInfo.value));
    } catch (error) {
      console.error("获取跑步信息失败:", error);
      ElMessage.error("获取跑步信息失败");
    }
  };

  return {
    runInfo,
    fetchRunInfo,
  };
}
