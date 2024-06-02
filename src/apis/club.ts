import request from '@/services/request';
import address from '@/services/address';

// 定义接口类型
interface ClubActivity {
  configurationId: number;
  activityName: string;
  startDay: string;
  endDay: string;
  weekDay: string;
  startTime: string;
  endTime: string;
  addressDetail: string;
  teacherId: number;
  teacherName: string;
  clubIntroduction: string;
  studentNum: number;
  joinStudentNum: number;
  joinStatus: string;
}

interface ClubInfoResponse {
  code: number;
  msg: string;
  response: ClubActivity[];
}

interface MyTaskResponse {
  code: number;
  msg: string;
  response: any; // 根据实际响应数据结构定义字段
}

interface MyClubResponse {
  code: number;
  msg: string;
  response: any; // 根据实际响应数据结构定义字段
}

interface JoinClubResponse {
  code: number;
  msg: string;
  response: any; // 根据实际响应数据结构定义字段
}

// 俱乐部活动页
// 查询指定星期的俱乐部信息
export const queryClubInfo = (weekDay: number): Promise<ClubInfoResponse> => {
  return request.get(address.club, {
    params: {
      pageNo: 1,
      pageSize: 15,
      weekDay
    }
  });
};

// 查询待参与俱乐部信息
export const queryMyTask = (): Promise<MyTaskResponse> => {
  return request.get(address.myTask);
};

// 查询已参加俱乐部记录
export const queryMyClub = (studentId: number): Promise<MyClubResponse> => {
  return request.get(address.myClub, {
    params: {
      pageNo: 1,
      pageSize: 15,
      studentId
    }
  });
};

// 加入俱乐部
export const joinClub = (configurationId: number, type: number): Promise<JoinClubResponse> => {
  return request.get(address.joinClub, {
    params: {
      configurationId,
      type
    }
  });
};
