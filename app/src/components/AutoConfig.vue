<template>
  <div v-if="visibleRef" class="auto-modal-backdrop" @click.self="close">
    <div class="auto-modal" :aria-busy="loading">
      <div class="form card">
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
                :disabled="
                  submitting || !mapsLoaded || availableMaps.length === 0
                "
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
                  :disabled="
                    submitting || !mapsLoaded || availableMaps.length === 0
                  "
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
              :disabled="
                submitting || !mapsLoaded || availableMaps.length === 0
              "
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
import { loadMapFiles } from "../utils/map"; // 导入轨迹工具

const props = defineProps({ visible: Boolean });
const emit = defineEmits(["update:visible", "saved"]);

const visibleRef = toRef(props, "visible");
const token = ref("");
const map_id = ref(""); // 初始为空，等待加载
const min_distance_m = ref(2000);
const timeStr = ref("08:00");
const hour = ref(8);
const minute = ref(0);
const enabled = ref(false);

const loading = ref(false);
const submitting = ref(false);
const buttonState = ref("idle");

// 新增：存储可用地图列表
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
    // 先加载地图文件
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

/**
 * 加载地图文件
 */
async function loadMaps() {
  try {
    const mapIds = await loadMapFiles();
    availableMaps.value = mapIds;
    mapsLoaded.value = true;

    // 加载地图元数据
    await loadMapMetadata();

    // 设置默认地图（第一个可用地图）
    if (mapIds.length > 0 && !map_id.value) {
      map_id.value = mapIds[0];
    }

    console.log("成功加载地图列表:", mapIds);
  } catch (error) {
    console.error("加载地图文件失败:", error);
    availableMaps.value = [];
  }
}

