import request from "@/services/request";
import address from "@/services/address";

// 获取用户信息
export const getUserInfo = () => request.get(address.user);

// 获取用户活动信息
export const getActivityInfo = (schoolId: number, studentId: number) =>
  request.get(address.activity, {
    params: {
      schoolId,
      studentId,
    },
});
