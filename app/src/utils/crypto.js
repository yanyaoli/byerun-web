import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || 'unirun_secure_key_12345';

/**
 * 加密数据
 * @param {any} data 要加密的数据
 * @returns {string|null} 加密后的字符串
 */
export const encrypt = (data) => {
  try {
    const jsonStr = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonStr, SECRET_KEY).toString();
  } catch (e) {
    console.error('Encryption failed:', e);
    return null;
  }
};

/**
 * 解密数据
 * @param {string} ciphertext 加密字符串
 * @returns {any|null} 解密后的原始数据
 */
export const decrypt = (ciphertext) => {
  try {
    if (!ciphertext) return null;
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    // 增加编码配置，确保解密结果为空时不会抛出 UTF-8 错误
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (!originalText) {
      console.warn('解密失败');
      return null;
    }
    return JSON.parse(originalText.trim());
  } catch (e) {
    return null;
  }
};
