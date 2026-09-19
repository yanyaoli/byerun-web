import { messageSdkConfig } from './config';

const EMOJI_REGEX = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
const STICKER_PATTERN = /(&lt;|<)img\s+[^>]*?src=("|&quot;)([^"&]+)("|&quot;)[^>]*?atk-emoticon=("|&quot;)([^"&]+)("|&quot;)[^>]*?(&gt;|>)/g;

const avatarUrlCache = new Map();
const getApiBase = () => messageSdkConfig.apiBaseUrl;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeImgSrc(src) {
  const s = String(src ?? '').trim();
  if (/^(https?:)?\/\//i.test(s)) return s;
  if (s.startsWith('/') && !s.startsWith('//')) return s;
  if (/^data:image\//i.test(s)) return s;
  if (/^blob:/i.test(s)) return s;
  return '#';
}

export function normalizeAvatarUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/api/avatar/')) {
    return getApiBase() + url;
  }
  return getApiBase() + (url.startsWith('/') ? '' : '/') + url;
}

export function getCachedAvatarUrl(userId) {
  if (!userId) return null;
  const cached = avatarUrlCache.get(userId);
  if (cached) return cached;
  const url = `${getApiBase()}/api/avatar/${encodeURIComponent(String(userId))}`;
  avatarUrlCache.set(userId, url);
  return url;
}

export function getEmojiUrl(code) {
  if (!code) return null;
  const parts = code
    .split('-')
    .map((part) => part.replace(/fe0f$/i, '').toLowerCase())
    .filter(Boolean);
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${parts.join('-')}.svg`;
}

function replaceEmojiWithImage(match) {
  const code = Array.from(match)
    .map((char) => char.codePointAt(0).toString(16))
    .join('-')
    .replace(/-fe0f/g, '');

  return `<img src="${getEmojiUrl(code)}" class="inline-block w-[1.2em] h-[1.2em] mx-0.5 align-text-bottom" alt="emoji" />`;
}

function normalizeStickerTag(match, l, q1, src, q2, q3, atk) {
  return `<img src="${escapeHtml(safeImgSrc(src))}" atk-emoticon="${escapeHtml(atk)}" class="atk-emoticon" loading="lazy" alt="sticker" />`;
}

function findStickerByKey(stickerGroups, key) {
  if (!stickerGroups || typeof stickerGroups !== 'object' || Object.keys(stickerGroups).length === 0) {
    return null;
  }

  for (const group of Object.values(stickerGroups)) {
    const item = group?.items?.find((sticker) => sticker.key === key);
    if (item) return item;
  }

  return null;
}

function renderStickerImg(src, atk) {
  return `<img src="${escapeHtml(safeImgSrc(src))}" atk-emoticon="${escapeHtml(atk)}" class="atk-emoticon" loading="lazy" alt="sticker" />`;
}

function renderSticker(value, stickerGroups) {
  if (!stickerGroups || typeof stickerGroups !== 'object' || Object.keys(stickerGroups).length === 0) {
    return renderStickerImg(value, value);
  }

  const item = findStickerByKey(stickerGroups, value);
  if (item) {
    return renderStickerImg(item.val, item.key);
  }

  return renderStickerImg(value, value);
}

function renderImage(value) {
  return `<img src="${getApiBase()}/api/image/${encodeURIComponent(String(value))}" class="inline-block h-12 max-w-[100px] object-cover rounded mx-1 align-middle border border-zinc-200 shadow-sm transition-transform hover:scale-105 cursor-pointer my-0.5" loading="lazy" data-viewer-image="true" alt="image" />`;
}

function renderText(value) {
  return String(value)
    .replace(EMOJI_REGEX, replaceEmojiWithImage)
    .replace(STICKER_PATTERN, normalizeStickerTag);
}

function renderContentPart(part, stickerGroups) {
  const type = part.type || 'text';
  const value = part.value || '';

  if (type === 'image') return renderImage(value);
  if (type === 'sticker') return renderSticker(value, stickerGroups);
  // text 已由后端转义，仅做表情/贴纸重建，不再二次转义；未知类型未经处理，转义为纯文本。
  if (type === 'text') return renderText(value);
  return escapeHtml(value);
}

export function renderContent(content, type = 'text', stickerGroups = {}) {
  if (!content) return '';

  if (Array.isArray(content)) {
    return content.map((part) => renderContentPart(part, stickerGroups)).join('');
  }

  const value = String(content);
  if (type === 'sticker') {
    const item = findStickerByKey(stickerGroups, value);
    if (item) {
      return renderStickerImg(item.val, item.key);
    }
    return value.replace(STICKER_PATTERN, normalizeStickerTag);
  }
  if (type === 'text') return renderText(value);
  // 非 text 类型未经后端转义，按纯文本转义输出。
  return escapeHtml(value);
}

export function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
