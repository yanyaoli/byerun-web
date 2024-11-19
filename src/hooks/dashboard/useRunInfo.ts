import { ref } from "vue";
import { getRunInfo } from "@/apis/run";
import { ElMessage } from "element-plus";

interface RunInfo {
  userId: number;
  studentId: number;
  schoolId: number;
  semesterId: number;
  runDay: number;
  runValidDay: number;
  runCount: number;
  runValidCount: number;
  runDistance: number;
  runValidDistance: number;
  yearSemester: number;
  runCalorie: number;
  runValidCalorie: number;
  createTime: string;
  needRunDistance?: number;
  runDistanceCompletionRate?: string;
  runDistanceCompletionPercentage?: number;
}

export default function useRunInfo() {
  const runInfo = ref<RunInfo | null>(null);
  const adjustCompletionPercentage = (percentage: number): number => {
    return percentage > 100 ? 100 : percentage;
  };

  const fetchRunInfo = async (userId: number) => {
    runInfo.value = null;
    try {
      const runStandardData = JSON.parse(localStorage.getItem('runStandardData') || '{}');
      if (!runStandardData.semesterYear) {
        ElMessage.error("错误: 缺少学期年份信息");
        return false;
      }
      const yearSemester = runStandardData.semesterYear;
      const needRunDistance = runStandardData.girlAllRunDistance;

      const res = await getRunInfo(userId, yearSemester);
      if (res.data.code === 10000) {
        const runValidDistance = res.data.response.runValidDistance;
        const runDistanceCompletionRate = `${runValidDistance}/${needRunDistance}`;
        let runDistanceCompletionPercentage = (needRunDistance === 0 || runValidDistance === 0) ? 0 : Math.floor((runValidDistance / needRunDistance) * 100);

        runDistanceCompletionPercentage = adjustCompletionPercentage(runDistanceCompletionPercentage);

        runInfo.value = {
          ...res.data.response,
          needRunDistance,
          runDistanceCompletionRate,
          runDistanceCompletionPercentage,
        };
        localStorage.setItem('runInfoData', JSON.stringify(runInfo.value));
      } else {
        ElMessage.error(res.data.msg);
      }
    } catch (error) {
      ElMessage.error("获取跑步信息失败");
    }
  };

  return {
    runInfo,
    fetchRunInfo,
  };
}