// 加载地图元数据
async function loadMapMetadata() {
  try {
    // 遍历所有地图文件，获取元数据
    const metadataPromises = availableMaps.value.map(async (mapId) => {
      try {
        const response = await fetch(`/data/maps/${mapId}.json`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const mapFileData = await response.json();

        // 存储地图元数据
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

// 修改 getMapDisplayName 函数
function getMapDisplayName(mapId) {
  // 优先使用从地图文件加载的元数据
  if (mapMetadata.value[mapId] && mapMetadata.value[mapId].mapName) {
    return mapMetadata.value[mapId].mapName;
  }

  // 备用方案：如果无法获取地图名称，使用默认映射
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

  if (res.ok) {
    return await res.json();
  }
  return null;
}

function applyConfig(json) {
  if (json.map_id) {
    // 验证地图ID是否在可用列表中
    if (availableMaps.value.includes(json.map_id)) {
      map_id.value = json.map_id;
    } else if (availableMaps.value.length > 0) {
      // 如果配置的地图不存在，使用第一个可用地图
      map_id.value = availableMaps.value[0];
      console.warn(`地图 ${json.map_id} 不存在，使用默认地图: ${map_id.value}`);
    }
  } else if (availableMaps.value.length > 0) {
    // 如果没有配置地图，使用第一个可用地图
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
  // 验证地图选择
  if (!map_id.value || !availableMaps.value.includes(map_id.value)) {
    alert("请选择有效的地图");
    return false;
  }

  // 验证距离
  if (
    !Number.isInteger(Number(min_distance_m.value)) ||
    min_distance_m.value < 1 ||
    min_distance_m.value > 100000
  ) {
    alert("距离必须在1-100000米之间");
    return false;
  }

  // 验证时间
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
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.auto-modal {
  width: 100%;
  max-width: 380px;
  max-height: calc(100vh - 40px);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 骨架屏样式 */
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
}

.skeleton-title {
  height: 24px;
  background: linear-gradient(90deg, #f2f2f7 25%, #e5e5ea 50%, #f2f2f7 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  animation: skeleton-loading 1.5s infinite;
  width: 60%;
  margin: 0 auto;
}

.skeleton-subtitle {
  height: 16px;
  background: linear-gradient(90deg, #f2f2f7 25%, #e5e5ea 50%, #f2f2f7 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: skeleton-loading 1.5s infinite;
  width: 80%;
  margin: -8px auto 8px;
}

.skeleton-field {
  height: 52px;
  background: linear-gradient(90deg, #f2f2f7 25%, #e5e5ea 50%, #f2f2f7 75%);
  background-size: 200% 100%;
  border-radius: 12px;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-switch {
  height: 32px;
  background: linear-gradient(90deg, #f2f2f7 25%, #e5e5ea 50%, #f2f2f7 75%);
  background-size: 200% 100%;
  border-radius: 16px;
  animation: skeleton-loading 1.5s infinite;
  width: 52px;
  align-self: flex-start;
}

.skeleton-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.skeleton-button {
  flex: 1;
  height: 50px;
  background: linear-gradient(90deg, #f2f2f7 25%, #e5e5ea 50%, #f2f2f7 75%);
  background-size: 200% 100%;
  border-radius: 12px;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-button.primary {
  background: linear-gradient(90deg, #e5e5ea 25%, #d1d1d6 50%, #e5e5ea 75%);
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

/* 内容区域样式 */
.content-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f2f2f7;
  text-align: center;
}

.modal-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 6px;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.2px;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.1px;
}

.badge.beta {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
  border: 1px solid rgba(0, 122, 255, 0.2);
}

.modal-subtitle {
  margin: 0;
  font-size: 14px;
  color: #8e8e93;
  text-align: center;
  line-height: 1.4;
}

.form-section {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: #000;
  letter-spacing: -0.1px;
}

.icon {
  color: #007aff;
  width: 16px;
  text-align: center;
  font-size: 14px;
}

.label-text {
  flex: 1;
}

.switch-field {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.input,
.select,
.time-picker {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #c6c6c8;
  border-radius: 12px;
  background: #fff;
  font-size: 16px;
  color: #000;
  transition: all 0.2s ease;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

.input:focus,
.select:focus,
.time-picker:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.input:disabled,
.select:disabled,
.time-picker:disabled {
  background: #f2f2f7;
  color: #c6c6c8;
  cursor: not-allowed;
}

/* 开关样式优化 */
.switch {
  position: relative;
  display: inline-block;
  width: 52px;
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
  background: #e5e5ea;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px;
}

.slider .on-icon,
.slider .off-icon {
  font-size: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.slider .on-icon {
  color: #fff;
  opacity: 0;
  transform: scale(0.8);
}

.slider .off-icon {
  color: #8e8e93;
  opacity: 1;
  transform: scale(0.8);
}

.switch input:checked + .slider {
  background: #007aff;
}

.switch input:checked + .slider .on-icon {
  opacity: 1;
  transform: scale(1);
}

.switch input:checked + .slider .off-icon {
  opacity: 0;
  transform: scale(0.6);
}

.slider::after {
  content: "";
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  top: 4px;
  left: 4px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch input:checked + .slider::after {
  transform: translateX(20px);
}

.switch input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 按钮样式 */
.actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px 24px;
  border-top: 1px solid #f2f2f7;
  background: #f8f8f8;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  min-height: 50px;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.1px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn:not(:disabled):active {
  transform: scale(0.98);
}

.btn.primary {
  background: #007aff;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.btn.primary:not(:disabled):hover {
  background: #0056cc;
}

.btn.secondary {
  background: #fff;
  color: #007aff;
  border: 1.5px solid #c6c6c8;
}

.btn.secondary:not(:disabled):hover {
  background: #f2f2f7;
}

/* 保存按钮状态 */
.save-btn.loading {
  background: #007aff;
}

.save-btn.success {
  background: #34c759;
  box-shadow: 0 2px 8px rgba(52, 199, 89, 0.3);
}

.save-btn.error {
  background: #ff3b30;
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.3);
}

/* 移动端适配 */
@media (max-width: 480px) {
  .auto-modal-backdrop {
    padding: 16px;
    align-items: center;
  }

  .auto-modal {
    max-width: none;
    max-height: calc(100vh - 32px);
  }

  .card {
    border-radius: 20px;
  }

  .modal-header {
    padding: 20px 20px 16px;
  }

  .form-section {
    padding: 16px 20px;
  }

  .actions {
    padding: 16px 20px 20px;
  }

  .modal-title {
    font-size: 18px;
  }

  .input,
  .select,
  .time-picker {
    padding: 16px;
    font-size: 16px;
  }

  .btn {
    min-height: 52px;
    font-size: 16px;
  }
}

@media (max-width: 360px) {
  .modal-header {
    padding: 16px 16px 12px;
  }

  .form-section {
    padding: 12px 16px;
    gap: 16px;
  }

  .actions {
    padding: 16px;
    flex-direction: column;
    gap: 10px;
  }

  .switch-field {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

/* 滚动条样式 */
.card::-webkit-scrollbar {
  width: 4px;
}

.card::-webkit-scrollbar-track {
  background: transparent;
}

.card::-webkit-scrollbar-thumb {
  background: #c6c6c8;
  border-radius: 2px;
}

.card::-webkit-scrollbar-thumb:hover {
  background: #8e8e93;
}
</style>
