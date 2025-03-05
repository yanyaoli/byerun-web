import { ref } from "vue";
import { ElMessage } from "element-plus";
import { userService } from "@/services/user";
import { genTrackPoints, getDate } from "@/utils/track";
import { generateDynamicPath } from "@/utils/map";
import { config } from "@/config";

interface SubmitData {
  runDistance: number;
  runTime: number;
  mapChoice: string;
  userId: number;
  semesterYear: number;
}

export function useSubmitActivity() {
  const isSubmitting = ref(false);

  const submit = async (
    runDistance: number,
    runTime: number,
    mapChoice: string,
    userId: number
  ) => {
    if (isSubmitting.value) {
      ElMessage.warning("正在提交中，请勿重复操作");
      return false;
    }

    isSubmitting.value = true;
    try {
      const runStandardData = JSON.parse(
        localStorage.getItem("runStandardData") || "{}"
      );
      if (!runStandardData.semesterYear) {
        ElMessage.error("错误: 缺少学期年份信息");
        return false;
      }

      const trackPoints = genTrackPoints(runDistance, mapChoice);

      const body = {
        againRunStatus: "0",
        againRunTime: 0,
        appVersions: config.device.appVersion,
        brand: config.device.brand,
        mobileType: config.device.mobileType,
        sysVersions: config.device.sysVersion,
        trackPoints,
        distanceTimeStatus: "1",
        innerSchool: "1",
        runDistance,
        runTime,
        userId,
        vocalStatus: "1",
        yearSemester: runStandardData.semesterYear,
        recordDate: getDate(),
      };

      const { response } = await userService.submitNewActivity(body);
      ElMessage.success("提交成功," + response.resultDesc);
      return true;
    } catch (error) {
      console.error("提交失败:", error);
      ElMessage.error("提交失败");
      return false;
    } finally {
      setTimeout(() => {
        isSubmitting.value = false;
      }, 2000);
    }
  };

  return {
    isSubmitting,
    submit,
  };
}
