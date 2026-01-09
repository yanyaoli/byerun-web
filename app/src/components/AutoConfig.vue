<template>
  <div v-if="visible" class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
    @click.self="close">
    <div
      class="relative w-full max-w-[300px] bg-stone-950 border border-white/10 rounded-[2rem] shadow-2xl transition-all overflow-hidden">

      <div v-if="pinging" class="py-16 flex flex-col items-center justify-center space-y-4">
        <i class="fa-brands fa-connectdevelop text-white text-3xl animate-bounce"></i>
        <p class="text-[10px] text-stone-600 font-black tracking-[0.3em] uppercase">连接服务中</p>
      </div>

      <div v-else-if="initError" class="py-16 flex flex-col items-center justify-center space-y-4">
        <div class="relative">
          <i class="fa-solid fa-bomb text-red-500 text-4xl animate-pulse"></i>
          <div class="absolute -inset-2 bg-red-500/20 blur-xl rounded-full"></div>
        </div>
        <div class="text-center px-6">
          <p class="text-stone-200 text-xs font-bold">连接失败</p>
          <p class="text-stone-500 text-[10px] mt-1 line-clamp-2">{{ initError }}</p>
        </div>
        <button @click="init"
          class="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 text-[10px] font-bold rounded-xl transition-colors">
          重新尝试
        </button>
      </div>

      <div v-else class="p-6 space-y-5">
        <div class="flex justify-between items-center pr-8">
          <div class="space-y-0.5">
            <h2 class="text-sm font-black text-stone-200 uppercase tracking-widest">定时任务</h2>
            <p class="text-[9px] text-stone-700 font-mono">v20260107 BETA</p>
          </div>
        </div>

        <div class="flex items-center justify-between p-3 bg-stone-900/40 border border-white/5 rounded-2xl">
          <span class="text-[11px] font-bold text-stone-500">今日完成状态</span>
          <span
            :class="['text-[11px] font-black', status?.executed ? 'text-emerald-500' : 'text-orange-500 text-shadow-sm']">
            {{ status?.executed ? '已完成' : '待执行' }}
          </span>
        </div>

        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-stone-600 uppercase tracking-widest ml-1">学校地图</label>
            <div class="relative">
              <div @click="showMapList = !showMapList"
                class="flex items-center justify-between bg-stone-900 border border-white/5 rounded-xl px-4 py-2.5 cursor-pointer hover:border-white/10 transition-all">
                <span class="text-[12px] text-stone-200 font-medium">{{ currentMapName }}</span>
                <i
                  :class="['fa-solid fa-chevron-down text-[10px] text-stone-600 transition-transform', showMapList ? 'rotate-180' : '']"></i>
              </div>
              <div v-if="showMapList"
                class="absolute z-50 w-full mt-1 bg-stone-900 border border-white/10 rounded-xl shadow-2xl py-1 max-h-[120px] overflow-y-auto">
                <div v-for="map in maps" :key="map.id" @click="selectMap(map)"
                  class="px-4 py-2 text-[12px] text-stone-400 hover:bg-white/5 hover:text-white cursor-pointer transition-colors">
                  {{ map.name }}
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-stone-600 uppercase tracking-widest ml-1">运行时间</label>
            <div class="flex items-center gap-2">
              <div class="flex-1 flex items-center bg-stone-900 border border-white/5 rounded-xl p-1">
                <select v-model="timeObj.h"
                  class="w-full bg-transparent text-center text-sm font-mono text-white outline-none appearance-none py-1">
                  <option v-for="h in 24" :key="h - 1" :value="h - 1" class="bg-stone-900 text-white">{{
                    String(h - 1).padStart(2, '0') }}</option>
                </select>
                <span class="text-[9px] text-stone-600 pr-2 italic">H</span>
              </div>
              <span class="text-stone-800 font-bold">:</span>
              <div class="flex-1 flex items-center bg-stone-900 border border-white/5 rounded-xl p-1">
                <select v-model="timeObj.m"
                  class="w-full bg-transparent text-center text-sm font-mono text-white outline-none appearance-none py-1">
                  <option v-for="m in 60" :key="m - 1" :value="m - 1" class="bg-stone-900 text-white">{{
                    String(m - 1).padStart(2, '0') }}</option>
                </select>
                <span class="text-[9px] text-stone-600 pr-2 italic">M</span>
              </div>
            </div>
          </div>

          <div @click="form.enabled = !form.enabled" class="flex items-center justify-between p-1 cursor-pointer group">
            <span class="text-[11px] font-bold text-stone-500 group-hover:text-stone-300 transition-colors">开启定时</span>
            <div
              :class="['w-9 h-5 rounded-full transition-all relative', form.enabled ? 'bg-stone-200' : 'bg-stone-800']">
              <div
                :class="['absolute top-1 w-3 h-3 rounded-full transition-all', form.enabled ? 'left-5 bg-black' : 'left-1 bg-stone-500']">
              </div>
            </div>
          </div>
        </div>

        <button @click="handleSave" :disabled="submitting"
          class="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-[0.97] disabled:opacity-20 flex items-center justify-center gap-2">
          <i v-if="submitting" class="fa-solid fa-circle-notch fa-spin"></i>
          <span>{{ submitting ? 'SYNCING' : '保存配置' }}</span>
        </button>
      </div>

      <button @click="close"
        class="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-stone-600 hover:text-white transition-all">
        <i class="fa-solid fa-xmark text-sm"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, inject } from "vue";
