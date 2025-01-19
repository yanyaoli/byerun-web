export interface ActivityData {
  totalNum: number;
  joinNum: number;
  runTotalNum: number;
  runJoinNum: number;
  club_completion_rate: string;
  running_completion_rate: string;
  club_completion_percentage: number;
  running_completion_percentage: number;
}

export interface RunInfo {
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
  needRunDistance: number;
  runValidTime: number;
  needRunTime: number;
  runDistanceCompletionPercentage?: number;
}

export interface RunStandard {
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
}

export interface RunRecord {
  recordId: number;
  userId: number;
  studentId: number;
  schoolId: number;
  yearSemester: number;
  recordDate: string;
  recordMonth: string;
  runDistance: number;
  runValidDistance: number;
  runTime: number;
  runValidTime: number;
  runSpeed: number;
  runCalorie: number;
  runValidCalorie: number;
  vocalStatus: string;
  runStatus: string;
  defeatedInfo: string;
  createTime: string;
  infoStatus: string;
  runSpeedWarn: string;
  defeatStudentRatio: number;
  suspectedStatus: string;
  rangeStatus: string;
}

export interface RunRecordResponse {
  records: RunRecord[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface DisplayRunRecord
  extends Omit<RunRecord, "runDistance" | "runTime" | "runSpeed"> {
  key: number;
  runDistance: number;
  runTime: number;
  runSpeed: number;
}
