import request from '@/services/request';
import stringToMd5 from '@/utils/md5';
import address from '@/services/address';
import { APPVERSION, BRAND, DEVICETOKEN, DEVICETYPE, MOBILETYPE, SYSVERSION }  from '@/utils/appConfig';

// 登录接口
export const login = (userPhone, password) => {
  const hashedPassword = stringToMd5(password);
  const body = {
    appVersion: APPVERSION,
    brand: BRAND,
    deviceToken: DEVICETOKEN,
    deviceType: DEVICETYPE,
    mobileType: MOBILETYPE,
    password: hashedPassword,
    sysVersion: SYSVERSION,
    userPhone
  };

  return request.post(address.login, body);
};