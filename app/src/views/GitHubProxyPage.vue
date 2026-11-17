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
          aria-label="返回系统设置"
        >
          <i class="ri-arrow-left-line text-lg"></i>
        </button>
        <h1 class="text-sm font-bold text-[var(--text)]">GitHub 加速代理</h1>
      </div>
      <div class="flex items-center gap-1">
        <button
          type="button"
          @click="probeAll"
          class="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--brand)] hover:bg-[var(--surface-soft)] active:scale-95 transition-all cursor-pointer"
          title="重新测速全部节点"
        >
          <i :class="['text-base', probingAll ? 'ri-loader-4-line animate-spin' : 'ri-refresh-line']"></i>
        </button>
        <button
          type="button"
          @click="handleReset"
          class="text-xs text-[var(--muted)] hover:text-[var(--brand)] transition-colors cursor-pointer px-2 py-1 rounded-lg"
        >
          恢复默认
        </button>
      </div>
    </header>

    <!-- 主体内容（扁平化平铺） -->
    <main class="flex-1 w-full max-w-md mx-auto px-4 py-4 space-y-4">
      <!-- 提示说明 -->
      <section class="p-3.5 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border)] text-xs text-[var(--muted)] space-y-1.5 shadow-2xs leading-relaxed">
        <div class="flex items-center gap-1.5 font-bold text-[var(--text)]">
          <i class="ri-flashlight-line text-amber-500 text-sm"></i>
          <span>下载加速与分发优化</span>
        </div>
        <p class="text-[11px]">
          配置 GitHub Releases 代理镜像。在移动端检查更新或下载 APK/IPA 安装包时，将通过所选加速节点高速拉取，避免国内直连丢包或超时。
        </p>
      </section>

      <!-- 节点平铺列表 -->
      <section>
        <div class="text-xs font-medium text-[var(--muted)] px-3 mb-1.5">
          加速节点 ({{ proxies.length }})
        </div>
        <div class="bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden shadow-2xs">
          <div
            v-for="proxy in proxies"
            :key="proxy"
            @click="handleSelect(proxy)"
            class="p-3.5 hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer"
          >
            <div class="flex items-start gap-3">
              <!-- 前置单选圆点 -->
              <div class="pt-0.5 shrink-0">
                <span
                  class="w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200"
                  :class="activeProxy === proxy ? 'border-[var(--brand)] bg-[var(--brand)] shadow-xs' : 'border-[var(--border)] bg-transparent'"
                >
                  <span v-if="activeProxy === proxy" class="w-1.5 h-1.5 rounded-full bg-white"></span>
                </span>
              </div>

              <!-- 主体信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
                    <span class="text-sm font-medium text-[var(--text)] font-mono">
                      {{ formatHost(proxy) }}
                    </span>
                    <!-- 官方节点徽标 -->
                    <span
                      v-if="isOfficialProxy(proxy)"
                      class="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                    >
                      官方
                    </span>
                    <!-- 自定义节点徽标 -->
                    <span
                      v-else-if="isCustomProxy(proxy)"
                      class="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium"
                    >
                      自定义
                    </span>
                  </div>

                  <!-- 最右侧操作区（删除按钮 + 耗时徽标） -->
                  <div class="flex items-center gap-1.5 shrink-0 ml-1.5" @click.stop>
                    <button
                      v-if="isCustomProxy(proxy)"
                      type="button"
                      @click="handleDelete(proxy)"
                      class="w-6 h-6 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
                      title="删除此节点"
                    >
                      <i class="ri-delete-bin-line text-xs"></i>
                    </button>

                    <!-- 最右侧耗时徽标 -->
                    <span
                      class="px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors"
                      :class="getLatencyBadgeClass(probeStatus[proxy])"
                    >
                      {{ getLatencyBadgeText(probeStatus[proxy]) }}
                    </span>
                  </div>
                </div>

                <!-- 完整 URL -->
                <div class="text-[11px] text-[var(--muted)] font-mono truncate mt-0.5">
                  {{ proxy }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 添加自定义节点 -->
      <section>
        <div class="text-xs font-medium text-[var(--muted)] px-3 mb-1.5">新增代理节点</div>
        <div class="bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)] p-3 shadow-2xs">
          <div class="flex gap-2">
            <input
              type="url"
              v-model="customInput"
              placeholder="https://ghproxy.net/"
              class="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--brand)]"
              @keyup.enter="handleAddCustom"
            />
            <button
              type="button"
              class="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-[var(--brand)] text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              @click="handleAddCustom"
            >
              添加
            </button>
          </div>
        </div>
      </section>

      <p class="text-xs text-[var(--muted)] px-3 leading-relaxed">
        提示：点击任意节点即可设为默认下载加速通道。若某节点访问受阻，可切换至其他低延迟镜像。
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  DEFAULT_GITHUB_PROXIES,
  getProxyList,
  saveProxyList,
  resetProxyList,
  getActiveProxy,
  setActiveProxy,
  probeProxy,
  normalizeProxyUrl,
  isOfficialProxy,
} from '@/services/githubProxy';
import { useMessage } from '@/composables/useMessage';

