import request from '@/services/request';
import address from '@/services/address';

// 查询指定星期的俱乐部信息接口
export const queryClubInfo = weekDay => request.get(address.club, {
  params: {
    pageNo: 1,
    pageSize: 15,
    weekDay
  }
});

// 查询我的俱乐部信息接口
export const queryMyTask = () => request.get(address.myTask);

// 查询我的俱乐部信息接口
export const queryMyClub = studentId => request.get(address.myClub, {
  params: {
    pageNo: 1,
    pageSize: 15,
    studentId
  }
});

// 加入俱乐部
export const joinClub = (configurationId, type) => request.get(address.joinClub, {
  params: {
    configurationId,
    type
  }
});