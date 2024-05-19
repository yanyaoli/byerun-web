import axios from 'axios';
import generateSign from '@/utils/sign';
import { APPKEY } from '@/utils/appConfig';

const instance = axios.create({
  baseURL: '',
  timeout: 10000
});

// 请求拦截器
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.token = `${token}`;
  }

  config.headers.appKey = APPKEY;

  if (config.method === 'post') {
    config.headers.sign = generateSign(null, config.data || {});
  } else if (config.method === 'get' && config.params) {
    config.headers.sign = generateSign(config.params || {}, null);
  } else {
    config.headers.sign = generateSign(null, null);
  }

  return config;
}, error => {
  return Promise.reject(error);
});

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
