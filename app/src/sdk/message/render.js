import { messageSdkConfig } from './config';

const API_BASE = messageSdkConfig.apiBaseUrl;
const EMOJI_REGEX = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
const STICKER_PATTERN = /(&lt;|<)img\s+[^>]*?src=("|&quot;)([^"&]+)("|&quot;)[^>]*?atk-emoticon=("|&quot;)([^"&]+)("|&quot;)[^>]*?(&gt;|>)/g;

export function normalizeAvatarUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return API_BASE + (url.startsWith('/') ? '' : '/') + url;
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
  return `<img src="${src}" atk-emoticon="${atk}" class="atk-emoticon" loading="lazy" alt="sticker" />`;
}

function findStickerByKey(stickerGroups, key) {
  if (!stickerGroups || typeof stickerGroups !== 'object') return null;

  for (const group of Object.values(stickerGroups)) {
    const item = group?.items?.find((sticker) => sticker.key === key);
    if (item) return item;
  }

  return null;
}

function renderSticker(value, stickerGroups) {
  const item = findStickerByKey(stickerGroups, value);
  if (item) {
    return `<img src="${item.val}" atk-emoticon="${item.key}" class="atk-emoticon" loading="lazy" alt="sticker" />`;
  }

  return `<img src="${value}" atk-emoticon="${value}" class="atk-emoticon" loading="lazy" alt="sticker" />`;
}

function renderImage(value) {
  return `<img src="${API_BASE}/api/image/${encodeURIComponent(String(value))}" class="inline-block h-12 max-w-[100px] object-cover rounded mx-1 align-middle border border-zinc-200 shadow-sm transition-transform hover:scale-105 cursor-pointer my-0.5" loading="lazy" data-viewer-image="true" alt="image" />`;
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
  return renderText(value);
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
      return `<img src="${item.val}" atk-emoticon="${item.key}" class="atk-emoticon" loading="lazy" alt="sticker" />`;
    }
    return value.replace(STICKER_PATTERN, normalizeStickerTag);
  }

  return renderText(value);
}

export function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
