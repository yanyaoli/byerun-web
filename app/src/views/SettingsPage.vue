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

      <!-- 2. 移动端专属：应用加速与 GitHub 代理 -->
      <section v-if="isMobile || isDesktopPreview">
        <div class="text-xs font-medium text-[var(--muted)] px-3 mb-1.5 flex items-center justify-between">
          <span>应用加速</span>
          <span v-if="!isMobile" class="text-[10px] text-[var(--muted)]/80">桌面预览可见</span>
        </div>
        <div class="bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xs">
          <!-- GitHub 加速代理入口 -->
          <button
            type="button"
            @click="router.push({ name: 'proxy-settings' })"
            class="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3 min-w-0">
              <i class="ri-flashlight-line text-lg text-[var(--muted)] shrink-0"></i>
              <span class="text-sm font-medium text-[var(--text)]">GitHub 加速代理</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-[var(--muted)] shrink-0 font-mono">
              <span>{{ activeProxyHost }}</span>
              <span
                v-if="isOfficialActive"
                class="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-sans font-medium"
              >
                官方
              </span>
              <i class="ri-arrow-right-s-line text-base text-[var(--muted)]/60"></i>
            </div>
          </button>
        </div>
      </section>

      <!-- 3. 关于信息 -->
      <section>
        <div class="text-xs font-medium text-[var(--muted)] px-3 mb-1.5">关于</div>
        <div class="bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden shadow-2xs">
          <!-- 应用版本展示条目 -->
          <div class="flex items-center justify-between px-4 py-3.5 text-sm gap-2">
            <div class="flex items-center gap-3 text-[var(--text)] font-medium shrink-0">
              <i class="ri-information-line text-lg text-[var(--muted)]"></i>
              <span>应用版本</span>
            </div>

            <!-- 检测到新版本时的对比风格与下载更新按钮 -->
            <div v-if="hasUpdate" class="flex items-center gap-1.5 flex-wrap justify-end">
              <!-- 版本号对比风格 -->
              <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                <span class="text-[var(--muted)] font-normal">v{{ currentVersion }}</span>
                <i class="ri-arrow-right-line text-[10px]"></i>
                <span class="font-bold">v{{ updateResult?.latestVersion }}</span>
              </div>

              <!-- 下载更新按钮 -->
              <button
                type="button"
                @click="showUpdateModal = true"
                class="px-2.5 py-1 text-xs font-medium rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-2xs shrink-0"
              >
                <i class="ri-download-cloud-line text-xs"></i>
                <span>下载更新</span>
              </button>

              <!-- 刷新按钮 -->
              <button
                type="button"
                :disabled="checkingUpdate"
                @click="handleManualRefresh"
                class="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--brand)] hover:bg-[var(--surface-soft)] active:scale-95 transition-all cursor-pointer shrink-0"
                title="重新检查更新"
              >
                <i :class="['text-xs', checkingUpdate ? 'ri-loader-4-line animate-spin text-[var(--brand)]' : 'ri-refresh-line']"></i>
              </button>
            </div>

            <!-- 无新版本时：显示当前版本号、已是最新版本徽标与刷新图标 -->
            <div v-else class="flex items-center gap-1.5">
              <span class="text-xs font-mono font-bold text-[var(--text)]">v{{ currentVersion }}</span>
              <!-- 已是最新版本徽标 -->
              <span class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                {{ checkingUpdate ? '检查中...' : '已是最新版本' }}
              </span>
              <!-- 刷新按钮 -->
              <button
                type="button"
                :disabled="checkingUpdate"
                @click="handleManualRefresh"
                class="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--brand)] hover:bg-[var(--surface-soft)] active:scale-95 transition-all cursor-pointer"
                title="重新检查更新"
              >
                <i :class="['text-xs', checkingUpdate ? 'ri-loader-4-line animate-spin text-[var(--brand)]' : 'ri-refresh-line']"></i>
              </button>
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
              <span class="font-mono">yanyaoli/byerun-web</span>
              <i class="ri-external-link-line text-sm text-[var(--muted)]/60"></i>
            </div>
          </a>
        </div>
      </section>

      <p class="text-center text-[11px] text-[var(--muted)] pt-1">
        由 <span class="text-rose-500">❤</span> 制作
      </p>
    </main>

    <!-- 发现新版本时的弹窗详情 -->
    <Teleport to="body">
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showUpdateModal && updateResult?.hasUpdate"
          class="fixed inset-0 z-[10000] grid place-items-center p-4"
          style="background-color: rgba(0, 0, 0, 0.45); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);"
          @click.self="showUpdateModal = false"
        >
          <div
            class="w-full max-w-[340px] max-h-[85vh] rounded-2xl p-5 border border-[var(--border)] shadow-2xl flex flex-col gap-3.5 overflow-hidden"
            :style="{ backgroundColor: isDark ? '#18181b' : '#ffffff' }"
          >
            <!-- 弹窗标题与对比版本 -->
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="text-sm font-bold text-[var(--text)]">发现新版本</h3>
                <div class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
                  <span class="text-[var(--muted)] font-normal">v{{ currentVersion }}</span>
                  <i class="ri-arrow-right-line text-[10px]"></i>
                  <span class="font-bold">v{{ updateResult.latestVersion }}</span>
                </div>
              </div>
              <span v-if="updateResult.publishedAt" class="text-[10px] text-[var(--muted)] shrink-0 pt-0.5 font-mono">
                {{ updateResult.publishedAt }}
              </span>
            </div>

            <!-- 更新日志内容 -->
            <div class="bg-[var(--surface-soft)] rounded-xl p-3 max-h-48 overflow-y-auto border border-[var(--border)]/60 text-left">
              <div class="text-[11px] font-medium text-[var(--muted)] mb-1">更新日志：</div>
              <p class="text-xs text-[var(--text)] whitespace-pre-line leading-relaxed">
                {{ updateResult.releaseNotes || '常规稳定性修复与性能提升' }}
              </p>
            </div>

            <!-- 下载渠道按钮组 -->
            <div class="space-y-2 pt-1">
              <button
                v-if="updateResult.apkAsset"
                type="button"
                @click="handleDownload(updateResult.apkAsset.proxiedDownloadUrl)"
                class="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-xs"
              >
                <i class="ri-android-line text-sm"></i>
                <span>下载 Android 安装包 ({{ formatFileSize(updateResult.apkAsset.size) }})</span>
              </button>

              <button
                v-if="updateResult.ipaAsset"
                type="button"
                @click="handleDownload(updateResult.ipaAsset.proxiedDownloadUrl)"
                class="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-xs"
              >
                <i class="ri-apple-line text-sm"></i>
                <span>下载 iOS 安装包 ({{ formatFileSize(updateResult.ipaAsset.size) }})</span>
              </button>

              <button
                v-if="!updateResult.apkAsset && !updateResult.ipaAsset && updateResult.htmlUrl"
                type="button"
                @click="handleDownload(updateResult.htmlUrl)"
                class="w-full py-2.5 px-3 rounded-xl bg-[var(--brand)] hover:opacity-90 text-white font-medium text-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-xs"
              >
                <i class="ri-github-line text-sm"></i>
                <span>前往 GitHub Releases 下载</span>
              </button>
            </div>

            <!-- 底部代理说明与关闭 -->
            <div class="flex items-center justify-between pt-1 border-t border-[var(--border)] text-[10px] text-[var(--muted)]">
              <span>通过当前 GitHub 代理加速</span>
              <button
                type="button"
                class="px-2 py-1 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                @click="showUpdateModal = false"
              >
                稍后再说
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import { useThemeStore } from '@/composables/useTheme';
import { useServerConfig } from '@/composables/useServerConfig';
import { useMessage } from '@/composables/useMessage';
import { useAppUpdate } from '@/composables/useAppUpdate';
import { getActiveProxy, isOfficialProxy } from '@/services/githubProxy';

