import { ref, computed } from 'vue';
import localData from '@/assets/data/qq_emoji.json';

const QQ_EMOJI_INDEX_URL = 'https://koishi.js.org/QFace/assets/qq_emoji/_index.json';
const ASSET_BASE = 'https://koishi.js.org/QFace/';

// 格式化解析单条数据
function parseItems(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .filter((item) => item && item.assets && item.assets.length > 0)
    .map((item) => {
      const apngAsset = item.assets.find((a) => a.type === 2 && a.path);
      const pngAsset = item.assets.find((a) => a.type === 0 && a.path);
      const asset = apngAsset || pngAsset || item.assets[0];
      const src = asset && asset.path
        ? (asset.path.startsWith('http') ? asset.path : `${ASSET_BASE}${asset.path}`)
        : '';
      const staticSrc = pngAsset && pngAsset.path
        ? (pngAsset.path.startsWith('http') ? pngAsset.path : `${ASSET_BASE}${pngAsset.path}`)
        : src;
      const describe = String(item.describe || '').trim();
      const cleanName = describe.replace(/^[\/\[]|\]$/g, '');
      return {
        id: String(item.emojiId),
        describe,
        cleanName,
        src,
        staticSrc,
        isHide: Boolean(item.isHide),
      };
    })
    .filter((item) => Boolean(item.src));
}

export const qqEmojiList = ref(parseItems(localData));
export const visibleQQEmojiList = computed(() => qqEmojiList.value.filter((item) => !item.isHide));

const mapByDescribe = new Map();
const mapById = new Map();
const mapByUrl = new Map();
let qqEmojiRegex = null;

function buildIndexes() {
  mapByDescribe.clear();
  mapById.clear();
  mapByUrl.clear();

  const describePatterns = [];

  qqEmojiList.value.forEach((item) => {
    mapById.set(item.id, item);
    mapById.set(`qq_${item.id}`, item);

    if (item.src) mapByUrl.set(item.src, item);
    if (item.staticSrc) mapByUrl.set(item.staticSrc, item);

    if (item.describe) {
      mapByDescribe.set(item.describe, item);
      describePatterns.push(escapeRegex(item.describe));

      if (item.cleanName) {
        mapByDescribe.set(`[${item.cleanName}]`, item);
        mapByDescribe.set(item.cleanName, item);
        describePatterns.push(escapeRegex(`[${item.cleanName}]`));
      }
    }
  });

  if (describePatterns.length > 0) {
    // 按长度倒序，优先匹配较长的标识符
    describePatterns.sort((a, b) => b.length - a.length);
    qqEmojiRegex = new RegExp(`(${describePatterns.join('|')})`, 'g');
  } else {
    qqEmojiRegex = null;
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

buildIndexes();

/**
 * 根据标识符、描述或 URL 查找 QQ 表情
 */
export function findQQEmoji(key) {
  if (!key) return null;
  const k = String(key).trim();
  return (
    mapByDescribe.get(k) ||
    mapById.get(k) ||
    mapByUrl.get(k) ||
    mapByDescribe.get(`/${k}`) ||
    mapByDescribe.get(`[${k}]`) ||
    null
  );
}

/**
 * 渲染单个 QQ 表情 <img> 标签
 */
export function renderQQEmojiImg(item) {
  if (!item) return '';
  return `<img src="${item.src}" alt="${item.describe}" atk-emoticon="${item.describe}" class="atk-emoticon qq-emoji inline-block align-middle" style="height: 1.5em; width: 1.5em; margin: 0 1px; vertical-align: middle;" loading="lazy" />`;
}

/**
 * 替换纯文本中的 QQ 表情标记（如 /惊讶 或 [惊讶]）
 */
export function replaceQQEmojiInText(text) {
  if (!text || !qqEmojiRegex) return text;
  return text.replace(qqEmojiRegex, (match) => {
    const item = findQQEmoji(match);
    return item ? renderQQEmojiImg(item) : match;
  });
}

let remoteFetched = false;
let fetchPromise = null;

/**
 * 异步从官方 URL 加载并刷新最新 QQ 表情清单（会话级缓存，绝不重复请求）
 */
export async function loadRemoteQQEmojis(force = false) {
  if (remoteFetched && !force) return true;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const cacheKey = 'qq_emoji_synced';
      if (!force && typeof window !== 'undefined' && window.sessionStorage?.getItem(cacheKey)) {
        remoteFetched = true;
        return true;
      }

      const resp = await fetch(QQ_EMOJI_INDEX_URL);
      if (!resp.ok) return false;
      const remoteData = await resp.json();
      const parsed = parseItems(remoteData);
      if (parsed.length > 0) {
        qqEmojiList.value = parsed;
        buildIndexes();
        remoteFetched = true;
        try {
          window.sessionStorage?.setItem(cacheKey, '1');
        } catch (_) {}
        return true;
      }
    } catch (err) {
      console.warn('[QQEmoji] 加载远程表情数据失败，使用内置 fallback:', err);
    } finally {
      fetchPromise = null;
    }
    return false;
  })();

  return fetchPromise;
}
