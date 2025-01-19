export interface OauthToken {
  token: string;
  refreshToken: string;
}

export interface UserInfo {
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
}

export interface LoginResponse {
  code: number;
  msg: string;
  response: UserInfo & {
    oauthToken: OauthToken;
  };
}

export interface ApiResponse<T> {
  code: number;
  msg: string;
  response: T;
}

export interface Notice {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}
