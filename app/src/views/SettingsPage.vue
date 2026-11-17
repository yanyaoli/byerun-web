<template>
  <div
    class="min-h-full h-full flex flex-col bg-[var(--canvas)] text-[var(--text)] select-none theme-transition overflow-y-auto"
    :style="{ paddingBottom: 'calc(var(--sab, env(safe-area-inset-bottom, 0px)) + 24px)' }"
  >
    <!-- 顶部返回导航栏（适配移动端状态栏安全区） -->
    <header
      class="sticky top-0 z-30 w-full px-3 flex items-center justify-between border-b border-[var(--border)] bg-[var(--canvas)]/90 backdrop-blur-md shrink-0"
      :style="{
        paddingTop: 'var(--sat, env(safe-area-inset-top, 0px))',
        height: 'calc(var(--sat, env(safe-area-inset-top, 0px)) + 48px)',
      }"
    >
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="goBack"
          class="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text)] hover:bg-[var(--surface-soft)] active:scale-95 transition-all cursor-pointer"
          aria-label="返回上一页"
        >
          <i class="ri-arrow-left-line text-lg"></i>
        </button>
        <h1 class="text-sm font-bold text-[var(--text)]">系统设置</h1>
      </div>
    </header>

    <!-- 主体设置选项（扁平化平铺） -->
    <main class="flex-1 w-full max-w-md mx-auto px-4 py-4 space-y-5">
      <!-- 1. 系统偏好设置 -->
      <section>
        <div class="text-xs font-medium text-[var(--muted)] px-3 mb-1.5">系统偏好</div>
        <div class="bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden shadow-2xs">
          <!-- 外观主题二级子页面入口 -->
          <button
            type="button"
            @click="router.push({ name: 'appearance-settings' })"
            class="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3 min-w-0">
              <i class="ri-palette-line text-lg text-[var(--muted)] shrink-0"></i>
              <span class="text-sm font-medium text-[var(--text)]">外观主题</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-[var(--muted)] shrink-0">
              <span>{{ themeLabel }}</span>
              <i class="ri-arrow-right-s-line text-base text-[var(--muted)]/60"></i>
            </div>
          </button>

          <!-- 服务器配置二级子页面入口 -->
          <button
            type="button"
            @click="router.push({ name: 'server-settings' })"
            class="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3 min-w-0">
              <i class="ri-server-line text-lg text-[var(--muted)] shrink-0"></i>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-medium text-[var(--text)]">服务器配置</span>
                <span
                  v-if="isFallbackActive"
                  class="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium"
                >
                  已回退官方源
                </span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-[var(--muted)] shrink-0">
              <span>{{ serverLabel }}</span>
              <i class="ri-arrow-right-s-line text-base text-[var(--muted)]/60"></i>
            </div>
          </button>
        </div>
      </section>

      <!-- 2. 移动端专属：应用更新与 GitHub 代理 -->
      <section v-if="isMobile || isDesktopPreview">
        <div class="text-xs font-medium text-[var(--muted)] px-3 mb-1.5 flex items-center justify-between">
          <span>应用更新与加速</span>
          <span v-if="!isMobile" class="text-[10px] text-[var(--muted)]/80">桌面预览可见</span>
        </div>
        <div class="bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden shadow-2xs">
          <!-- GitHub 加速代理入口 -->
          <button
            type="button"
            @click="router.push({ name: 'proxy-settings' })"
            class="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3 min-w-0">
              <i class="ri-flashlight-line text-lg text-amber-500 shrink-0"></i>
              <div class="min-w-0">
                <span class="text-sm font-medium text-[var(--text)] block">GitHub 加速代理</span>
                <span class="text-[11px] text-[var(--muted)] truncate block">安装包高速分发与更新通道</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-[var(--muted)] shrink-0 font-mono">
              <span>{{ activeProxyHost }}</span>
              <i class="ri-arrow-right-s-line text-base text-[var(--muted)]/60"></i>
            </div>
          </button>

          <!-- 检查版本更新条目 -->
          <div class="p-4 space-y-3">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-3 min-w-0">
                <i class="ri-refresh-line text-lg text-[var(--brand)] shrink-0"></i>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-[var(--text)]">版本更新</span>
                    <span
                      v-if="updateResult?.hasUpdate"
                      class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold animate-pulse"
                    >
                      可更新至 v{{ updateResult.latestVersion }}
                    </span>
                  </div>
                  <span class="text-[11px] text-[var(--muted)]">
                    当前版本: v{{ currentVersion }}
                  </span>
                </div>
              </div>

              <!-- 检查更新按钮 -->
              <button
                type="button"
                :disabled="checkingUpdate"
                @click="handleCheckUpdate"
                class="px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--border)] hover:bg-[var(--surface-soft)] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <i :class="['text-xs', checkingUpdate ? 'ri-loader-4-line animate-spin' : 'ri-search-line']"></i>
                <span>{{ checkingUpdate ? '检查中...' : '检查更新' }}</span>
              </button>
            </div>

            <!-- 检测到新版本时的平铺卡片 -->
            <div
              v-if="updateResult?.hasUpdate"
              class="p-3 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2.5 text-xs"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-[var(--text)]">
                  发现新版本 v{{ updateResult.latestVersion }}
                </span>
                <span v-if="updateResult.publishedAt" class="text-[10px] text-[var(--muted)]">
                  发布于 {{ updateResult.publishedAt }}
                </span>
              </div>

              <p class="text-[11px] text-[var(--muted)] whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto">
                {{ updateResult.releaseNotes }}
              </p>

              <!-- 下载按钮组 -->
              <div class="pt-1 flex flex-wrap gap-2">
                <button
                  v-if="updateResult.apkAsset"
                  type="button"
                  @click="handleDownload(updateResult.apkAsset.proxiedDownloadUrl)"
                  class="flex-1 min-w-[120px] px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <i class="ri-android-line text-sm"></i>
                  <span>下载 Android APK ({{ formatFileSize(updateResult.apkAsset.size) }})</span>
                </button>

                <button
                  v-if="updateResult.ipaAsset"
                  type="button"
                  @click="handleDownload(updateResult.ipaAsset.proxiedDownloadUrl)"
                  class="flex-1 min-w-[120px] px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <i class="ri-apple-line text-sm"></i>
                  <span>下载 iOS IPA ({{ formatFileSize(updateResult.ipaAsset.size) }})</span>
                </button>
              </div>

              <div class="text-[10px] text-[var(--muted)] flex items-center justify-between pt-0.5">
                <span>下载通过当前 GitHub 代理加速</span>
                <a
                  v-if="updateResult.htmlUrl"
                  :href="updateResult.htmlUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[var(--brand)] hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Releases 详情</span>
                  <i class="ri-external-link-line text-[10px]"></i>
                </a>
              </div>
            </div>

            <!-- 已是最新版提示 -->
            <div
              v-else-if="hasChecked && !updateResult?.hasUpdate"
              class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5"
            >
              <i class="ri-checkbox-circle-line text-sm shrink-0"></i>
              <span>当前已是最新版本 (v{{ currentVersion }})</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. 关于信息 -->
      <section>
        <div class="text-xs font-medium text-[var(--muted)] px-3 mb-1.5">关于</div>
        <div class="bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden shadow-2xs">
          <div class="flex items-center justify-between px-4 py-3.5 text-sm">
            <div class="flex items-center gap-3 text-[var(--text)] font-medium">
              <i class="ri-information-line text-lg text-[var(--muted)]"></i>
              <span>应用版本</span>
            </div>
            <div class="text-right">
              <div class="text-xs font-mono font-bold text-[var(--text)]">v{{ currentVersion }}</div>
              <div v-if="buildTime" class="text-[10px] font-mono text-[var(--muted)]">{{ buildTime }}</div>
            </div>
          </div>

          <a
            href="https://github.com/yanyaoli/byerun-web"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3 text-[var(--text)] font-medium text-sm">
              <i class="ri-github-line text-lg text-[var(--muted)]"></i>
              <span>开源代码库</span>
            </div>
            <div class="flex items-center gap-1 text-xs text-[var(--muted)]">
              <span>GitHub</span>
              <i class="ri-external-link-line text-sm text-[var(--muted)]/60"></i>
            </div>
          </a>
        </div>
      </section>

      <p class="text-center text-[11px] text-[var(--muted)] pt-1">
        免费开源 · 校园跑步与生活生存工具
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import { useThemeStore } from '@/composables/useTheme';
import { useServerConfig } from '@/composables/useServerConfig';
import { useMessage } from '@/composables/useMessage';
import versionData from '@/version.json';
import { getActiveProxy } from '@/services/githubProxy';
import {
  checkForUpdate,
  formatFileSize,
  openDownloadUrl,
  type UpdateCheckResult,
} from '@/services/updateService';

