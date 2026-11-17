import localVersionData from '@/version.json';
import { getProxiedUrl, getActiveProxy } from './githubProxy';

export interface ReleaseAsset {
  name: string;
  size: number;
  downloadUrl: string;
  proxiedDownloadUrl: string;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  buildTime?: string;
  publishedAt?: string;
  releaseNotes?: string;
  htmlUrl?: string;
  apkAsset?: ReleaseAsset;
  ipaAsset?: ReleaseAsset;
}

const GITHUB_REPO = 'yanyaoli/byerun-web';

/**
 * 比较两个语义版本号 (v1.0.1 > v1.0.0)
 */
export function isNewerVersion(remoteVer: string, localVer: string): boolean {
  const parse = (v: string) =>
    (v || '0')
      .trim()
      .replace(/^v/, '')
      .split('.')
      .map((p) => parseInt(p, 10) || 0);

  const [rMaj = 0, rMin = 0, rPatch = 0] = parse(remoteVer);
  const [lMaj = 0, lMin = 0, lPatch = 0] = parse(localVer);

  if (rMaj !== lMaj) return rMaj > lMaj;
  if (rMin !== lMin) return rMin > lMin;
  return rPatch > lPatch;
}

/**
 * 格式化文件大小 (Bytes -> MB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

/**
 * 检查最新版本
 */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
  const currentVersion = localVersionData.version || '1.0.0';
  const buildTime = localVersionData.buildTime || '';

  try {
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          hasUpdate: false,
          currentVersion,
          latestVersion: currentVersion,
          buildTime,
          releaseNotes: '暂无在线版本发布',
        };
      }
      throw new Error(`GitHub API 响应异常: HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawTag = data.tag_name || data.name || '';
    const latestVersion = rawTag.replace(/^v/, '');
    const releaseNotes = data.body || '常规稳定性修复与性能提升';
    const publishedAt = data.published_at ? data.published_at.slice(0, 10) : '';
    const htmlUrl = data.html_url || `https://github.com/${GITHUB_REPO}/releases`;

    let apkAsset: ReleaseAsset | undefined;
    let ipaAsset: ReleaseAsset | undefined;

    if (Array.isArray(data.assets)) {
      data.assets.forEach((asset: any) => {
        const name = asset.name || '';
        const downloadUrl = asset.browser_download_url || '';
        const proxiedDownloadUrl = getProxiedUrl(downloadUrl, getActiveProxy());
        const size = asset.size || 0;

        if (name.endsWith('.apk')) {
          apkAsset = { name, size, downloadUrl, proxiedDownloadUrl };
        } else if (name.endsWith('.ipa')) {
          ipaAsset = { name, size, downloadUrl, proxiedDownloadUrl };
        }
      });
    }

    const hasUpdate = isNewerVersion(latestVersion, currentVersion);

    return {
      hasUpdate,
      currentVersion,
      latestVersion,
      buildTime,
      publishedAt,
      releaseNotes,
      htmlUrl,
      apkAsset,
      ipaAsset,
    };
  } catch (error: any) {
    console.error('检查版本更新失败:', error);
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion,
      buildTime,
      releaseNotes: error?.message || '检查更新失败，请稍后重试',
    };
  }
}

/**
 * 触发外部下载或系统浏览器打开
 */
export function openDownloadUrl(url: string): void {
  if (!url) return;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
