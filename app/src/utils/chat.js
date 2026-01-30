/**
 * 聊天工具函数模块
 * 提供头像、表情、内容渲染等功能
 */

const API_BASE = (import.meta.env.VITE_CHAT_SERVER_BASE_URL || '').replace(/\/$/, '');

// 常量定义
const EMOJI_REGEX = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
const STICKER_PATTERN = /(&lt;|<)img\s+[^>]*?src=("|&quot;)([^"&]+)("|&quot;)[^>]*?atk-emoticon=("|&quot;)([^"&]+)("|&quot;)[^>]*?(&gt;|>)/g;
const FE0F_SUFFIX_REGEX = /fe0f$/i;
const FE0F_HYPHEN_REGEX = /-fe0f/g;

/**
 * 标准化头像 URL
 * @param {string} url - 原始 URL
 * @returns {string|null} 标准化后的 URL
 */
export function normalizeAvatarUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return API_BASE + (url.startsWith('/') ? '' : '/') + url;
}

/**
 * 获取 Emoji 的 Twemoji CDN URL
 * @param {string} code - Emoji 代码点
 * @returns {string|null} Twemoji SVG URL
 */
export function getEmojiUrl(code) {
  if (!code) return null;
  const parts = code
    .split('-')
    .map((p) => p.replace(FE0F_SUFFIX_REGEX, '').toLowerCase())
    .filter(Boolean);
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${parts.join('-')}.svg`;
}

/**
 * 将 Unicode Emoji 字符转换为代码点字符串
 * @param {string} match - 匹配到的 Emoji 字符
 * @returns {string} 代码点字符串（如 "1f600"）
 */
function emojiToCodePoints(match) {
  return Array.from(match)
    .map((c) => c.codePointAt(0).toString(16))
    .join('-')
    .replace(FE0F_HYPHEN_REGEX, '');
}

/**
 * 将 Emoji 字符替换为 Twemoji 图片标签
 * @param {string} match - 匹配到的 Emoji 字符
 * @returns {string} HTML img 标签
 */
function replaceEmojiWithImage(match) {
  const codePoints = emojiToCodePoints(match);
  return `<img src="${getEmojiUrl(codePoints)}" class="inline-block w-[1.2em] h-[1.2em] mx-0.5 align-text-bottom" alt="emoji" />`;
}

/**
 * 将转义的表情包标签还原为正常的 img 标签
 * @param {string} match - 匹配到的完整字符串
 * @param {string} l - 左括号
 * @param {string} q1 - 第一个引号
 * @param {string} src - 图片源
 * @param {string} q2 - 第二个引号
 * @param {string} q3 - 第三个引号
 * @param {string} atk - atk-emoticon 属性值
 * @returns {string} 标准化的 img 标签
 */
function normalizeStickerTag(match, l, q1, src, q2, q3, atk) {
  return `<img src="${src}" atk-emoticon="${atk}" class="atk-emoticon" loading="lazy" alt="sticker" />`;
}

/**
 * 在表情包组中查找指定 key 的表情包
 * @param {Object} stickerGroups - 表情包组对象
 * @param {string} key - 表情包 key
 * @returns {Object|null} 找到的表情包项或 null
 */
function findStickerByKey(stickerGroups, key) {
  if (!stickerGroups || Object.keys(stickerGroups).length === 0) {
    return null;
  }
  
  for (const groupId in stickerGroups) {
    const group = stickerGroups[groupId];
    if (group && group.items) {
      const item = group.items.find((i) => i.key === key);
      if (item) return item;
    }
  }
  
  return null;
}

/**
 * 渲染表情包为 HTML
 * @param {string} value - 表情包 key 或 URL
 * @param {Object} stickerGroups - 表情包组对象
 * @returns {string} HTML img 标签
 */
function renderSticker(value, stickerGroups) {
  const item = findStickerByKey(stickerGroups, value);
  if (item) {
    return `<img src="${item.val}" atk-emoticon="${item.key}" class="atk-emoticon" loading="lazy" alt="sticker" />`;
  }
  // 回退为直接使用 value 作为 src
  return `<img src="${value}" atk-emoticon="${value}" class="atk-emoticon" loading="lazy" alt="sticker" />`;
}

/**
 * 渲染图片为 HTML
 * @param {string} value - 图片 URL
 * @returns {string} HTML img 标签
 */
function renderImage(value) {
  const encodedUrl = encodeURIComponent(String(value));
  return `<img src="${API_BASE}/api/image/${encodedUrl}" class="inline-block h-12 max-w-[100px] object-cover rounded mx-1 align-middle border border-zinc-200 shadow-sm transition-transform hover:scale-105 cursor-pointer my-0.5" loading="lazy" data-viewer-image="true" alt="image" />`;
}

/**
 * 处理文本内容：替换 Emoji 和表情包标签
 * @param {string} text - 原始文本
 * @returns {string} 处理后的 HTML
 */
function processTextContent(text) {
  let html = String(text);
  
  // 处理 Unicode Emoji (Twemoji)
  html = html.replace(EMOJI_REGEX, replaceEmojiWithImage);
  
  // 处理混合在文本中的转义表情包标签
  html = html.replace(STICKER_PATTERN, normalizeStickerTag);
  
  return html;
}

/**
 * 渲染内容部分（数组元素）
 * @param {Object} part - 内容部分对象 {type, value}
 * @param {Object} stickerGroups - 表情包组对象
 * @returns {string} 渲染后的 HTML
 */
function renderContentPart(part, stickerGroups) {
  const type = part.type || 'text';
  const value = part.value || '';
  
  switch (type) {
    case 'image':
      return renderImage(value);
    case 'sticker':
      return renderSticker(value, stickerGroups);
    case 'text':
    case 'emoji':
    default:
      return processTextContent(value);
  }
}

/**
 * 渲染聊天内容为 HTML
 * 支持数组格式和字符串格式
 * @param {Array|string} content - 内容（数组或字符串）
 * @param {string} type - 内容类型（'text'|'sticker'|'emoji'）
 * @param {Object} stickerGroups - 表情包组对象
 * @returns {string} 渲染后的 HTML
 */
export function renderContent(content, type = 'text', stickerGroups = {}) {
  if (!content) return '';

  // 支持 content 为数组的情况：[{type:'text'|'image'|'sticker'|'emoji', value: '...'}, ...]
  if (Array.isArray(content)) {
    return content
      .map((part) => renderContentPart(part, stickerGroups))
      .join('');
  }

  // 兼容旧的 string + type 调用
  const html = String(content);

  // 处理表情包类型
  if (type === 'sticker') {
    const item = findStickerByKey(stickerGroups, html);
    if (item) {
      return `<img src="${item.val}" atk-emoticon="${item.key}" class="atk-emoticon" loading="lazy" alt="sticker" />`;
    }
    // 处理转义的表情包标签
    return html.replace(STICKER_PATTERN, normalizeStickerTag);
  }

  // 处理通用内容 (Text/Emoji/etc)
  return processTextContent(html);
}

/**
 * 格式化时间为 HH:MM 格式
 * @param {string|number|Date} timestamp - 时间戳或日期对象
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
