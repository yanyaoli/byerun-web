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
          <div class="modal-title-row">
            <h3 class="modal-title">定时任务配置</h3>
            <span class="badge beta">beta</span>
          </div>
          <p class="modal-subtitle">此功能仍在测试中，可能存在不稳定性，欢迎反馈。</p>

          <div class="form-field">
            <label><i class="fa-solid fa-map-location-dot"></i> 校区地图</label>
            <select v-model="map_id" class="select" :disabled="submitting">
              <option value="cuit_hkg">成都信息工程大学（航空港校区）</option>
              <option value="cuit_lqy">成都信息工程大学（龙泉驿校区）</option>
              <option value="cdutcm_wj">成都中医药大学（温江校区）</option>
              <option value="ncwsxx">南充卫生学校</option>
              <option value="sctbc">四川工商职业技术学院</option>
            </select>
          </div>

          <div class="form-field">
            <label><i class="fa-solid fa-route"></i> 最低里程（米）</label>
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
            <label><i class="fa-solid fa-clock"></i> 每日运行时间</label>
            <input
              class="time-picker"
              type="time"
              v-model="timeStr"
              :disabled="submitting"
            />
          </div>

          <div class="form-field switch-field">
            <label><i class="fa-solid fa-toggle-on"></i> 启用定时任务</label>
            <label class="switch">
              <input type="checkbox" v-model="enabled" :disabled="submitting" />
              <span class="slider">
                <i class="fa-solid on-icon fa-check"></i>
                <i class="fa-solid off-icon fa-xmark"></i>
              </span>
            </label>
          </div>

          <div class="actions">
            <button
              class="btn primary save-btn"
              :class="buttonState"
              @click="submit"
              :disabled="submitting"
            >
              <i v-if="buttonState === 'idle'" class="fa-solid fa-floppy-disk" aria-hidden="true"></i>
              <i v-else-if="buttonState === 'loading'" class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
              <i v-else-if="buttonState === 'success'" class="fa-solid fa-check" aria-hidden="true"></i>
              <i v-else-if="buttonState === 'error'" class="fa-solid fa-xmark" aria-hidden="true"></i>
              <span class="save-text">{{ saveButtonText }}</span>
            </button>
            <button class="btn" @click="close" :disabled="submitting">
              <i class="fa-solid fa-xmark"></i> 取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, toRef, watch, computed } from "vue";
import { config } from "../utils/config";

const props = defineProps({ visible: Boolean });
const emit = defineEmits(["update:visible", "saved"]);

const visibleRef = toRef(props, "visible");
const token = ref("");
const map_id = ref("cuit_hkg");
const min_distance_m = ref(2000);
const timeStr = ref<string>("08:00");
const hour = ref<number>(8);
const minute = ref<number>(0);
const enabled = ref<boolean>(false);

// 分离加载状态：loading用于初始数据加载，submitting用于提交过程
const loading = ref(false);
const submitting = ref(false);
const buttonState = ref<'idle' | 'loading' | 'success' | 'error'>('idle');

const saveButtonText = computed(() => {
  const texts = {
    'loading': '保存中...',
    'success': '保存成功',
    'error': '保存失败',
    'idle': '保存'
  };
  return texts[buttonState.value];
});

onMounted(() => {
  try {
    const t = localStorage.getItem("token");
    if (t) token.value = t;
  } catch (e) {}
});

