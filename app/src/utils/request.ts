import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ElMessage } from "element-plus";
import { requestConfig, errorMessages } from "@/config/request";
import { generateSign } from "@/utils/sign";
import router from "@/router";
import { config } from "@/config";

class Request {
  private instance: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 从 localStorage 获取 token
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.token = token;
        }

        // 生成签名
        const sign = generateSign(
          config.method === "get" ? config.params : null,
          config.method === "post" ? config.data : null
        );
        config.headers.sign = sign;

        return config;
      },
      (error: any) => {
        ElMessage.error("请求发送失败：" + error.message);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 如果是通知接口，直接返回数据
        if (response.config.url === config.urls.notice) {
          return response;
        }

        const { code, msg, response: data } = response.data;

        // 处理业务错误
        if (code !== 10000) {
          ElMessage.error(msg || "请求失败");

          // token 过期或无效
          if (code === 401) {
            localStorage.removeItem("token");
            router.push("/login");
          }

          return Promise.reject(new Error(msg));
        }

        return response.data;
      },
      (error) => {
        const status = error.response?.status;
        const errorMsg = errorMessages[status] || "请求失败，请稍后重试";
        ElMessage.error(errorMsg);

        // HTTP 401 错误也需要处理
        if (status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        }

        return Promise.reject(error);
      }
    );
  }

  // 封装请求方法
  request<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.instance.request(config);
  }

  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.post(url, data, config);
  }
}

export const request = new Request(requestConfig);
