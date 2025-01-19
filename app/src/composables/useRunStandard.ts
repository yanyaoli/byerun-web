import { ref } from "vue";
import { ElMessage } from "element-plus";
import { userService } from "@/services/user";
import type { RunStandard } from "@/types/run";

export function useRunStandard() {
  const runDistanceMin = ref(1000);
  const runDistanceMax = ref(5000);
  const runTimeMin = ref(30);
  const runTimeMax = ref(100);
  const runStandardData = ref<RunStandard | null>(null);
  const semesterDateEnd = ref("");

  const fetchRunStandard = async (schoolId: number) => {
    try {
      const { response } = await userService.getRunStandard(schoolId);
      runStandardData.value = response;
      localStorage.setItem("runStandardData", JSON.stringify(response));
      setRunStandardValues();
    } catch (error: any) {
      console.error("获取跑步标准信息失败:", error);
      ElMessage.error("获取跑步标准信息失败" + error.message);
    }
  };

  const setRunStandardValues = () => {
    const runStandard = JSON.parse(
      localStorage.getItem("runStandardData") || "{}"
    );
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const gender = userData.gender;
    const semesterYear = runStandard.semesterYear;
    const isSecondSemester = semesterYear && semesterYear.slice(-1) === "2";

    if (gender === "1") {
      runDistanceMin.value = runStandard.boyOnceDistanceMin;
      runDistanceMax.value = runStandard.boyOnceDistanceMax;
      runTimeMin.value = runStandard.boyOnceTimeMin;
      runTimeMax.value = runStandard.boyOnceTimeMax;
    } else {
      runDistanceMin.value = runStandard.girlOnceDistanceMin;
      runDistanceMax.value = runStandard.girlOnceDistanceMax;
      runTimeMin.value = runStandard.girlOnceTimeMin;
      runTimeMax.value = runStandard.girlOnceTimeMax;
    }

    semesterDateEnd.value = isSecondSemester
      ? runStandard.secondSemesterDateEnd
      : runStandard.firstSemesterDateEnd;

    ElMessage.warning({
      message: `本学期校园跑截至日期：${semesterDateEnd.value}`,
      duration: 5000,
    });
  };

  return {
    runDistanceMin,
    runDistanceMax,
    runTimeMin,
    runTimeMax,
    runStandardData,
    semesterDateEnd,
    fetchRunStandard,
    setRunStandardValues,
  };
}
