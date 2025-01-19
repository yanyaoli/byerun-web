import { request } from "@/utils/request";
import type { LoginResponse } from "@/types/api";
import { config, API_URLS } from "@/config";

interface ResetPasswordParams {
    password: string;
    passwordRes: string;
    userPhone: number;
    code: number;
}

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

  sendSms: (phoneNum: string) => {
    return request.get(API_URLS.sendSms, {
      params: { phoneNum },
    });
  },

  resetPassword: (params: ResetPasswordParams) => {
    return request.post(API_URLS.updatePassword, params);
  },
};