const router = useRouter();
const themeStore = useThemeStore();
const { showMessage } = useMessage();
const { sourceType, isFallbackActive } = useServerConfig();

const currentVersion = ref(versionData.version || '1.0.0');
const buildTime = ref(versionData.buildTime || '');

const checkingUpdate = ref(false);
const hasChecked = ref(false);
const updateResult = ref<UpdateCheckResult | null>(null);
const activeProxy = ref(getActiveProxy());

// 移动端环境检测（原生 Capacitor 应用、手机 UA、或屏幕宽度 <= 768px）
const isMobile = ref(false);
const isDesktopPreview = ref(true); // 桌面开发模式下也保持预览展示以便审查设计

const activeProxyHost = computed(() => {
  return activeProxy.value.replace(/^https?:\/\//, '').replace(/\/$/, '');
});

const themeLabel = computed(() => {
  if (themeStore.preference === 'auto') return '自动';
  if (themeStore.preference === 'dark') return '深色';
  return '浅色';
});

const serverLabel = computed(() => {
  if (isFallbackActive.value) return '已回退官方源';
  if (sourceType.value === 'proxy') return '代理源';
  if (sourceType.value === 'official') return '官方源';
  return '自定义源';
});

const handleCheckUpdate = async () => {
  checkingUpdate.value = true;
  hasChecked.value = false;
  try {
    const res = await checkForUpdate();
    updateResult.value = res;
    hasChecked.value = true;
    if (res.hasUpdate) {
      showMessage(`发现新版本: v${res.latestVersion}`, 'success');
    } else {
      showMessage(`当前已是最新版本 (v${currentVersion.value})`, 'info');
    }
  } catch (e: any) {
    showMessage('检查更新失败，请检查网络连接', 'error');
  } finally {
    checkingUpdate.value = false;
  }
};

const handleDownload = (url: string) => {
  if (!url) return;
  openDownloadUrl(url);
  showMessage('正在跳转加速下载通道...', 'info');
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: 'home' });
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    isMobile.value =
      Capacitor.isNativePlatform() ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      window.innerWidth <= 768;
  }
  activeProxy.value = getActiveProxy();
});
</script>