interface ProxyStatus {
  loading: boolean;
  latency?: number;
  ok?: boolean;
}

const router = useRouter();
const { showMessage } = useMessage();

const proxies = ref<string[]>([]);
const activeProxy = ref<string>('');
const customInput = ref('');
const probingAll = ref(false);
const probeStatus = ref<Record<string, ProxyStatus>>({});

const loadData = () => {
  proxies.value = getProxyList();
  activeProxy.value = getActiveProxy();
};

const formatHost = (url: string) => {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
};

const isCustomProxy = (url: string) => {
  return !DEFAULT_GITHUB_PROXIES.includes(url) && !isOfficialProxy(url);
};

const getLatencyBadgeClass = (status?: ProxyStatus) => {
  if (!status || status.loading) {
    return 'bg-slate-500/10 text-slate-400 font-mono animate-pulse';
  }
  if (!status.ok) {
    return 'bg-rose-500/10 text-rose-500 dark:text-rose-400 font-mono font-medium';
  }
  if (status.latency !== undefined) {
    if (status.latency < 300) {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-medium';
    }
    if (status.latency <= 800) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-medium';
    }
    return 'bg-rose-500/10 text-rose-500 dark:text-rose-400 font-mono font-medium';
  }
  return 'bg-slate-500/10 text-slate-400 font-mono';
};

const getLatencyBadgeText = (status?: ProxyStatus) => {
  if (!status || status.loading) return '测速中...';
  if (!status.ok) return '超时/不可用';
  return `${status.latency}ms`;
};

const probeSingle = async (proxy: string) => {
  probeStatus.value[proxy] = { loading: true };
  try {
    const res = await probeProxy(proxy);
    probeStatus.value[proxy] = {
      loading: false,
      ok: res.ok,
      latency: res.latency,
    };
  } catch {
    probeStatus.value[proxy] = {
      loading: false,
      ok: false,
    };
  }
};

const probeAll = async () => {
  probingAll.value = true;
  proxies.value.forEach((p) => {
    probeStatus.value[p] = { loading: true };
  });

  const promises = proxies.value.map((p) => probeSingle(p));
  await Promise.allSettled(promises);
  probingAll.value = false;
};

const handleSelect = (proxy: string) => {
  setActiveProxy(proxy);
  activeProxy.value = proxy;
  showMessage(`已设为当前加速节点: ${formatHost(proxy)}`, 'success');
};

const handleReset = () => {
  resetProxyList();
  loadData();
  showMessage('已恢复默认 GitHub 代理列表', 'info');
  probeAll();
};

const handleAddCustom = () => {
  const clean = normalizeProxyUrl(customInput.value);
  if (!clean || clean === 'https://') {
    showMessage('请输入有效的代理节点地址', 'warning');
    return;
  }
  if (proxies.value.includes(clean)) {
    showMessage('该节点已在列表中', 'info');
    return;
  }
  const next = [...proxies.value, clean];
  saveProxyList(next);
  proxies.value = next;
  customInput.value = '';
  handleSelect(clean);
  showMessage('已添加并切换至新代理节点', 'success');
  probeSingle(clean);
};

const handleDelete = (proxy: string) => {
  const next = proxies.value.filter((p) => p !== proxy);
  saveProxyList(next);
  proxies.value = next;
  if (activeProxy.value === proxy) {
    handleSelect(next[0] || DEFAULT_GITHUB_PROXIES[0]);
  }
  showMessage('已删除该代理节点', 'info');
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: 'settings' });
  }
};

onMounted(() => {
  loadData();
  probeAll();
});
</script>