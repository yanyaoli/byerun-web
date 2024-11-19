// hooks/run/useSubmitActivity.ts
import { ref } from "vue";
import { submitActivityInfo } from "@/apis/run";
import { ElMessage } from "element-plus";

interface submitData {
  runDistance: number;
  runTime: number;
  mapChoice: string;
  userId: number;
  semesterYear: number;
}

export default function useSubmitActivity() {
  const isSubmitting = ref(false);
  const submit = async (
    runDistance: number,
    runTime: number,
    mapChoice: string,
    schoolId: number,
    userId: number
  ) => {
    isSubmitting.value = true;
    try {
        const runStandardData = JSON.parse(localStorage.getItem('runStandardData') || '{}');
        if (!runStandardData.semesterYear) {
          ElMessage.error("错误: 缺少学期年份信息");
          return false;
        }
      const semesterYear = runStandardData.semesterYear;
      const data: submitData = {
        runDistance,
        runTime,
        mapChoice,
        userId,
        semesterYear,
      };
      const submitResponse = await submitActivityInfo(data);
      if (submitResponse.data.code !== 10000) {
        ElMessage.error("提交失败: " + submitResponse.data.msg);
        return false;
      }
      ElMessage.success("提交成功," + submitResponse.data.response.resultDesc);
      return true;
    } catch (error: any) {
		ElMessage.error("提交失败: " + error.message);
      return false;
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    isSubmitting,
    submit,
  };
}
