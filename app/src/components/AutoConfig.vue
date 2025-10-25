<template>
  <div v-if="visibleRef" class="auto-modal-backdrop" @click.self="close">
    <div class="auto-modal" :aria-busy="loading">
      <div class="form-card">
        <!-- 骨架屏 -->
        <div v-if="loading" class="skeleton-container">
          <div class="skeleton-title"></div>
          <div class="skeleton-subtitle"></div>
          <div class="skeleton-field"></div>
          <div class="skeleton-field"></div>
          <div class="skeleton-field"></div>
          <div class="skeleton-switch"></div>
          <div class="skeleton-buttons">
            <div class="skeleton-button primary"></div>
            <div class="skeleton-button"></div>
          </div>
        </div>

        <!-- 实际内容 -->
        <div v-else class="content-container">
          <div class="modal-header">
            <div class="modal-title-row">
              <h3 class="modal-title">定时任务配置</h3>
              <span class="badge beta">Beta</span>
            </div>
            <p class="modal-subtitle">
              此功能仍在测试中，可能存在不稳定性，欢迎反馈。
            </p>
          </div>

          <div class="form-section">
            <div class="form-field">
              <label class="form-label">
                <i class="icon fa-solid fa-map-location-dot"></i>
                <span class="label-text">校区地图</span>
                <span v-if="!mapsLoaded" class="loading-badge">加载中...</span>
              </label>
              <select
                v-model="map_id"
                class="select"
                :disabled="submitting || !mapsLoaded || availableMaps.length === 0"
              >
                <option value="" disabled v-if="!mapsLoaded">
                  加载地图中...
                </option>
                <option
                  v-for="mapId in availableMaps"
                  :key="mapId"
                  :value="mapId"
                >
                  {{ getMapDisplayName(mapId) }}
                </option>
                <option value="" disabled v-if="availableMaps.length === 0">
                  无可用地图
                </option>
              </select>
              <div v-if="!mapsLoaded" class="help-text">
                正在从服务器加载地图列表...
              </div>
              <div
                v-if="mapsLoaded && availableMaps.length === 0"
                class="help-text error"
              >
                未找到可用地图，请检查地图文件配置
              </div>
            </div>

            <div class="form-field">
              <label class="form-label">
                <i class="icon fa-solid fa-route"></i>
                <span class="label-text">最低里程（米）</span>
              </label>
              <input
                class="input"
                type="number"
                v-model.number="min_distance_m"
                min="1"
                max="100000"
                :disabled="submitting"
              />
            </div>

            <div class="form-field">
              <label class="form-label">
                <i class="icon fa-solid fa-clock"></i>
                <span class="label-text">每日运行时间</span>
              </label>
              <input
                class="time-picker"
                type="time"
                v-model="timeStr"
                :disabled="submitting"
              />
            </div>

            <div class="form-field switch-field">
              <label class="form-label">
                <i class="icon fa-solid fa-toggle-on"></i>
                <span class="label-text">启用定时任务</span>
              </label>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="enabled"
                  :disabled="submitting || !mapsLoaded || availableMaps.length === 0"
                />
                <span class="slider">
                  <i class="fa-solid on-icon fa-check"></i>
                  <i class="fa-solid off-icon fa-xmark"></i>
                </span>
              </label>
            </div>
          </div>

          <div class="actions">
            <button
              class="btn primary save-btn"
              :class="buttonState"
              @click="submit"
              :disabled="submitting || !mapsLoaded || availableMaps.length === 0"
            >
              <i
                v-if="buttonState === 'idle'"
                class="fa-solid fa-floppy-disk"
                aria-hidden="true"
              ></i>
              <i
                v-else-if="buttonState === 'loading'"
                class="fa-solid fa-spinner fa-spin"
                aria-hidden="true"
              ></i>
              <i
                v-else-if="buttonState === 'success'"
                class="fa-solid fa-check"
                aria-hidden="true"
              ></i>
              <i
                v-else-if="buttonState === 'error'"
                class="fa-solid fa-xmark"
                aria-hidden="true"
              ></i>
              <span class="save-text">{{ saveButtonText }}</span>
            </button>
            <button class="btn secondary" @click="close" :disabled="submitting">
              <i class="fa-solid fa-xmark"></i>
              <span>取消</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

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
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const mapFileData = await response.json();
        mapMetadata.value[mapId] = {
          mapId: mapFileData.mapId,
          mapName: mapFileData.mapName,
        };
        return { mapId, success: true };
      } catch (error) {
        console.error(`加载地图元数据失败: ${mapId}`, error);
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

<style scoped>
.auto-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10001;
  padding: 20px;
  box-sizing: border-box;
}

