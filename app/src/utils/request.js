import axios from 'axios';
import { genSign } from './sign.js';
import { appConfig } from './config.js';

const req = axios.create({
  baseURL: appConfig.api.baseUrl,
  timeout: 15000,
  headers: {
    appKey: appConfig.auth.appKey,
    'Content-Type': 'application/json',
  },
});

req.interceptors.request.use(config => {
  // token
  const token = localStorage.getItem('token');
  if (token) config.headers['token'] = token;

  // 生成 sign，query 为 config.params，body 为 config.data
  const sign = genSign(config.params ?? null, config.data ?? null);
  config.headers['sign'] = sign;

  return config;
});

export default req;