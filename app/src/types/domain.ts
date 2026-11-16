export interface RunStandard {
  schoolId?: number | string;
  semesterYear?: string;
  boyOnceDistanceMin?: number;
  boyOnceDistanceMax?: number;
  girlOnceDistanceMin?: number;
  girlOnceDistanceMax?: number;
  boyOnceTimeMin?: number;
  boyOnceTimeMax?: number;
  girlOnceTimeMin?: number;
  girlOnceTimeMax?: number;
  semesterDistance?: number;
  semesterRunTimes?: number;
  semesterEndDate?: string;
  boyAllRunTime?: number;
  girlAllRunTime?: number;
  boyAllRunDistance?: number;
  girlAllRunDistance?: number;
  firstSemesterDateEnd?: string;
  secondSemesterDateEnd?: string;
}

export interface RunInfo {
  runTotalDistance?: number;
  runValidDistance?: number;
  validCount?: number;
  runValidCount?: number;
  runTotalCount?: number;
  semesterDistance?: number;
  score?: number;
}

export interface RunRecord {
  recordId: string | number;
  key?: string | number;
  runDistance: number;
  runTime: number;
  runSpeed?: number;
  createTime: string;
  runStatus: string; // '1' = 有效, '2' = 无效
  defeatedInfo?: string;
}

export interface ClubActivity {
  activityId: number | string;
  clubActivityId?: number | string;
  configurationId?: number | string;
  id?: number | string;
  activityName: string;
  activityDate?: string;
  yymmdd?: string;
  startTime: string;
  endTime: string;
  activityAddress?: string;
  address?: string;
  addressDetail?: string;
  activityStatus?: string | number;
  signInStudent?: number;
  joinStudentNum?: number;
  joinNum?: number;
  limitNum?: number;
  status?: string | number;
  latitude?: string | number;
  longitude?: string | number;
  signType?: string;
  itemId?: string | number;
  activityItemId?: string | number;
  optionStatus?: string | number;
  maxStudent?: string | number;
  studentNum?: string | number;
  itemName?: string;
  isJoin?: number; // 1 = 已报名, 0 = 未报名
}

export interface ClubSignStatus {
  signInStatus: number | null; // 1 = 已签到, 0 = 未签到
  signBackStatus: number | null; // 1 = 已签退, 0 = 未签退
  activityId?: number;
  activityName?: string;
  startTime?: string;
  endTime?: string;
  latitude?: string;
  longitude?: string;
}

export interface PushMessage {
  pushId: string | number;
  pushTitle: string;
  pushText: string;
  createTime: string;
  readStatus: string; // '1' = 已读, '0' = 未读
  sendType?: string;
  url?: string;
}

export interface ChatContentPart {
  type: 'text' | 'image' | 'sticker' | string;
  value: string;
}

export interface ChatUser {
  user_id?: string | number;
  nickname?: string;
  qq?: string;
  last_seen_at?: string;
  avatar?: string;
  [key: string]: any;
}

export interface ChatMessage {
  id: string | number;
  content: string | ChatContentPart[];
  user_id: string | number;
  user_name?: string;
  created_at: string;
  parent_id?: string | null;
  reply_to?: {
    id: string | number;
    user_name: string;
    content: string;
  } | null;
}

export interface ServerNotification {
  id?: string | number;
  title?: string;
  content: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  createdAt?: string;
  [key: string]: any;
}
