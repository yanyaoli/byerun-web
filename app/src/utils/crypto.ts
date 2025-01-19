import md5 from "md5";

export const stringToMd5 = (plainText: string): string =>
  md5(plainText).toLowerCase();
