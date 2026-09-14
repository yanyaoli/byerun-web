import { messageSdkConfig } from './config.js';

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

function isSafeImageUrl(value) {
  const source = String(value ?? '').trim();
  if (!source) return false;

  try {
    const parsed = new URL(source, 'https://byerun.invalid');
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
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

function renderStickerImage(src, stickerKey) {
  if (!isSafeImageUrl(src)) {
    return escapeHtml(stickerKey || src);
  }

  return `<img src="${escapeHtml(src)}" atk-emoticon="${escapeHtml(stickerKey)}" class="atk-emoticon" loading="lazy" alt="sticker" />`;
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

function renderSticker(value, stickerGroups) {
  if (!stickerGroups || typeof stickerGroups !== 'object' || Object.keys(stickerGroups).length === 0) {
    return renderStickerImage(value, value);
  }

  const item = findStickerByKey(stickerGroups, value);
  if (item) {
    return renderStickerImage(item.val, item.key);
  }

  return renderStickerImage(value, value);
}

function renderImage(value) {
  const url = `${getApiBase()}/api/image/${encodeURIComponent(String(value))}`;
  return `<img src="${escapeHtml(url)}" class="inline-block h-12 max-w-[100px] object-cover rounded mx-1 align-middle border border-zinc-200 shadow-sm transition-transform hover:scale-105 cursor-pointer my-0.5" loading="lazy" data-viewer-image="true" alt="image" />`;
}

function renderPlainText(value) {
  return escapeHtml(value).replace(EMOJI_REGEX, replaceEmojiWithImage);
}

function renderText(value) {
  const source = String(value ?? '');
  const parts = [];
  let lastIndex = 0;

  for (const match of source.matchAll(STICKER_PATTERN)) {
    parts.push(renderPlainText(source.slice(lastIndex, match.index)));
    parts.push(renderStickerImage(match[3], match[6]));
    lastIndex = match.index + match[0].length;
  }

  parts.push(renderPlainText(source.slice(lastIndex)));
  return parts.join('');
}

function renderContentPart(part, stickerGroups) {
  if (!part || typeof part !== 'object') return '';

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
      return renderStickerImage(item.val, item.key);
    }
    return renderText(value);
  }

  return renderText(value);
}

export function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
