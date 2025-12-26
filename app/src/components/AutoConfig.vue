<template>
  <div v-if="visibleRef" class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm" @click.self="close">
    <div class="relative w-full max-w-xs bg-gray-500/30 backdrop-blur-2xl rounded-xl shadow-lg border border-gray-300">
      <!-- 关闭按钮 -->
      <button class="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" @click="close">
        <i class="fa-solid fa-xmark text-sm"></i>
      </button>

      <div class="p-5 bg-white/90 rounded-xl">
        <!-- 骨架屏 -->
        <div v-if="loading" class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-5 w-12 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div class="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div class="space-y-3">
            <div v-for="i in 4" :key="i" class="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div class="h-10 bg-gray-300 rounded animate-pulse"></div>
        </div>

        <!-- 实际内容 -->
        <div v-else class="space-y-6">
          <!-- 标题区域 -->
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-semibold text-gray-800">定时任务</h2>
            <span class="px-2 py-0.5 text-xs font-semibold bg-gray-800 text-white rounded-full">Beta</span>
          </div>

          <!-- 任务运行状态（仅展示今日是否完成） -->
          <div class="mt-2 text-sm text-gray-600">
            <div v-if="statusLoading">状态加载中...</div>
            <div v-else-if="statusError" class="text-red-500">获取状态失败</div>
            <div v-else>
              <div>今日已完成: <span class="font-medium">{{ todayDone ? '是' : '否' }}</span></div>
            </div>
          </div>

          <!-- 配置列表 -->
          <div class="space-y-4">
            <!-- 地图选择 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-gray-700 flex-shrink-0">
                <i class="fa-solid fa-map text-gray-600 w-4"></i>
                <span class="text-sm font-medium whitespace-nowrap">校区地图</span>
              </div>
              <div class="flex items-center gap-2 min-w-0">
                <select
                  v-model="form.map_id"
                  class="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed truncate max-w-[140px]"
                  :disabled="submitting || !mapsLoaded || availableMaps.length === 0"
                >
                  <option value="" disabled v-if="!mapsLoaded">加载中...</option>
                  <option
                    v-for="mapId in availableMaps"
                    :key="mapId"
                    :value="mapId"
                    class="truncate"
                  >
                    {{ getMapDisplayName(mapId) }}
                  </option>
                </select>
              </div>
            </div>

            <!-- 里程设置 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-gray-700 flex-shrink-0">
                <i class="fa-solid fa-route text-gray-600 w-4"></i>
                <span class="text-sm font-medium whitespace-nowrap">最低里程</span>
              </div>
              <div class="flex items-center gap-2">
                <input
                  class="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  type="number"
                  v-model.number="form.min_distance_m"
                  min="1"
                  max="100000"
                  :disabled="submitting"
                />
                <span class="text-sm text-gray-600 whitespace-nowrap">米</span>
              </div>
            </div>

            <!-- 时间设置 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-gray-700 flex-shrink-0">
                <i class="fa-solid fa-clock text-gray-600 w-4"></i>
                <span class="text-sm font-medium whitespace-nowrap">运行时间</span>
              </div>
              <div class="flex items-center gap-2">
                <input
                  class="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  type="time"
                  v-model="form.timeStr"
                  :disabled="submitting"
                />
              </div>
            </div>

            <!-- 开关设置 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-gray-700 flex-shrink-0">
                <i class="fa-solid fa-power-off text-gray-600 w-4"></i>
                <span class="text-sm font-medium whitespace-nowrap">启用任务</span>
              </div>
              <div class="flex items-center gap-2">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    v-model="form.enabled"
                    :disabled="submitting || !mapsLoaded || availableMaps.length === 0"
                  />
                  <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="pt-2">
            <button
              class="w-full py-3 px-4 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{
                'bg-blue-600 hover:bg-blue-700 text-white': buttonState === 'success',
                'bg-red-600 hover:bg-red-700 text-white': buttonState === 'error',
                'bg-gray-400 hover:bg-gray-500 text-white': buttonState === 'loading',
              }"
              @click="handleSubmit"
              :disabled="submitting || !mapsLoaded || availableMaps.length === 0"
            >
              <i v-if="buttonState === 'idle'" class="fa-solid fa-check"></i>
              <i v-else-if="buttonState === 'loading'" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else-if="buttonState === 'success'" class="fa-solid fa-check"></i>
              <i v-else-if="buttonState === 'error'" class="fa-solid fa-xmark"></i>
              <span>{{ saveButtonText }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, toRef, watch, computed, inject, onMounted } from "vue";
import { scheduledTaskConfig } from "@/utils/config";
import { loadMapFiles } from "../utils/map";

const props = defineProps({ visible: Boolean });
const emit = defineEmits(["update:visible", "saved"]);
const showMessage = inject("showMessage", (msg, type) => {
  if (type === "error") alert(msg);
  else console.log(msg);
});

const visibleRef = toRef(props, "visible");

// 表单数据
const form = ref({
  map_id: "",
  min_distance_m: 2000,
  timeStr: "08:00",
  enabled: false,
});

