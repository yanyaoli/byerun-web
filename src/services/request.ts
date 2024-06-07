import axios from 'axios'
import generateSign from '@/utils/sign'
import { APPKEY } from '@/utils/appConfig'
import address from '@/services/address'
import { ElMessage } from "element-plus";

const instance = axios.create({
  baseURL: address.baseURL,
  timeout: 10000
})

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.token = `${token}`
  }

  config.headers.appKey = APPKEY
  config.headers['Content-Type'] = 'application/json'

  if (config.method === 'post') {
    config.headers.sign = generateSign(null, config.data || {})
  } else if (config.method === 'get' && config.params) {
    config.headers.sign = generateSign(config.params || {}, null)
  } else {
    config.headers.sign = generateSign(null, null)
  }

  return config
}, error => {
  ElMessage({
    type: "warning",
    message: "请求失败" + error.message,
  });
  return Promise.resolve();
})

instance.interceptors.response.use(
  response => {
    return response
  },
  error => {
    ElMessage({
      type: "warning",
      message: "请求失败" + error.message,
    });
    return Promise.resolve();
  }
)

export default instance
