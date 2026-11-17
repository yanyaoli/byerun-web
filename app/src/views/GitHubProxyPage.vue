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
      <button
        type="button"
        @click="handleReset"
        class="text-xs text-[var(--muted)] hover:text-[var(--brand)] transition-colors cursor-pointer px-2 py-1 rounded-lg"
      >
        恢复默认
      </button>
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

      <!-- 节点测速操作栏 -->
      <div class="flex items-center justify-between px-1">
        <span class="text-xs font-medium text-[var(--muted)]">代理节点列表 ({{ proxies.length }})</span>
        <button
          type="button"
          :disabled="probingAll"
          @click="handleProbeAll"
          class="text-xs font-medium text-[var(--brand)] hover:opacity-80 active:scale-95 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
        >
          <i :class="['text-xs', probingAll ? 'ri-loader-4-line animate-spin' : 'ri-pulse-line']"></i>
          <span>{{ probingAll ? '正在测速...' : '全部节点测速' }}</span>
        </button>
      </div>

      <!-- 代理节点平铺列表 -->
      <div class="bg-[var(--surface-solid)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden shadow-2xs">
        <div
          v-for="proxy in proxies"
          :key="proxy"
          @click="handleSelect(proxy)"
          class="p-3.5 hover:bg-[var(--surface-soft)] active:bg-[var(--surface-soft)] transition-colors cursor-pointer flex items-center justify-between gap-3"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-medium text-[var(--text)] font-mono">
                {{ formatHost(proxy) }}
              </span>
              <!-- 延迟徽标 -->
              <span
                v-if="probeResults[proxy]"
                class="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
                :class="
                  probeResults[proxy].ok
                    ? probeResults[proxy].latency < 400
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-rose-500/10 text-rose-500'
                "
              >
                {{ probeResults[proxy].ok ? `${probeResults[proxy].latency}ms` : '超时' }}
              </span>
            </div>
            <div class="text-[11px] text-[var(--muted)] font-mono truncate mt-0.5">
              {{ proxy }}
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0" @click.stop>
            <!-- 单点测速 -->
            <button
              type="button"
              @click="handleProbeSingle(proxy)"
              :disabled="probingSingle[proxy]"
              class="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-soft)] active:scale-95 transition-all cursor-pointer"
              title="单独测速"
            >
              <i :class="['text-sm', probingSingle[proxy] ? 'ri-loader-4-line animate-spin' : 'ri-pulse-line']"></i>
            </button>

            <!-- 删除自定义节点（默认节点不展示删除） -->
            <button
              v-if="isCustomProxy(proxy)"
              type="button"
              @click="handleDelete(proxy)"
              class="w-7 h-7 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
              title="删除此节点"
            >
              <i class="ri-delete-bin-line text-sm"></i>
            </button>

            <!-- 选中激活状态 -->
            <div class="w-6 flex items-center justify-center">
              <i
                v-if="activeProxy === proxy"
                class="ri-check-line text-xl text-[var(--brand)] font-bold"
              ></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加自定义节点 -->
      <section>
        <div class="text-xs font-medium text-[var(--muted)] px-1 mb-1.5">新增代理节点</div>
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

      <p class="text-xs text-[var(--muted)] px-2 leading-relaxed">
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
  probeAllProxies,
  normalizeProxyUrl,
  type ProxyProbeResult,
} from '@/services/githubProxy';
import { useMessage } from '@/composables/useMessage';

const router = useRouter();
const { showMessage } = useMessage();

const proxies = ref<string[]>([]);
const activeProxy = ref<string>('');
const customInput = ref('');
const probingAll = ref(false);
const probingSingle = ref<Record<string, boolean>>({});
const probeResults = ref<Record<string, ProxyProbeResult>>({});

const loadData = () => {
  proxies.value = getProxyList();
  activeProxy.value = getActiveProxy();
};

const formatHost = (url: string) => {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
};

const isCustomProxy = (url: string) => {
  return !DEFAULT_GITHUB_PROXIES.includes(url);
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

const handleProbeSingle = async (proxy: string) => {
  probingSingle.value[proxy] = true;
  try {
    const res = await probeProxy(proxy);
    probeResults.value[proxy] = res;
    if (res.ok) {
      showMessage(`${formatHost(proxy)} 延迟: ${res.latency}ms`, 'success');
    } else {
      showMessage(`${formatHost(proxy)} 连接超时`, 'warning');
    }
  } finally {
    probingSingle.value[proxy] = false;
  }
};

const handleProbeAll = async () => {
  probingAll.value = true;
  try {
    const results = await probeAllProxies(proxies.value);
    probeResults.value = results;
    showMessage('全部节点测速完成', 'success');
  } finally {
    probingAll.value = false;
  }
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
});
</script>