const router = useRouter();
const themeStore = useThemeStore();
const { showMessage } = useMessage();
const { sourceType, isFallbackActive } = useServerConfig();

const {
  hasUpdate,
  checkingUpdate,
  updateResult,
  currentVersion,
  checkUpdate,
  formatFileSize,
  openDownloadUrl,
} = useAppUpdate();

const showUpdateModal = ref(false);
const activeProxy = ref(getActiveProxy());

// 移动端环境检测（原生 Capacitor 应用、手机 UA、或屏幕宽度 <= 768px）
const isMobile = ref(false);
const isDesktopPreview = ref(true); // 桌面开发模式下也保持预览展示以便审查设计

const isDark = computed(() => themeStore.isDark);
const isOfficialActive = computed(() => isOfficialProxy(activeProxy.value));

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

const handleDownload = (url: string) => {
  if (!url) return;
  openDownloadUrl(url);
  showMessage('正在跳转加速下载通道...', 'info');
};

const handleManualRefresh = async () => {
  if (checkingUpdate.value) return;
  try {
    const res = await checkUpdate(true);
    if (res?.hasUpdate) {
      showMessage(`发现新版本: v${res.latestVersion}`, 'success');
    } else {
      showMessage(`当前已是最新版本 (v${currentVersion.value})`, 'info');
    }
  } catch {
    showMessage('检查更新失败，请稍后重试', 'error');
  }
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

  // 若尚未获取更新数据，在进入设置页时触发一次获取
  if (!updateResult.value) {
    checkUpdate();
  }
});
</script>
