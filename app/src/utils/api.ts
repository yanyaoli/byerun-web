
import axios from 'axios';
import { genSign } from './sign';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    appKey: import.meta.env.VITE_APP_KEY,
  },
});

api.interceptors.request.use(config => {
  // token
  const token = localStorage.getItem('token');
  if (token) config.headers['token'] = token;

  // 生成 sign，query 为 config.params，body 为 config.data
  const sign = genSign(config.params ?? null, config.data ?? null);
  config.headers['sign'] = sign;

  return config;
});

export default api;