import { scheduledTaskConfig } from "@/utils/config";
import { useDataStore } from "@/composables/useDataStore";

const props = defineProps({ visible: Boolean });
const emit = defineEmits(["update:visible", "saved"]);
const showMessage = inject("showMessage", (msg) => alert(msg));

const { userId, token } = useDataStore();

const API_BASE = (scheduledTaskConfig.apiBaseUrl || '').replace(/\/$/, "");

const pinging = ref(true);
const initError = ref(null); // 错误状态
const submitting = ref(false);
const showMapList = ref(false);

const maps = ref([]);
const status = ref(null);
const form = ref({ map_id: "", enabled: false });
const timeObj = reactive({ h: 8, m: 0 });

const currentMapName = computed(() => {
  const map = maps.value.find(m => m.id === form.value.map_id);
  return map ? map.name : '加载中...';
});

const selectMap = (map) => {
  form.value.map_id = map.id;
  showMapList.value = false;
};

const request = async (path, options = {}) => {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Token": token.value || "",
      ...options.headers
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text.trim());
  } catch (e) {
    console.error("JSON Parse Error:", e, "Text:", text);
    throw new Error("服务器响应格式异常");
  }
  if (!json.success) throw new Error(json.message || "请求失败");
  return json.data;
};

const parseCronToTime = (cronExpr) => {
  if (!cronExpr) return { h: 8, m: 0 };
  const [min, hour] = cronExpr.split(' ');
  return { h: parseInt(hour), m: parseInt(min) };
};

const init = async () => {
  pinging.value = true;
  initError.value = null; // 重置错误
  try {
    // 1. 基础服务检查 (必须成功)
    await request("/ping");

    // 2. 并发请求后续数据
    const [mapsData, configData, statusData] = await Promise.all([
      request("/api/autorun/maps"),
      request(`/api/autorun/config?userid=${userId.value}`),
      request(`/api/autorun/run/status?userid=${userId.value}`)
    ]);

    // 赋值
    maps.value = mapsData.maps;
    form.value.map_id = configData.map_id || mapsData.default;
    form.value.enabled = !!configData.enabled;
    const { h, m } = parseCronToTime(configData.cron_expr);
    timeObj.h = h;
    timeObj.m = m;
    status.value = statusData;

    pinging.value = false;
  } catch (err) {
    console.error("AutoRun Init Error:", err);
    initError.value = err.message || "未知错误";
    pinging.value = false; // 停止 pinging 状态以展示错误 UI
  }
};

const handleSave = async () => {
  submitting.value = true;
  try {
    const targetDate = new Date();
    targetDate.setHours(timeObj.h, timeObj.m, 0, 0);

    await request("/api/autorun/register", {
      method: "POST",
      body: JSON.stringify({
        map_id: form.value.map_id,
        enabled: form.value.enabled ? 1 : 0,
        timestamp: targetDate.getTime()
      })
    });

    await request(`/api/autorun/run/status?userid=${userId.value}`);
    showMessage("设置已更新");
  } catch (err) {
    showMessage(err.message, "error");
  } finally {
    submitting.value = false;
  }
};

const close = () => {
  showMapList.value = false;
  emit("update:visible", false);
};

watch(() => props.visible, (val) => val && init());
</script>

<style scoped>
/* 保持原有样式 */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #292524;
  border-radius: 10px;
}

option {
  background-color: #0c0a09;
  color: #e7e5e4;
}
</style>