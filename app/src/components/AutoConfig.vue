<template>
  <div v-if="visibleRef" class="auto-modal-backdrop" @click.self="close">
    <div class="auto-modal">
      <!-- 关闭按钮 -->
      <button class="close-btn" @click="close">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <div class="modal-content">
        <!-- 骨架屏 -->
        <div v-if="loading" class="skeleton-container">
          <div class="skeleton-header">
            <div class="skeleton-title"></div>
            <div class="skeleton-badge"></div>
          </div>
          <div class="skeleton-subtitle"></div>
          <div class="skeleton-list">
            <div class="skeleton-item" v-for="i in 4" :key="i"></div>
          </div>
          <div class="skeleton-buttons">
            <!-- <div class="skeleton-button primary"></div> -->
            <div class="skeleton-button"></div>
          </div>
        </div>

        <!-- 实际内容 -->
        <div v-else class="content-container">
          <!-- 标题区域 -->
          <div class="content-header">
            <div class="content-title">定时任务</div>
            <span class="badge beta">Beta</span>
          </div>
          <!-- <div class="content-subtitle">此功能仍在测试中，欢迎反馈</div> -->

          <!-- 列表布局 -->
          <div class="config-list">
            <!-- 地图选择 -->
            <div class="list-item">
              <div class="item-label">
                <i class="icon fa-solid fa-map"></i>
                <span>校区地图</span>
              </div>
              <div class="item-value">
                <select
                  v-model="map_id"
                  class="list-select"
                  :disabled="
                    submitting || !mapsLoaded || availableMaps.length === 0
                  "
                >
                  <option value="" disabled v-if="!mapsLoaded">
                    加载中...
                  </option>
                  <option
                    v-for="mapId in availableMaps"
                    :key="mapId"
                    :value="mapId"
                  >
                    {{ getMapDisplayName(mapId) }}
                  </option>
                </select>
              </div>
            </div>

            <!-- 里程设置 -->
            <div class="list-item">
              <div class="item-label">
                <i class="icon fa-solid fa-route"></i>
                <span>最低里程</span>
              </div>
              <div class="item-value">
                <input
                  class="list-input"
                  type="number"
                  v-model.number="min_distance_m"
                  min="1"
                  max="100000"
                  :disabled="submitting"
                />
                <span class="unit">米</span>
              </div>
            </div>

            <!-- 时间设置 -->
            <div class="list-item">
              <div class="item-label">
                <i class="icon fa-solid fa-clock"></i>
                <span>运行时间</span>
              </div>
              <div class="item-value">
                <input
                  class="list-time"
                  type="time"
                  v-model="timeStr"
                  :disabled="submitting"
                />
              </div>
            </div>

            <!-- 开关设置 -->
            <div class="list-item">
              <div class="item-label">
                <i class="icon fa-solid fa-power-off"></i>
                <span>启用任务</span>
              </div>
              <div class="item-value">
                <label class="list-switch">
                  <input
                    type="checkbox"
                    v-model="enabled"
                    :disabled="
                      submitting || !mapsLoaded || availableMaps.length === 0
                    "
                  />
                  <span class="switch-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <button
              class="action-btn primary"
              :class="buttonState"
              @click="submit"
              :disabled="
                submitting || !mapsLoaded || availableMaps.length === 0
              "
            >
              <i v-if="buttonState === 'idle'" class="fa-solid fa-check"></i>
              <i
                v-else-if="buttonState === 'loading'"
                class="fa-solid fa-spinner fa-spin"
              ></i>
              <i
                v-else-if="buttonState === 'success'"
                class="fa-solid fa-check"
              ></i>
              <i
                v-else-if="buttonState === 'error'"
                class="fa-solid fa-xmark"
              ></i>
              <span>{{ saveButtonText }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 基础样式 */
.auto-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 16px;
  box-sizing: border-box;
}

.auto-modal {
  position: relative;
  width: 100%;
  max-width: 320px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.6);
  /* box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); */
  border-radius: 12px;
  animation: modal-appear 0.2s ease-out;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  font-size: 16px;
  color: #000;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #000;
}

.modal-content {
  padding: 20px;
}