// 简化配置加载逻辑
watch(visibleRef, async (v) => {
  if (!v) return;
  
  loading.value = true;
  try {
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

async function fetchConfig() {
  const userId = localStorage.getItem("userId");
  const base = config.api.autorunServerBase || "http://localhost:8080";
  const headers: any = { "content-type": "application/json" };
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

function applyConfig(json: any) {
  if (json.map_id) map_id.value = json.map_id;
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
  buttonState.value = 'loading';
  
  try {
    if (!validateForm()) {
      throw new Error("表单验证失败");
    }

    const body = buildRequestBody();
    const result = await saveConfig(body);
    
    if (result) {
      buttonState.value = 'success';
      emit("saved");
    } else {
      buttonState.value = 'error';
    }
  } catch (e) {
    console.error(e);
    buttonState.value = 'error';
  } finally {
    submitting.value = false;
    setTimeout(() => {
      buttonState.value = 'idle';
    }, 1500);
  }
}

function validateForm(): boolean {
  if (!Number.isInteger(Number(min_distance_m.value)) ||
      min_distance_m.value < 1 ||
      min_distance_m.value > 100000) {
    return false;
  }

  if (!timeStr.value || !/^\d{2}:\d{2}$/.test(timeStr.value)) {
    return false;
  }
  
  const [hhStr, mmStr] = timeStr.value.split(":");
  const hh = Number(hhStr);
  const mm = Number(mmStr);
  
  return Number.isInteger(hh) && hh >= 0 && hh <= 23 &&
         Number.isInteger(mm) && mm >= 0 && mm <= 59;
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

async function saveConfig(body: any) {
  const base = config.api.autorunServerBase || "http://localhost:8080";
  const headers: any = { "content-type": "application/json" };
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

<script lang="ts">
export default {} as any;
</script>

<style scoped>
.auto-modal-backdrop {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.auto-modal {
  background: transparent;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.card {
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

/* 骨架屏样式 */
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-title {
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 12px;
  animation: skeleton-loading 1.5s infinite;
  width: 60%;
  margin: 0 auto;
}

.skeleton-subtitle {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  animation: skeleton-loading 1.5s infinite;
  width: 80%;
  margin: -8px auto 8px;
}

.skeleton-field {
  height: 44px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 12px;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-switch {
  height: 34px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 17px;
  animation: skeleton-loading 1.5s infinite;
  width: 60px;
  align-self: flex-start;
}

.skeleton-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.skeleton-button {
  flex: 1;
  height: 44px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 22px;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-button.primary {
  background: linear-gradient(90deg, #e0e8ff 25%, #d0d8ff 50%, #e0e8ff 75%);
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
  gap: 16px;
}

.modal-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 4px;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.badge.beta {
  background: #f0f7ff;
  color: #0366d6;
  border: 1px solid rgba(3, 102, 214, 0.2);
}

.modal-subtitle {
  margin: -4px 0 8px 0;
  font-size: 13px;
  color: #666;
  text-align: center;
  line-height: 1.4;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-field label i {
  color: #0366d6;
  width: 16px;
  text-align: center;
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
  padding: 12px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  background: #fff;
  font-size: 15px;
  color: #1a1a1a;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.input:focus,
.select:focus,
.time-picker:focus {
  outline: none;
  border-color: #0366d6;
  box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.1);
}

.input:disabled,
.select:disabled,
.time-picker:disabled {
  background: #f8f9fa;
  color: #999;
  cursor: not-allowed;
}

/* 开关样式优化 */
.switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
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
  background: #e9ecef;
  border-radius: 28px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px;
}

.slider .on-icon,
.slider .off-icon {
  font-size: 10px;
  transition: all 0.3s ease;
}

.slider .on-icon {
  color: #10b981;
  opacity: 0;
  transform: scale(0.8);
}

.slider .off-icon {
  color: #6c757d;
  opacity: 1;
  transform: scale(0.8);
}

.switch input:checked + .slider {
  background: linear-gradient(135deg, #10b981, #059669);
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
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  top: 4px;
  left: 4px;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch input:checked + .slider::after {
  transform: translateX(24px);
}

.switch input:disabled + .slider {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 按钮样式 */
.actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  min-height: 44px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn:not(:disabled):active {
  transform: translateY(1px);
}

.btn.primary {
  background: linear-gradient(135deg, #0366d6, #0256b8);
  color: white;
  box-shadow: 0 2px 8px rgba(3, 102, 214, 0.3);
}

.btn:not(.primary) {
  background: #f8f9fa;
  color: #495057;
  border: 2px solid #e9ecef;
}

/* 保存按钮状态 */
.save-btn.loading {
  background: linear-gradient(135deg, #1e40af, #1d4ed8);
}

.save-btn.success {
  background: linear-gradient(135deg, #059669, #047857);
}

.save-btn.error {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

/* 移动端适配 */
@media (max-width: 480px) {
  .auto-modal-backdrop {
    padding: 12px;
    align-items: flex-end;
  }
  
  .auto-modal {
    max-width: none;
  }
  
  .card {
    border-radius: 20px 20px 16px 16px;
    padding: 24px 20px 20px;
  }
  
  .modal-title {
    font-size: 17px;
  }
  
  .input,
  .select,
  .time-picker {
    padding: 14px;
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  .btn {
    min-height: 48px;
    font-size: 16px;
  }
  
  .actions {
    gap: 10px;
  }
}

@media (max-width: 360px) {
  .card {
    padding: 20px 16px 16px;
  }
  
  .switch-field {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>