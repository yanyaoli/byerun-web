/**
 * 随机数工具（不为整千数）
 */

/**
 * 返回指定范围（含）内不为 1000 的整数倍的随机整数
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomIntNonThousand(min = 1000, max = 7500) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
    throw new Error('invalid range');
  }

  const gen = () => Math.floor(Math.random() * (max - min + 1)) + min;
  let v = gen();

  if (v % 1000 !== 0) return v;

  // 调整一个小偏移（100-999），在区间内尽量避免为整千
  const offset = 100 + Math.floor(Math.random() * 900); // 100..999
  v = v + (Math.random() > 0.5 ? offset : -offset);

  if (v < min) v = min + 1;
  if (v > max) v = max - 1;

  // 最后兜底，若仍为整千数，直接 +1/-1
  if (v % 1000 === 0) {
    v = v + 1 <= max ? v + 1 : v - 1;
  }

  return v;
}

/**
 * 如果 value 恰好是 modulus 的倍数，则添加一个随机偏移量并返回新值。
 * 默认 modulus 为 1000，偏移范围可配置。
 * @param {number} value
 * @param {number} [modulus=1000]
 * @param {{min:number,max:number}} [opts={min:1,max:59}]
 * @returns {number}
 */
export function avoidMultipleOf(value, modulus = 1000, opts = { min: 1, max: 59 }) {
  let v = Number(value) || 0;
  if (modulus === 0) return v;
  if (v % modulus !== 0) return v;

  const min = opts.min ?? 1;
  const max = opts.max ?? 59;
  const span = Math.max(0, max - min + 1);
  const offset = min + Math.floor(Math.random() * span);
  return v + offset;
}
