import { avoidMultipleOf } from '@/utils/random';

/**
 * 根据里程估算时长（6-10 分/公里随机），并确保秒数不会是 modulus 的倍数以避免“整千数”
 * 返回值为分钟数（保留一位小数）
 * @param {number} distanceMeters
 * @returns {number}
 */
export function computeDurationFromDistance(distanceMeters) {
  const dist = Number(distanceMeters);
  if (!Number.isFinite(dist) || dist <= 0) return 0;
  const paceMinPerKm = 6 + Math.random() * 4; // 6-10

  // 先按分钟估算，然后转为秒再调整，避免秒数恰好为 1000 的倍数（例如 3000s）
  const minutesEst = (dist / 1000) * paceMinPerKm;
  let seconds = Math.round(minutesEst * 60);

  // 如果秒数是 modulus 的倍数，添加一个小的偏移以避免“整千数”情况
  if (seconds % 1000 === 0) {
    seconds = avoidMultipleOf(seconds, 1000, { min: 5, max: 59 });
  }

  // 返回以分钟为单位的值（保留一位小数），既能用于内部计算也能避免总是返回整分钟
  return Number((Math.max(1, seconds / 60)).toFixed(1));
}

/**
 * 校验配速是否在允许范围内（单位：分钟/公里）
 * - 当 distance 或 duration 为 0/无效时，返回 true（允许提交）
 * @param {number} distanceMeters
 * @param {number} durationMinutes
 * @param {{min:number,max:number}} [opts={min:6,max:10}]
 * @returns {boolean}
 */
export function isPaceWithinLimits(distanceMeters, durationMinutes, opts = { min: 6, max: 10 }) {
  const distance = Number(distanceMeters);
  const duration = Number(durationMinutes);
  const min = opts.min ?? 6;
  const max = opts.max ?? 10;

  if (!distance || !duration) return true; // 没有填写时允许提交

  const pace = duration / (distance / 1000);
  if (isNaN(pace) || !isFinite(pace)) return true;

  return !(pace < min || pace > max);
}