.auto-modal {
  width: 100%;
  max-width: 380px;
  max-height: 85vh;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  animation: modal-appear 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.form-card {
  background: transparent;
  border-radius: 20px;
  overflow: hidden;
}

/* 骨架屏样式 */
.skeleton-container {
  padding: 24px;
}

.skeleton-title {
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  margin-bottom: 8px;
  width: 60%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-subtitle {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  margin-bottom: 20px;
  width: 80%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-field {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  margin-bottom: 16px;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-switch {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 10px;
  margin-bottom: 24px;
  width: 50%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-buttons {
  display: flex;
  gap: 12px;
}

.skeleton-button {
  height: 44px;
  border-radius: 12px;
  flex: 1;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-button.primary {
  background: linear-gradient(90deg, #e0e0e0 25%, #d0d0d0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 内容容器 */
.content-container {
  padding: 0;
}

.modal-header {
  padding: 24px 24px 16px;
  border-bottom: none;
  margin-bottom: 8px;
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: -0.3px;
}

.badge.beta {
  background: linear-gradient(135deg, #8e8e93, #636366);
  color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.modal-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
  opacity: 0.8;
}

/* 表单区域 */
.form-section {
  padding: 0 24px;
}

.form-field {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.icon {
  width: 16px;
  text-align: center;
  color: #666;
  opacity: 0.8;
}

.loading-badge {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-left: auto;
}

/* 输入控件 */
.select,
.input,
.time-picker {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.8);
  color: #1a1a1a;
  box-sizing: border-box;
  transition: all 0.3s ease;
  -webkit-appearance: none;
  appearance: none;
}

.select:focus,
.input:focus,
.time-picker:focus {
  outline: none;
  border-color: #007aff;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.select:disabled,
.input:disabled,
.time-picker:disabled {
  background: rgba(248, 248, 248, 0.8);
  color: #8e8e93;
  border-color: rgba(0, 0, 0, 0.05);
  cursor: not-allowed;
}

/* 帮助文本 */
.help-text {
  font-size: 13px;
  color: #666;
  margin-top: 6px;
  opacity: 0.7;
}

.help-text.error {
  color: #ff3b30;
  opacity: 0.9;
}

/* 开关字段 */
.switch-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 8px 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 54px;
  height: 32px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(120, 120, 128, 0.3);
  transition: .3s;
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  box-sizing: border-box;
}

.slider:before {
  position: absolute;
  content: "";
  height: 28px;
  width: 28px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

input:checked + .slider {
  background-color: #007aff;
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.on-icon,
.off-icon {
  font-size: 10px;
  color: #fff;
  z-index: 1;
  transition: opacity 0.3s ease;
}

.on-icon {
  opacity: 0;
}

.off-icon {
  opacity: 1;
}

input:checked + .slider .on-icon {
  opacity: 1;
}

input:checked + .slider .off-icon {
  opacity: 0;
}

input:disabled + .slider {
  background-color: rgba(120, 120, 128, 0.2);
  cursor: not-allowed;
}

/* 操作按钮 */
.actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px 24px;
  background: rgba(248, 248, 248, 0.5);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 48px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn.primary {
  background: rgba(0, 122, 255, 0.9);
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
}

.btn.primary:not(:disabled):hover {
  background: rgba(0, 122, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4);
}

.btn.primary:not(:disabled):active {
  transform: translateY(0);
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.8);
  color: #1a1a1a;
  border: 1.5px solid rgba(0, 0, 0, 0.1);
}

.btn.secondary:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  border-color: rgba(0, 0, 0, 0.15);
}

.btn.secondary:not(:disabled):active {
  transform: translateY(0);
}

.save-text {
  font-weight: 600;
}

/* 按钮状态 */
.btn.primary.loading {
  background: rgba(0, 122, 255, 0.7);
}

.btn.primary.success {
  background: rgba(52, 199, 89, 0.9);
  box-shadow: 0 4px 16px rgba(52, 199, 89, 0.3);
}

.btn.primary.error {
  background: rgba(255, 59, 48, 0.9);
  box-shadow: 0 4px 16px rgba(255, 59, 48, 0.3);
}

/* 移动端适配 */
@media (max-width: 480px) {
  .auto-modal-backdrop {
    padding: 16px;
  }
  
  .auto-modal {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 18px;
  }
  
  .modal-header {
    padding: 20px 20px 12px;
  }
  
  .form-section {
    padding: 0 20px;
  }
  
  .actions {
    padding: 16px 20px 20px;
    flex-direction: column;
  }
  
  .btn {
    min-height: 52px;
  }
  
  .switch-field {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .switch {
    align-self: flex-end;
  }
}

@media (max-width: 360px) {
  .modal-title {
    font-size: 18px;
  }
  
  .modal-subtitle {
    font-size: 13px;
  }
  
  .form-label {
    font-size: 14px;
  }
  
  .select,
  .input,
  .time-picker {
    font-size: 15px;
    padding: 12px 14px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .auto-modal {
    background: rgba(30, 30, 32, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.4),
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  .modal-title {
    color: rgba(255, 255, 255, 0.9);
  }
  
  .modal-subtitle {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .form-label {
    color: rgba(255, 255, 255, 0.9);
  }
  
  .icon {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .select,
  .input,
  .time-picker {
    background: rgba(44, 44, 46, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }
  
  .select:focus,
  .input:focus,
  .time-picker:focus {
    background: rgba(44, 44, 46, 0.9);
    border-color: #0a84ff;
  }
  
  .select:disabled,
  .input:disabled,
  .time-picker:disabled {
    background: rgba(44, 44, 46, 0.5);
    color: rgba(255, 255, 255, 0.4);
  }
  
  .help-text {
    color: rgba(255, 255, 255, 0.6);
  }
  
  .actions {
    background: rgba(44, 44, 46, 0.5);
    border-top-color: rgba(255, 255, 255, 0.1);
  }
  
  .btn.secondary {
    background: rgba(44, 44, 46, 0.8);
    color: rgba(255, 255, 255, 0.9);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .btn.secondary:not(:disabled):hover {
    background: rgba(44, 44, 46, 0.9);
  }
}

/* 安全区域适配 */
@supports (padding: max(0px)) {
  .auto-modal-backdrop {
    padding: max(20px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left));
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .auto-modal,
  .btn,
  .slider,
  .select,
  .input,
  .time-picker {
    transition: none;
    animation: none;
  }
}
</style>