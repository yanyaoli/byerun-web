import request from "@/services/request";
import address from "@/services/address";

// interface ClubInfoResponse {
//   configurationId: number;
//   activityName: string;
//   startDay: string;
//   endDay: string;
//   weekDay: string;
//   startTime: string;
//   endTime: string;
//   addressDetail: string;
//   teacherId: number;
//   teacherName: string;
//   clubIntroduction: string;
//   studentNum: number;
//   joinStudentNum: number;
//   joinStatus: string;
// }

// interface WeeklyClubResponse {
//   code: number;
//   msg: string;
//   response: ClubInfoResponse[];
// }

// interface ClubTaskResponse {
//   code: number;
//   msg: string;
//   response: ClubInfoResponse[];
// }

// interface ClubHistoryResponse {
//   code: number;
//   msg: string;
//   response: ClubInfoResponse[];
// }

// interface JoinClubResponse {
//   code: number;
//   msg: string;
//   response: ClubInfoResponse[];
// }

// 查询指定星期的俱乐部信息
export const queryWeeklyClub = (weekDay: number) => {
  return request.get(address.weeklyClub, {
    params: {
      pageNo: 1,
      pageSize: 15,
      weekDay,
    },
  });
};

// 查询待参与俱乐部信息
export const queryClubTask = () => {
  return request.get(address.clubTask);
};

// 查询已参加俱乐部记录
export const queryClubHistory = (studentId: number) => {
  return request.get(address.clubHistory, {
    params: {
      pageNo: 1,
      pageSize: 15,
      studentId,
    },
  });
};

// 加入俱乐部
export const joinClub = (configurationId: number, type: number) => {
  return request.get(address.joinClub, {
    params: {
      configurationId,
      type,
    },
  });
};
