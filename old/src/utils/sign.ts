import { APPKEY, APPSECRET } from "./appConfig";
import CryptoJS from "crypto-js";

interface QueryBody {
  [key: string]: string | number | null;
}

function generateSign(
  query: QueryBody | null = null,
  body: QueryBody | null = null
): string {
  let signStr = "";
  if (query !== null) {
    const sortedQuery = Object.keys(query)
      .sort()
      .reduce((result: QueryBody, key) => {
        result[key] = query[key];
        return result;
      }, {} as QueryBody);
    for (const key in sortedQuery) {
      if (sortedQuery[key] !== null) {
        signStr += key + sortedQuery[key];
      }
    }
  }
  signStr += APPKEY;
  signStr += APPSECRET;
  if (body !== null) {
    signStr += JSON.stringify(body);
  }

  let replaced = false;
  for (const ch of [" ", "~", "!", "(", ")", "'"]) {
    if (signStr.includes(ch)) {
      signStr = signStr.replace(new RegExp(ch, "g"), "");
      replaced = true;
    }
  }

  if (replaced) {
    signStr = encodeURIComponent(signStr);
  }

  let sign = CryptoJS.MD5(signStr).toString().toUpperCase();

  if (replaced) {
    sign += "encodeutf8";
  }

  return sign;
}

export default generateSign;
