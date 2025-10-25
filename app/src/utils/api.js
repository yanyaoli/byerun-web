import axios from 'axios';
import { genSign } from './sign.js';
import { config } from './config.js';

const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    appKey: config.api.appKey,
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