import request from '@/services/request';
import stringToMd5 from '@/utils/md5';
import address from '@/services/address';
import { APPVERSION, BRAND, DEVICETOKEN, DEVICETYPE, MOBILETYPE, SYSVERSION } from '@/utils/appConfig';

interface OauthToken {
  token: string;
  refreshToken: string;
}

interface LoginSuccessRes {
  code: number;
  msg: string;
  response: {
    oauthToken: OauthToken;
    userId: number;
    studentId: number;
    registerCode: string;
    studentName: string;
    gender: string;
    schoolId: number;
    schoolName: string;
    classId: number;
    studentClass: number;
    className: string;
    startSchool: number;
    collegeCode: string;
    collegeName: string;
    majorCode: string;
    majorName: string;
    nationCode: string;
    birthday: string;
    idCardNo: string;
    addrDetail: string;
    studentSource: string;
    userVerifyStatus: string;
  };
}

interface LoginErrorRes {
  code: number;
  msg: string;
  response: null;
}

// 登录
export const login = (userPhone:number, password:string) => {
  const hashedPassword = stringToMd5(password);
  const body = {
    'appVersion': APPVERSION,
    'brand': BRAND,
    'deviceToken': DEVICETOKEN,
    'deviceType': DEVICETYPE,
    'mobileType': MOBILETYPE,
    'password': hashedPassword,
    'sysVersion': SYSVERSION,
    'userPhone': userPhone
  };

  return request.post(address.login, body);
};

// 获取验证码
export const sendSms = (phoneNum:number) => request.get(address.sendSms, {
  params: {
    phoneNum
  }
});

// 更新密码
export const updatePassword = (phoneNum:number, newPassword:string, smsCode:number) => {
  const hashedPassword = stringToMd5(newPassword);
  const body = {
    'password': hashedPassword,
    'passwordRes': hashedPassword,
    'userPhone': phoneNum,
    'code': smsCode,
  };

  return request.post(address.updatePassword, body);
}
