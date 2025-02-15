import { request } from "@/utils/request";
import type { LoginResponse } from "@/types/api";
import { config, API_URLS } from "@/config";

// 重置密码参数
interface ResetPasswordParams {
    password: string;
    passwordRes: string;
    userPhone: number;
    code: number;
}

// 登录服务
export const authService = {
  login: async (userPhone: string, password: string) => {
    try {
      const response = await request.post<LoginResponse>(
        API_URLS.login,
        {
          ...config.device,
          password,
          userPhone,
        }
      );
      console.log("Auth service response:", response);
      return response;
    } catch (error) {
      console.error("Auth service login error:", error);
      throw error;
    }
  },

  // 发送验证码
  sendSms: (phoneNum: string) => {
    return request.get(API_URLS.sendSms, {
      params: { phoneNum },
    });
  },

  // 重置密码
  resetPassword: (params: ResetPasswordParams) => {
    return request.post(API_URLS.updatePassword, params);
  },
};