import axios from "axios";
import generateSign from "@/utils/sign";
import { APPKEY } from "@/utils/appConfig";
import address from "@/services/address";

const instance = axios.create({
  baseURL: address.baseURL,
  timeout: 15000,
});

instance.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.token = `${token}`;
    }

    config.headers.appKey = APPKEY;
    config.headers["Content-Type"] = "application/json";

    if (config.method === "post") {
      config.headers.sign = generateSign(null, config.data || {});
    } else if (config.method === "get" && config.params) {
      config.headers.sign = generateSign(config.params || {}, null);
    } else {
      config.headers.sign = generateSign(null, null);
    }

    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

export default instance;
