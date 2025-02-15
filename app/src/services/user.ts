import { request } from "@/utils/request";
import { stringToMd5 } from "@/utils/crypto";
import { config, API_URLS } from "@/config";
import type { LoginResponse, UserInfo, ApiResponse, Notice } from "@/types/api";
import type { RunRecord } from "@/types/run";

// 用户服务
export const userService = {
  login: async (userPhone: string, password: string) => {
    const hashedPassword = stringToMd5(password);
    return request.post<LoginResponse>(API_URLS.login, {
      ...config.device,
      password: hashedPassword,
      userPhone,
    });
  },

  // 发送验证码
  sendSms: async (phoneNum: string) => {
    return request.get<ApiResponse<null>>(API_URLS.sendSms, {
      params: { phoneNum },
    });
  },

  // 重置密码
  updatePassword: async (
    phoneNum: string,
    newPassword: string,
    smsCode: string
  ) => {
    const hashedPassword = stringToMd5(newPassword);
    return request.post<ApiResponse<null>>(API_URLS.updatePassword, {
      password: hashedPassword,
      passwordRes: hashedPassword,
      userPhone: phoneNum,
      code: smsCode,
    });
  },

  // 获取用户信息
  getUserInfo: () => {
    return request.get<ApiResponse<UserInfo>>(API_URLS.user);
  },

  // 获取活动信息
  getActivityInfo: (schoolId: number, studentId: number) => {
    return request.get<ApiResponse<any>>(API_URLS.activity, {
      params: {
        schoolId,
        studentId,
      },
    });
  },

  // 获取跑步标准信息
  getRunStandard: (schoolId: number) => {
    return request.get<ApiResponse<any>>(API_URLS.runStandard, {
      params: {
        schoolId,
      },
    });
  },

  // 获取学校边界信息
  getSchoolBound: (schoolId: number) => {
    return request.get<ApiResponse<any>>(API_URLS.schoolBound, {
      params: {
        schoolId,
      },
    });
  },

  // 获取跑步信息
  getRunInfo: (userId: number, yearSemester: number) => {
    return request.get<ApiResponse<any>>(API_URLS.runInfo, {
      params: {
        userId,
        yearSemester,
      },
    });
  },

  // 获取跑步记录
  getRunRecord: (pageNum: number, pageSize: number) => {
    return request.get<ApiResponse<{
      records: RunRecord[];
      total: number;
      size: number;
      current: number;
      pages: number;
    }>>(API_URLS.runRecord, {
      params: { pageNum, pageSize },
    });
  },

  // 提交跑步记录
  submitNewActivity: async (data: any) => {
    return request.post<ApiResponse<any>>(API_URLS.newActivity, data);
  },

  // 获取通知
  getNotice: () => {
    return request.get(config.urls.notice);
  },
};
