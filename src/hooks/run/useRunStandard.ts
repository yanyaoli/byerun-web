// hooks/run/useRunStandard.ts
import { ref } from 'vue';
import { getRunStandard } from '@/apis/run';
import { ElMessage } from 'element-plus';

interface RunStandard_Success {
  code: number;
  msg: string;
  response: {
    createTime: string;
    schoolId: number;
    standardId: number;
    semesterYear: string;
    effectiveRangeType: string;
    firstSemesterDateEnd: string;
    firstSemesterDateStart: string;
    instanceSemester: string;
    overSpeedWarn: string;
    secondSemesterDateEnd: string;
    secondSemesterDateStart: string;
    vocalStartTime: number;
    vocalEndTime: number;
    vocalType: string;
    vocalVerifyTime: number;
    boyAllRunDistance: number;
    boyAllRunTime: number;
    boyOnceDistanceMax: number;
    boyOnceDistanceMin: number;
    boyOnceTimeMax: number;
    boyOnceTimeMin: number;
    boyRunSpeed: number;
    girlAllRunTime: number;
    girlOnceDistanceMax: number;
    girlOnceDistanceMin: number;
    girlOnceTimeMax: number;
    girlOnceTimeMin: number;
    girlRunSpeed: number;
  };
}

export default function useRunStandard() {
  const runDistanceMin = ref(1000);
  const runDistanceMax = ref(5000);
  const runTimeMin = ref(30);
  const runTimeMax = ref(100);
  const runStandardData = ref<RunStandard_Success['response'] | null>(null);

//   获取跑步标准信息
  const fetchRunStandard = async (schoolId: number) => {
    try {
      const response = await getRunStandard(schoolId);
      if (response.data.code === 10000) {
        runStandardData.value = response.data.response;
        localStorage.setItem('runStandardData', JSON.stringify(runStandardData.value));
        setRunStandardValues();
      } else {
        ElMessage.error("获取跑步标准信息失败: " + response.data.msg);
      }
    } catch (error) {
      ElMessage.error("获取跑步标准信息失败");
    }
  };

//   设置跑步信息区间
  const setRunStandardValues = () => {
    const runStandard = JSON.parse(localStorage.getItem('runStandardData') || '{}');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const gender = userData.gender;
    if (gender === '1') {
      runDistanceMin.value = runStandard.boyOnceDistanceMin;
      runDistanceMax.value = runStandard.boyOnceDistanceMax;
      runTimeMin.value = runStandard.boyOnceTimeMin;
      runTimeMax.value = runStandard.boyOnceTimeMax;
      console.log("使用男生标准");
    } else {
      runDistanceMin.value = runStandard.girlOnceDistanceMin;
      runDistanceMax.value = runStandard.girlOnceDistanceMax;
      runTimeMin.value = runStandard.girlOnceTimeMin;
      runTimeMax.value = runStandard.girlOnceTimeMax;
      console.log("使用女生标准");
    }
    console.log(`跑步里程区间: ${runDistanceMin.value} - ${runDistanceMax.value}`);
    console.log(`跑步时长区间: ${runTimeMin.value} - ${runTimeMax.value}`);
  };

  return {
    runDistanceMin,
    runDistanceMax,
    runTimeMin,
    runTimeMax,
    runStandardData,
    fetchRunStandard,
    setRunStandardValues,
  };
}