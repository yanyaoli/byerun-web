import { request } from "@/utils/request";
import { stringToMd5 } from "@/utils/crypto";
import { config, API_URLS } from "@/config";
import type { LoginResponse, UserInfo, ApiResponse, Notice } from "@/types/api";
import type { RunRecord } from "@/types/run";

export const userService = {
  login: async (userPhone: string, password: string) => {
    const hashedPassword = stringToMd5(password);
    return request.post<LoginResponse>(API_URLS.login, {
      ...config.device,
      password: hashedPassword,
      userPhone,
    });
  },

  sendSms: async (phoneNum: string) => {
    return request.get<ApiResponse<null>>(API_URLS.sendSms, {
      params: { phoneNum },
    });
  },

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

  getUserInfo: () => {
    return request.get<ApiResponse<UserInfo>>(API_URLS.user);
  },

  getActivityInfo: (schoolId: number, studentId: number) => {
    return request.get<ApiResponse<any>>(API_URLS.activity, {
      params: {
        schoolId,
        studentId,
      },
    });
  },

  getRunStandard: (schoolId: number) => {
    return request.get<ApiResponse<any>>(API_URLS.runStandard, {
      params: {
        schoolId,
      },
    });
  },

  getRunInfo: (userId: number, yearSemester: number) => {
    return request.get<ApiResponse<any>>(API_URLS.runInfo, {
      params: {
        userId,
        yearSemester,
      },
    });
  },

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

  submitNewActivity: async (data: any) => {
    return request.post<ApiResponse<any>>(API_URLS.newActivity, data);
  },

  getNotice: () => {
    return request.get(config.urls.notice);
  },
};