// 状态
const loading = ref(false);
const submitting = ref(false);
const buttonState = ref("idle"); // idle, loading, success, error
const availableMaps = ref([]);
const mapsLoaded = ref(false);
const mapMetadata = ref({});

// 运行状态
const runStatus = ref(null);
const statusLoading = ref(false);
const statusError = ref(null);

const fetchRunStatus = async () => {
  statusLoading.value = true;
  statusError.value = null;
  runStatus.value = null;
  try {
    const userId = localStorage.getItem("unirun_userId");
    const token = localStorage.getItem("unirun_token");
    const headers = { "content-type": "application/json" };
    if (token) headers["Token"] = token;
    const params = userId ? `?userid=${encodeURIComponent(userId)}` : "";

    const statusUrl = `${API_BASE.replace(/\/$/, "")}/api/autorun/run/status${params}`;
    console.log("AutoConfig: fetching run status ->", statusUrl);
    const res = await fetch(statusUrl, {
      method: "GET",
      headers,
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    runStatus.value = data;
  } catch (err) {
    console.warn("获取任务状态失败", err);
    statusError.value = err;
  } finally {
    statusLoading.value = false;
  }
};

// 仅展示今天是否完成
const todayDone = computed(() => {
  if (!runStatus.value || !runStatus.value.last_run_at) return false;
  const datePart = String(runStatus.value.last_run_at).slice(0, 10);
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return datePart === `${yyyy}-${mm}-${dd}`;
});

// 当组件被挂载到页面时也尝试加载地图和状态（处理作为页面而非弹窗的场景）
onMounted(() => {
  console.log("AutoConfig mounted: starting loadMaps and fetchRunStatus");
  loadMaps();
  fetchRunStatus();
});

// 计算属性
const saveButtonText = computed(() => {
  const texts = {
    loading: "保存中...",
    success: "保存成功",
    error: "保存失败",
    idle: "保存配置",
  };
  return texts[buttonState.value];
});

// 常量
const API_BASE = scheduledTaskConfig.apiBaseUrl;

// 方法
const fetchMapsFromApi = async () => {
    try {
      const token = localStorage.getItem("unirun_token");
      const headers = { "content-type": "application/json" };
      if (token) headers["Token"] = token;

      const mapsUrl = `${API_BASE.replace(/\/$/, "")}/api/autorun/maps`;
      console.log("AutoConfig: fetching maps ->", mapsUrl);
      const res = await fetch(mapsUrl, {
        method: "GET",
        headers,
      });

      if (!res.ok) {
        console.warn("AutoConfig: maps endpoint returned non-ok status", res.status);
        return null;
      }
      const data = await res.json();
      console.log("AutoConfig: maps response ->", data);
      if (!data || !Array.isArray(data.maps)) return null;

      const mapIds = data.maps.map((m) => m.id);
      availableMaps.value = mapIds;

      data.maps.forEach((m) => {
        if (m && m.id) {
          mapMetadata.value[m.id] = {
            mapId: m.id,
            mapName: m.name || m.id,
          };
        }
      });

      mapsLoaded.value = true;

      // If backend provided a default map, use it; otherwise pick first
      if (!form.value.map_id) {
        if (data.default && availableMaps.value.includes(data.default)) {
          form.value.map_id = data.default;
        } else if (mapIds.length > 0) {
          form.value.map_id = mapIds[0];
        }
      }

      return mapIds;
    } catch (err) {
      console.warn("获取地图列表失败，回退到本地文件", err);
      return null;
    }
  };

  const loadMaps = async () => {
    try {
      // 优先尝试从后端获取地图列表，失败后回退到本地文件
      const mapIds = (await fetchMapsFromApi()) || (await loadMapFiles());
      console.log("AutoConfig: loadMaps got mapIds ->", mapIds);
      if (Array.isArray(mapIds)) {
        availableMaps.value = mapIds;
        mapsLoaded.value = true;
        await loadMapMetadata();
        if (mapIds.length > 0 && !form.value.map_id) {
          form.value.map_id = mapIds[0];
        }
      } else {
        availableMaps.value = [];
    }
  } catch (error) {
    console.error("加载地图文件失败:", error);
    availableMaps.value = [];
  }
};

const loadMapMetadata = async () => {
  try {
    const metadataPromises = availableMaps.value.map(async (mapId) => {
      // 如果已经有 mapName（例如后端返回），则跳过额外请求
      if (mapMetadata.value[mapId]?.mapName) return { mapId, success: true };
      try {
        const response = await fetch(`/data/maps/${mapId}.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const mapFileData = await response.json();
        mapMetadata.value[mapId] = {
          mapId: mapFileData.mapId,
          mapName: mapFileData.mapName,
        };
        return { mapId, success: true };
      } catch (error) {
        return { mapId, success: false, error };
      }
    });
    await Promise.all(metadataPromises);
  } catch (error) {
    console.error("加载地图元数据时发生错误:", error);
  }
};

const getMapDisplayName = (mapId) => {
  if (mapMetadata.value[mapId]?.mapName) {
    return mapMetadata.value[mapId].mapName;
  }
  const displayNames = {
    cuit_hkg: "成都信息工程大学（航空港校区）",
    cuit_lqy: "成都信息工程大学（龙泉驿校区）",
    cdutcm_wj: "成都中医药大学（温江校区）",
    ncwsxx: "南充卫生学校",
    sctbc: "四川工商职业技术学院",
  };
  return displayNames[mapId] || mapId;
};

const fetchConfig = async () => {
  const userId = localStorage.getItem("unirun_userId");
  const token = localStorage.getItem("unirun_token");
  const headers = { "content-type": "application/json" };
  if (token) headers["Token"] = token;
  const params = userId ? `?userid=${encodeURIComponent(userId)}` : "";

  const res = await fetch(
    `${API_BASE.replace(/\/$/, "")}/api/autorun/config${params}`,
    { method: "GET", headers }
  );
  return res.ok ? await res.json() : null;
};

const applyConfig = (json) => {
  if (json.map_id && availableMaps.value.includes(json.map_id)) {
    form.value.map_id = json.map_id;
  } else if (availableMaps.value.length > 0) {
    form.value.map_id = availableMaps.value[0];
  }

  if (typeof json.min_distance_m !== "undefined") {
    form.value.min_distance_m = Number(json.min_distance_m) || form.value.min_distance_m;
  }

  if (json.cron) {
    const parts = String(json.cron).split(/\s+/);
    if (parts.length >= 2) {
      const minute = parts[0] === "*" ? 0 : Number(parts[0]) || 0;
      const hour = parts[1] === "*" ? 0 : Number(parts[1]) || 0;
      const hh = String(hour).padStart(2, "0");
      const mm = String(minute).padStart(2, "0");
      form.value.timeStr = `${hh}:${mm}`;
    }
  }

  if (typeof json.enabled !== "undefined") {
    form.value.enabled = Number(json.enabled) === 1;
  }
};

const setDefaultTime = () => {
  const now = new Date();
  form.value.timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
};

const close = () => {
  emit("update:visible", false);
};

const validateForm = () => {
  if (!form.value.map_id || !availableMaps.value.includes(form.value.map_id)) {
    showMessage("请选择有效的地图", "error");
    return false;
  }

  const distance = Number(form.value.min_distance_m);
  if (!Number.isInteger(distance) || distance < 1 || distance > 100000) {
    showMessage("距离必须在1-100000米之间", "error");
    return false;
  }

  const timeRegex = /^\d{2}:\d{2}$/;
  if (!form.value.timeStr || !timeRegex.test(form.value.timeStr)) {
    showMessage("时间格式不正确", "error");
    return false;
  }

  const [hhStr, mmStr] = form.value.timeStr.split(":");
  const hh = Number(hhStr);
  const mm = Number(mmStr);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
    showMessage("时间必须在00:00-23:59之间", "error");
    return false;
  }

  return true;
};

const buildRequestBody = () => {
  const [hhStr, mmStr] = form.value.timeStr.split(":");
  const hour = Number(hhStr);
  const minute = Number(mmStr);
  const cronStr = `${minute} ${hour} * * *`;

  return {
    cron: cronStr,
    enabled: form.value.enabled ? 1 : 0,
    map_id: form.value.map_id,
    min_distance_m: Number(form.value.min_distance_m),
  };
};

const saveConfig = async (body) => {
  const token = localStorage.getItem("unirun_token");
  const headers = { "content-type": "application/json" };
  if (token) headers["Token"] = token;

  const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/autorun/register`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("network");
  const resp = await res.json();
  return resp && resp.ok === true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  submitting.value = true;
  buttonState.value = "loading";

  try {
    const body = buildRequestBody();
    const result = await saveConfig(body);

    if (result) {
      buttonState.value = "success";
      showMessage("定时任务配置已保存", "success");
      emit("saved");
    } else {
      buttonState.value = "error";
      showMessage("保存失败，请重试", "error");
    }
  } catch (error) {
    console.error(error);
    buttonState.value = "error";
    showMessage("网络错误，请检查连接", "error");
  } finally {
    submitting.value = false;
    setTimeout(() => {
      buttonState.value = "idle";
    }, 1500);
  }
};

// 监听 visible 变化
watch(visibleRef, async (v) => {
  if (!v) return;

  loading.value = true;
  try {
    // 打开时优先刷新后端地图列表，失败回退到本地文件
    const backendMapIds = await fetchMapsFromApi();
    if (!Array.isArray(backendMapIds)) {
      const localMapIds = await loadMapFiles();
      if (Array.isArray(localMapIds)) {
        availableMaps.value = localMapIds;
        mapsLoaded.value = true;
        await loadMapMetadata();
        if (localMapIds.length > 0 && !form.value.map_id) {
          form.value.map_id = localMapIds[0];
        }
      } else {
        availableMaps.value = [];
      }
    } else {
      // 后端已返回列表，确保元数据已加载（有时需要从本地文件获取名称）
      await loadMapMetadata();
    }

    // 立即获取运行状态
    await fetchRunStatus();

    const configData = await fetchConfig();
    if (configData) {
      applyConfig(configData);
    } else {
      setDefaultTime();
    }
  } catch (e) {
    console.warn("获取定时任务配置失败", e);
    setDefaultTime();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped></style>
