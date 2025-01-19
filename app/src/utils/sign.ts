import { config } from "@/config";
import CryptoJS from "crypto-js";

interface QueryBody {
  [key: string]: string | number | null;
}

export function generateSign(
  query: QueryBody | null = null,
  body: QueryBody | null = null
): string {
  let signStr = "";
  
  // 处理查询参数
  if (query !== null) {
    // 确保所有值都转换为字符串
    const normalizedQuery = Object.entries(query).reduce((acc, [key, value]) => {
      acc[key] = value === null ? "" : String(value);
      return acc;
    }, {} as Record<string, string>);

    // 按键排序并构建签名字符串
    const sortedKeys = Object.keys(normalizedQuery).sort();
    for (const key of sortedKeys) {
      const value = normalizedQuery[key];
      if (value !== "") {
        signStr += key + value;
      }
    }
  }

  // 添加 APPKEY 和 APPSECRET
  signStr += config.api.appKey;
  signStr += config.api.appSecret;

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
  let sign = CryptoJS.MD5(signStr).toString().toUpperCase();

  if (replaced) {
    sign += "encodeutf8";
  }

  return sign;
}