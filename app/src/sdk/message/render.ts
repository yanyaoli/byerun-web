import { messageSdkConfig } from './config';
import {
  findQQEmoji,
  renderQQEmojiImg,
  replaceQQEmojiInText,
} from './qqEmoji';
import type { ChatContentPart } from '@/types/domain';

const EMOJI_REGEX = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
const STICKER_PATTERN = /(&lt;|<)img\s+[^>]*?src=("|&quot;)([^"&]+)("|&quot;)[^>]*?atk-emoticon=("|&quot;)([^"&]+)("|&quot;)[^>]*?(&gt;|>)/g;

const avatarUrlCache = new Map<string | number, string>();
const getApiBase = () => messageSdkConfig.apiBaseUrl;

function escapeHtml(value: any): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeImgSrc(src: any): string {
  const s = String(src ?? '').trim();
  if (/^(https?:)?\/\//i.test(s)) return s;
  if (s.startsWith('/') && !s.startsWith('//')) return s;
  if (/^data:image\//i.test(s)) return s;
  if (/^blob:/i.test(s)) return s;
  return '#';
}

export function normalizeAvatarUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/api/avatar/')) {
    return getApiBase() + url;
  }
  return getApiBase() + (url.startsWith('/') ? '' : '/') + url;
}

export function getCachedAvatarUrl(userId?: string | number | null): string | null {
  if (!userId) return null;
  const cached = avatarUrlCache.get(userId);
  if (cached) return cached;
  const url = `${getApiBase()}/api/avatar/${encodeURIComponent(String(userId))}`;
  avatarUrlCache.set(userId, url);
  return url;
}

export function getEmojiUrl(code?: string | null): string | null {
  if (!code) return null;
  const parts = code
    .split('-')
    .map((part) => part.replace(/fe0f$/i, '').toLowerCase())
    .filter(Boolean);
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${parts.join('-')}.svg`;
}

function replaceEmojiWithImage(match: string): string {
  const code = Array.from(match)
    .map((char) => char.codePointAt(0)?.toString(16) || '')
    .join('-')
    .replace(/-fe0f/g, '');

  return `<img src="${getEmojiUrl(code)}" class="inline-block w-[1.2em] h-[1.2em] mx-0.5 align-text-bottom" alt="emoji" />`;
}

function normalizeStickerTag(_match: string, _l: string, _q1: string, src: string, _q2: string, _q3: string, atk: string): string {
  const qq = findQQEmoji(atk) || findQQEmoji(src);
  if (qq) {
    return renderQQEmojiImg(qq);
  }
  return `<img src="${escapeHtml(safeImgSrc(src))}" atk-emoticon="${escapeHtml(atk)}" class="atk-emoticon" loading="lazy" alt="sticker" />`;
}

function findStickerByKey(stickerGroups: Record<string, any>, key: string): any {
  if (!stickerGroups || typeof stickerGroups !== 'object' || Object.keys(stickerGroups).length === 0) {
    return null;
  }

  for (const group of Object.values(stickerGroups)) {
    const item = group?.items?.find((sticker: any) => sticker.key === key);
    if (item) return item;
  }

  return null;
}

function renderStickerImg(src: string, atk: string): string {
  return `<img src="${escapeHtml(safeImgSrc(src))}" atk-emoticon="${escapeHtml(atk)}" class="atk-emoticon" loading="lazy" alt="sticker" />`;
}

function renderSticker(value: string, stickerGroups?: Record<string, any>): string {
  // 1. 优先匹配 QQ 表情（支持描述如 /惊讶、[惊讶] 或 ID 如 0）
  const qq = findQQEmoji(value);
  if (qq) {
    return renderQQEmojiImg(qq);
  }

  // 2. 尝试从传入的贴纸组查找
  if (stickerGroups && typeof stickerGroups === 'object' && Object.keys(stickerGroups).length > 0) {
    const item = findStickerByKey(stickerGroups, value);
    if (item) {
      return renderStickerImg(item.val, item.key);
    }
  }

  // 3. 若为合法图片 URL，直接渲染
  if (/^(https?:)?\/\//i.test(value) || (typeof value === 'string' && (value.startsWith('/') || value.startsWith('data:')))) {
    return renderStickerImg(value, value);
  }

  // 4. 历史遗留废弃贴纸 ID 友好兜底为文本 [表情]，避免出现图片裂开破损图标
  return `<span class="inline-block text-xs px-1 py-0.5 rounded theme-card-soft theme-text-tertiary align-middle">[表情]</span>`;
}

function renderImage(value: string): string {
  return `<img src="${getApiBase()}/api/image/${encodeURIComponent(String(value))}" class="inline-block h-12 max-w-[100px] object-cover rounded mx-1 align-middle border border-zinc-200 shadow-sm transition-transform hover:scale-105 cursor-pointer my-0.5" loading="lazy" data-viewer-image="true" alt="image" />`;
}

function renderText(value: any): string {
  let str = String(value);
  // 1. 替换 QQ 表情短码（如 /惊讶, [惊讶]）
  str = replaceQQEmojiInText(str);
  // 2. 兼容历史 unicode emoji 字符 (😀) 渲染
  str = str.replace(EMOJI_REGEX, replaceEmojiWithImage);
  // 3. 规范化已有贴纸标签
  str = str.replace(STICKER_PATTERN, normalizeStickerTag);
  return str;
}

function renderContentPart(part: ChatContentPart, stickerGroups?: Record<string, any>): string {
  const type = part.type || 'text';
  const value = part.value || '';

  if (type === 'image') return renderImage(value);
  if (type === 'sticker') return renderSticker(value, stickerGroups);
  // text 已由后端转义，仅做表情/贴纸重建，不再二次转义；未知类型未经处理，转义为纯文本。
  if (type === 'text') return renderText(value);
  return escapeHtml(value);
}

export function renderContent(
  content: string | ChatContentPart[],
  type = 'text',
  stickerGroups: Record<string, any> = {},
): string {
  if (!content) return '';

  if (Array.isArray(content)) {
    return content.map((part) => renderContentPart(part, stickerGroups)).join('');
  }

  const value = String(content);
  if (type === 'sticker') {
    return renderSticker(value, stickerGroups);
  }
  if (type === 'text') return renderText(value);
  // 非 text 类型未经后端转义，按纯文本转义输出。
  return escapeHtml(value);
}

export function formatTime(timestamp: number | string | Date): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