/* 骨架屏 */
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skeleton-title {
  height: 20px;
  width: 120px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-badge {
  height: 16px;
  width: 40px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-subtitle {
  height: 14px;
  width: 180px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-item {
  height: 20px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-buttons {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.skeleton-button {
  height: 40px;
  border-radius: 8px;
  flex: 1;
  background: rgba(255, 255, 255, 0.15);
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-button.primary {
  background: rgba(255, 255, 255, 0.2);
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0%, 100% {
    background: rgba(255, 255, 255, 0.15);
  }
  50% {
    background: rgba(255, 255, 255, 0.25);
  }
}

/* 实际内容 */
.content-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-title {
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.badge.beta {
  background: #000;
  color: #fff;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.content-subtitle {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

/* 列表布局 */
.config-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 20px;
}

.item-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #000;
  font-weight: 500;
  flex-shrink: 0;
}

.icon {
  width: 14px;
  text-align: center;
  color: #333;
  font-size: 12px;
}

.item-value {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

/* 输入控件 */
.list-select,
.list-input,
.list-time {
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #333;
  min-width: 0;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(51,51,51,0.6)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  padding-right: 28px;
}

.list-select {
  cursor: pointer;
}

.list-select:focus,
.list-input:focus,
.list-time:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(51,51,51,0.9)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
}

.list-select:disabled,
.list-input:disabled,
.list-time:disabled {
  background: rgba(255, 255, 255, 0.08);
  color: #999;
  cursor: not-allowed;
}

.unit {
  font-size: 12px;
  color: #333;
  white-space: nowrap;
  font-weight: 500;
}

/* 开关 */
.list-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.list-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: 0.2s;
  border-radius: 24px;
  /* border: 1px solid rgba(255, 255, 255, 0.3); */
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

input:checked + .switch-slider {
  background-color: rgba(3, 3, 3, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-color: rgba(0, 0, 0, 0.2);
}

input:checked + .switch-slider:before {
  transform: translateX(20px);
}

input:disabled + .switch-slider {
  background-color: rgba(255, 255, 255, 0.08);
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, 0.15);
}

/* 操作按钮 */
.action-buttons {
  margin-top: 8px;
}

.action-btn {
  height: 40px;
  width: 100%;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background: #000;
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.action-btn.primary:not(:disabled):hover {
  background: #1a1a1a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 移动端适配 */
@media (max-width: 480px) {
  .auto-modal-backdrop {
    padding: 12px;
  }

  .auto-modal {
    max-width: 100%;
  }

  .modal-content {
    padding: 16px;
  }

  .config-list {
    gap: 14px;
  }
}

@media (max-width: 360px) {
  .modal-content {
    padding: 14px;
  }

  .content-title {
    font-size: 16px;
  }

  .item-label {
    font-size: 13px;
  }

  .list-select,
  .list-input,
  .list-time {
    font-size: 12px;
    padding: 5px 6px;
  }
}
</style>

<script setup>
import { ref, onMounted, toRef, watch, computed } from "vue";
import { config } from "../utils/config";
import { loadMapFiles } from "../utils/map";

const props = defineProps({ visible: Boolean });
const emit = defineEmits(["update:visible", "saved"]);

const visibleRef = toRef(props, "visible");

const token = ref("");
const map_id = ref("");
const min_distance_m = ref(2000);
const timeStr = ref("08:00");
const hour = ref(8);
const minute = ref(0);
const enabled = ref(false);

const loading = ref(false);
const submitting = ref(false);
const buttonState = ref("idle");
const availableMaps = ref([]);
const mapsLoaded = ref(false);
const mapMetadata = ref({});

const saveButtonText = computed(() => {
  const texts = {
    loading: "保存中...",
    success: "保存成功",
    error: "保存失败",
    idle: "保存",
  };
  return texts[buttonState.value];
});

onMounted(() => {
  try {
    const t = localStorage.getItem("token");
    if (t) token.value = t;
  } catch (e) {}
});

watch(visibleRef, async (v) => {
  if (!v) return;

  loading.value = true;
  try {
    if (!mapsLoaded.value) {
      await loadMaps();
    }

    const configData = await fetchConfig();
    if (configData) {
      applyConfig(configData);
    } else {
      setDefaultTime();
    }
  } catch (e) {
    console.warn("fetch autorun config failed", e);
    setDefaultTime();
  } finally {
    loading.value = false;
  }
});

async function loadMaps() {
  try {
    const mapIds = await loadMapFiles();
    availableMaps.value = mapIds;
    mapsLoaded.value = true;
    await loadMapMetadata();

    if (mapIds.length > 0 && !map_id.value) {
      map_id.value = mapIds[0];
    }
  } catch (error) {
    console.error("加载地图文件失败:", error);
    availableMaps.value = [];
  }
}

async function loadMapMetadata() {
  try {
    const metadataPromises = availableMaps.value.map(async (mapId) => {
      try {
        const response = await fetch(`/data/maps/${mapId}.json`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const mapFileData = await response.json();
        mapMetadata.value[mapId] = {
          mapId: mapFileData.mapId,
          mapName: mapFileData.mapName,
        };
        return { mapId, success: true };
      } catch (error) {
        // console.error(`加载地图元数据失败: ${mapId}`, error);
        return { mapId, success: false, error };
      }
    });
    await Promise.all(metadataPromises);
  } catch (error) {
    console.error("加载地图元数据时发生错误:", error);
  }
}

function getMapDisplayName(mapId) {
  if (mapMetadata.value[mapId] && mapMetadata.value[mapId].mapName) {
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
}

async function fetchConfig() {
  const userId = localStorage.getItem("userId");
  const base = config.api.autorunServerBase || "http://localhost:8080";
  const headers = { "content-type": "application/json" };
  if (token.value) headers["Token"] = token.value;
  const params = userId ? `?userid=${encodeURIComponent(userId)}` : "";

  const res = await fetch(
    base.replace(/\/$/, "") + "/api/autorun/config" + params,
    { method: "GET", headers }
  );
  return res.ok ? await res.json() : null;
}

function applyConfig(json) {
  if (json.map_id && availableMaps.value.includes(json.map_id)) {
    map_id.value = json.map_id;
  } else if (availableMaps.value.length > 0) {
    map_id.value = availableMaps.value[0];
  }

  if (typeof json.min_distance_m !== "undefined") {
    min_distance_m.value = Number(json.min_distance_m) || min_distance_m.value;
  }

  if (json.cron) {
    const parts = String(json.cron).split(/\s+/);
    if (parts.length >= 2) {
      minute.value = parts[0] === "*" ? 0 : Number(parts[0]) || 0;
      hour.value = parts[1] === "*" ? 0 : Number(parts[1]) || 0;
      const hh = String(hour.value).padStart(2, "0");
      const mm = String(minute.value).padStart(2, "0");
      timeStr.value = `${hh}:${mm}`;
    }
  }

  if (typeof json.enabled !== "undefined") {
    enabled.value = Number(json.enabled) === 1;
  }
}

function setDefaultTime() {
  const now = new Date();
  timeStr.value = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
  hour.value = now.getHours();
  minute.value = now.getMinutes();
}

function close() {
  emit("update:visible", false);
}

async function submit() {
  submitting.value = true;
  buttonState.value = "loading";

  try {
    if (!validateForm()) {
      throw new Error("表单验证失败");
    }

    const body = buildRequestBody();
    const result = await saveConfig(body);

    if (result) {
      buttonState.value = "success";
      emit("saved");
    } else {
      buttonState.value = "error";
    }
  } catch (e) {
    console.error(e);
    buttonState.value = "error";
  } finally {
    submitting.value = false;
    setTimeout(() => {
      buttonState.value = "idle";
    }, 1500);
  }
}

function validateForm() {
  if (!map_id.value || !availableMaps.value.includes(map_id.value)) {
    alert("请选择有效的地图");
    return false;
  }

  if (
    !Number.isInteger(Number(min_distance_m.value)) ||
    min_distance_m.value < 1 ||
    min_distance_m.value > 100000
  ) {
    alert("距离必须在1-100000米之间");
    return false;
  }

  if (!timeStr.value || !/^\d{2}:\d{2}$/.test(timeStr.value)) {
    alert("时间格式不正确");
    return false;
  }

  const [hhStr, mmStr] = timeStr.value.split(":");
  const hh = Number(hhStr);
  const mm = Number(mmStr);

  if (
    !Number.isInteger(hh) ||
    hh < 0 ||
    hh > 23 ||
    !Number.isInteger(mm) ||
    mm < 0 ||
    mm > 59
  ) {
    alert("时间必须在00:00-23:59之间");
    return false;
  }

  return true;
}

function buildRequestBody() {
  const [hhStr, mmStr] = timeStr.value.split(":");
  hour.value = Number(hhStr);
  minute.value = Number(mmStr);
  const cronStr = `${minute.value} ${hour.value} * * *`;

  return {
    cron: cronStr,
    enabled: enabled.value ? 1 : 0,
    map_id: map_id.value,
    min_distance_m: Number(min_distance_m.value),
  };
}

async function saveConfig(body) {
  const base = config.api.autorunServerBase || "http://localhost:8080";
  const headers = { "content-type": "application/json" };
  if (token.value) headers["Token"] = token.value;

  const res = await fetch(base.replace(/\/$/, "") + "/api/autorun/register", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("network");
  const resp = await res.json();
  return resp && resp.ok === true;
}
</script>
