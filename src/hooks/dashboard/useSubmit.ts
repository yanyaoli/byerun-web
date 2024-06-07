import { ref, Ref } from "vue";
import { getSemesterYear, submitActivityInfo } from "@/apis/user";
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
      const response = await getSemesterYear(schoolId);
      if (response.data.code !== 10000) {
        ElMessage.error("获取学年学期失败: " + response.data.msg);
        return false;
      }
      const semesterYear = response.data.response.semesterYear;
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
