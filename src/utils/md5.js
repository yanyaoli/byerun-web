import md5 from 'md5';

const stringToMd5 = plainText => md5(plainText).toLowerCase();

export default stringToMd5;
