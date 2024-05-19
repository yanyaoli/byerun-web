import { APPKEY, APPSECRET } from './appConfig';
import CryptoJS from 'crypto-js';

function generateSign(query = null, body = null) {
    let signStr = "";
    if (query !== null) {
        let sortedQuery = Object.keys(query).sort().reduce((result, key) => {
            result[key] = query[key];
            return result;
        }, {});
        for (let key in sortedQuery) {
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
    for (let ch of [" ", "~", "!", "(", ")", "'"]) {
        if (signStr.includes(ch)) {
            signStr = signStr.replace(new RegExp(ch, 'g'), "");
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
