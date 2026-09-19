// 只清理命名空间之外、已确认废弃的历史键（旧贴纸缓存，原 clearLegacyStickerCache 的职责）。
// 不做白名单式前缀裁剪：其它应用共存的键、以及 byerun/unirun 命名空间下的历史键一律不动。

const LEGACY_DELETE_KEYS = [
  'chat_stickers_cache',
  'chat_stickers_hash',
  'chat_sticker_version',
];

export function syncStorageKeys() {
  if (typeof window === 'undefined') return;
  if (typeof localStorage === 'undefined') return;

  try {
    LEGACY_DELETE_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // 隐私模式或配额异常时静默跳过
  }
}
