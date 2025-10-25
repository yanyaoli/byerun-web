import { MD5 } from 'crypto-js';
import { config } from './config';

export function genSign(query = null, body = null) {
  const appKey = config.api.appKey;
  const appSecret = config.api.appSecret;
  let signStr = "";
  // 处理查询参数
  if (query !== null) {
    const normalizedQuery = Object.entries(query).reduce((acc, [key, value]) => {
      acc[key] = value === null ? "" : String(value);
      return acc;
    }, {});
    const sortedKeys = Object.keys(normalizedQuery).sort();
    for (const key of sortedKeys) {
      const value = normalizedQuery[key];
      if (value !== "") {
        signStr += key + value;
      }
    }
  }
  // 添加 APPKEY 和 APPSECRET
  signStr += appKey;
  signStr += appSecret;
  // 添加请求体
  if (body !== null) {
    signStr += JSON.stringify(body);
  }
  // 处理特殊字符
  let replaced = false;
  const specialChars = [" ", "~", "!", "(", ")", "'"];
  for (const ch of specialChars) {
    if (signStr.includes(ch)) {
      signStr = signStr.replace(new RegExp(ch, "g"), "");
      replaced = true;
    }
  }
  if (replaced) {
    signStr = encodeURIComponent(signStr);
  }
  // 生成 MD5 签名
  let sign = MD5(signStr).toString().toUpperCase();
  if (replaced) {
    sign += "encodeutf8";
  }
  return sign;
}