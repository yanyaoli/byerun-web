<template>
  <div v-if="visibleRef" class="auto-modal-backdrop">
    <div class="auto-modal" :aria-busy="loading">
      <div class="form card">
        <!-- loading overlay shown when fetching or submitting (scoped to the card) -->
        <div v-if="loading" class="modal-loading-overlay">
          <div class="loader">
            <i class="fa-solid fa-spinner fa-spin fa-2x" aria-hidden="true"></i>
            <div class="loader-msg">{{ loadingMsg || "正在加载…" }}</div>
          </div>
        </div>
        <div class="modal-title-row">
          <h3 class="modal-title">定时任务配置</h3>
          <span class="badge beta">beta</span>
        </div>
        <p class="modal-subtitle">此功能仍在测试中，可能存在不稳定性，欢迎反馈。</p>
        <label><i class="fa-solid fa-map-location-dot"></i> 校区地图</label>
        <select v-model="map_id" class="select" :disabled="loading">
          <option value="cuit_hkg">成都信息工程大学（航空港校区）</option>
          <option value="cuit_lqy">成都信息工程大学（龙泉驿校区）</option>
          <option value="cdutcm_wj">成都中医药大学（温江校区）</option>
          <option value="ncwsxx">南充卫生学校</option>
          <option value="sctbc">四川工商职业技术学院</option>
        </select>

        <label><i class="fa-solid fa-route"></i> 最低里程（米）</label>
        <input
          class="input"
          type="number"
          v-model.number="min_distance_m"
          min="1"
          max="100000"
          :disabled="loading"
        />

        <label><i class="fa-solid fa-clock"></i> 每日运行时间（时:分）</label>
        <div class="time-row">
          <input
            class="time-picker"
            type="time"
            v-model="timeStr"
            :disabled="loading"
          />
        </div>
        <label><i class="fa-solid fa-toggle-on"></i> 启用定时任务</label>
        <div>
          <label class="switch">
            <input type="checkbox" v-model="enabled" :disabled="loading" />
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
          :disabled="loading"
        >
          <i v-if="buttonState === 'idle'" class="fa-solid fa-floppy-disk" aria-hidden="true"></i>
          <i v-else-if="buttonState === 'loading'" class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
          <i v-else-if="buttonState === 'success'" class="fa-solid fa-check" aria-hidden="true"></i>
          <i v-else-if="buttonState === 'error'" class="fa-solid fa-xmark" aria-hidden="true"></i>
          <span class="save-text">{{ saveButtonText }}</span>
        </button>
        <button class="btn" @click="close" :disabled="loading">
          <i class="fa-solid fa-xmark"></i> 取消
        </button>
      </div>
      </div>

      <!-- message display removed: status is shown on the save button now -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, toRef, watch, computed } from "vue";
import { config } from "../utils/config";

const props = defineProps({ visible: Boolean });
const emit = defineEmits(["update:visible", "saved"]);

// use parent's visible prop (toRef keeps reactivity) so modal only shows when parent toggles it
const visibleRef = toRef(props, "visible");
const token = ref("");
// map_id 对应前端下拉
const map_id = ref("cuit_hkg");
// 最低里程（米）
const min_distance_m = ref(2000);
// time string in HH:MM (24h) for convenience
const timeStr = ref<string>("08:00");
const hour = ref<number>(8);
const minute = ref<number>(0);
// only hour/minute are needed for cron
// enabled: 0/1
const enabled = ref<boolean>(false);
const loading = ref(false);
const loadingMsg = ref("");
// save button state: 'idle' | 'loading' | 'success' | 'error'
const buttonState = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
const saveButtonText = computed(() => {
  if (buttonState.value === 'loading') return '保存中...';
  if (buttonState.value === 'success') return '保存成功';
  if (buttonState.value === 'error') return '保存失败';
  return '保存';
});


onMounted(() => {
  try {
    const t = localStorage.getItem("token");
    if (t) token.value = t;
  } catch (e) {}
});

// 当可见性变化为 true 时，尝试从后端读取配置
watch(visibleRef, async (v) => {
  if (!v) return;
  // try to fetch config
  loadingMsg.value = "正在加载配置…";
  loading.value = true;
  try {
    const userId = localStorage.getItem("userId");
    const base = config.api.autorunServerBase || "http://localhost:8080";
    const headers: any = { "content-type": "application/json" };
    if (token.value) headers["Token"] = token.value;
    const params = userId ? `?userid=${encodeURIComponent(userId)}` : "";
    const res = await fetch(
      base.replace(/\/$/, "") + "/api/autorun/config" + params,
      { method: "GET", headers }
    );
    let json: any = null;
    if (res.ok) {
      json = await res.json();
      // expect json to contain fields map_id,min_distance_m,cron,enabled
      if (json) {
        if (json.map_id) map_id.value = json.map_id;
        if (typeof json.min_distance_m !== "undefined")
          min_distance_m.value =
            Number(json.min_distance_m) || min_distance_m.value;
        if (json.cron) {
          // parse cron: minute hour ... and set timeStr
          const parts = String(json.cron).split(/\s+/);
          if (parts.length >= 2) {
            minute.value = parts[0] === "*" ? 0 : Number(parts[0]) || 0;
            hour.value = parts[1] === "*" ? 0 : Number(parts[1]) || 0;
            // format HH:MM
            const hh = String(hour.value).padStart(2, "0");
            const mm = String(minute.value).padStart(2, "0");
            timeStr.value = `${hh}:${mm}`;
          }
        }
        if (typeof json.enabled !== "undefined")
          enabled.value = Number(json.enabled) === 1;
      }
    }
    // if no cron provided by backend, default to current time
    if (!json || !json.cron) {
      const now = new Date();
      timeStr.value = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      hour.value = now.getHours();
      minute.value = now.getMinutes();
    }
  } catch (e) {
    console.warn("fetch autorun config failed", e);
  } finally {
    // small delay so spinner is visible even for very fast responses
    setTimeout(() => {
      loading.value = false;
      loadingMsg.value = "";
    }, 180);
  }
});

function close() {
  emit("update:visible", false);
}

async function submit() {
  // show modal-wide loading overlay during submit
  loadingMsg.value = "正在保存…";
  loading.value = true;
  // set button loading state
  buttonState.value = 'loading';
  
  try {
    // 不再在提交前请求 token/user 信息；token 会放在 header 中（从 localStorage 读取）

    // validate min_distance_m range
    if (
      !Number.isInteger(Number(min_distance_m.value)) ||
      min_distance_m.value < 1 ||
      min_distance_m.value > 100000
    ) {
      throw new Error("min_distance_m out of range");
    }

    // parse timeStr HH:MM to hour/minute
    if (!timeStr.value || !/^\d{2}:\d{2}$/.test(timeStr.value))
      throw new Error("time_invalid");
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
    )
      throw new Error("time_invalid");
    hour.value = hh;
    minute.value = mm;
    const cronStr = `${minute.value} ${hour.value} * * *`;
    const body: any = {
      cron: cronStr,
      enabled: enabled.value ? 1 : 0,
      map_id: map_id.value,
      min_distance_m: Number(min_distance_m.value),
    };

    // determine backend base URL: prefer window var, fallback to default localhost:8080
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
    // expected success shape: { ok: true } and on config request will return {cron, enabled, map_id, min_distance_m}
    if (resp && resp.ok === true) {
      // button success state
      buttonState.value = 'success';
      // if backend returned config fields, update UI
      if (typeof resp.map_id !== "undefined") map_id.value = resp.map_id;
      if (typeof resp.min_distance_m !== "undefined")
        min_distance_m.value =
          Number(resp.min_distance_m) || min_distance_m.value;
      if (typeof resp.cron !== "undefined") {
        const parts = String(resp.cron).split(/\s+/);
        if (parts.length >= 2) {
          minute.value = parts[0] === "*" ? 0 : Number(parts[0]) || 0;
          hour.value = parts[1] === "*" ? 0 : Number(parts[1]) || 0;
          timeStr.value = `${String(hour.value).padStart(2, "0")}:${String(
            minute.value
          ).padStart(2, "0")}`;
        }
      }
      if (typeof resp.enabled !== "undefined")
        enabled.value = Number(resp.enabled) === 1;
      emit("saved");
      // do not auto-close modal on success per request
    } else {
      // try to surface backend returned message
      // button error state
      buttonState.value = 'error';
    }
  } catch (e) {
    console.error(e);
    if ((e as any).message === "min_distance_m out of range") {
      // button error state
      buttonState.value = 'error';
    } else {
      // button error state
      buttonState.value = 'error';
    }
  } finally {
    // ensure spinner is visible briefly for better UX
    setTimeout(() => {
      loading.value = false;
      loadingMsg.value = "";
      // after short delay, revert button state to idle so user can retry
      setTimeout(() => {
        buttonState.value = 'idle';
      }, 900);
    }, 180);
  }
}
</script>

<script lang="ts">
// provide a default export so some TypeScript setups recognize this SFC as having a default export
export default {} as any;
</script>

<style scoped>
.auto-modal-backdrop {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  /* semi-transparent dark overlay + blur the page behind the modal */
  background: rgba(0, 0, 0, 0.36);
  -webkit-backdrop-filter: blur(1px);
  backdrop-filter: blur(1px);
  /* ensure this backdrop sits above other UI like Message (z-index:10000) */
  z-index: 11000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.auto-modal {
  background: transparent;
  padding: 14px;
  border-radius: 8px;
  width: 92vw;
  max-width: 420px;
  margin: 0 16px;
  box-sizing: border-box;
  /* keep modal content above the backdrop and allow absolutely positioned children */
  position: relative;
  z-index: 11010;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.form label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 14px;
  color: #334155;
}
.card {
  background: linear-gradient(180deg, #ffffff, #fbfdff);
  padding: 14px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
  /* make card a positioning context for the loading overlay */
  position: relative;
}
/* modal title and badge */
.modal-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  margin-bottom: 6px;
}
.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  text-align: center;
}
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}
.badge.beta {
  background: #f8fafc;
  color: #0366d6;
  border: 1px solid rgba(3,102,214,0.08);
}
.modal-subtitle {
  margin: -10px 0 8px 0;
  font-size: 12px;
  color: #667085;
  text-align: center;
}
.time-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
/* use a dedicated class so we don't affect other inputs */
.time-picker {
  width: 140px;
  min-width: 120px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #e6eef6;
  background: #fff;
}
.input {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e6eef6;
  background: #fff;
}
.select {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e6eef6;
  background: #fff;
}
.actions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}
.btn {
  flex: 1;
  padding: 10px 12px;
  border-radius: 20px;
  border: none;
  background: #f3f3f3;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}
.btn.primary {
  background: #0366d6;
  color: #fff;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.message {
  margin-top: 8px;
  color: green;
}
.message.success {
  color: #059669;
  display: flex;
  align-items: center;
}
.message.error {
  color: #dc2626;
  display: flex;
  align-items: center;
}
.message.info {
  color: #0ea5e9;
  display: flex;
  align-items: center;
}
.hint {
  font-size: 12px;
  color: #667085;
}

/* save button enhanced visuals */
.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 220ms ease, transform 150ms ease, box-shadow 220ms ease;
}
.save-btn .save-text {
  transition: opacity 180ms ease, transform 180ms ease;
}
/* loading state */
.save-btn.loading {
  background: linear-gradient(90deg, #1e40af, #2563eb);
  box-shadow: 0 6px 14px rgba(37,99,235,0.14);
}
/* success state */
.save-btn.success {
  background: linear-gradient(90deg, #059669, #10b981);
  box-shadow: 0 6px 14px rgba(16,185,129,0.12);
}
/* error state */
.save-btn.error {
  background: linear-gradient(90deg, #dc2626, #ef4444);
  box-shadow: 0 6px 14px rgba(239,68,68,0.12);
}
/* subtle press effect */
.save-btn:active {
  transform: translateY(1px) scale(0.998);
}

/* custom switch */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
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
  background: #e6eef6;
  border-radius: 34px;
  /* animate background color smoothly */
  transition: background-color 220ms cubic-bezier(.2,.9,.2,1), box-shadow 220ms;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px;
  /* hint the browser for smoother animations */
  will-change: background-color, box-shadow;
}
.slider .on-icon {
  color: #10b981;
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 180ms ease, transform 180ms ease;
}
.slider .off-icon {
  color: #ef4444;
  opacity: 1;
  transform: scale(1);
  transition: opacity 180ms ease, transform 180ms ease;
}
.switch input:checked + .slider {
  background: linear-gradient(90deg, #34d399, #06b6d4);
  box-shadow: 0 4px 10px rgba(6, 182, 212, 0.12);
}
.switch input:checked + .slider .on-icon {
  opacity: 1;
  transform: scale(1);
}
.switch input:checked + .slider .off-icon {
  opacity: 0;
  transform: scale(0.85);
}
.switch .slider::after {
  content: "";
  position: absolute;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  top: 6px;
  left: 6px;
  /* smoother, snappier movement + hardware-accelerated transform */
  transition: transform 220ms cubic-bezier(.2,.9,.2,1), background-color 180ms;
  will-change: transform, background-color;
}
.switch input:checked + .slider::after {
  transform: translateX(26px) scale(1.02);
}

/* add active (pressed) state for better tactile feedback */
.switch:active .slider::after {
  transform: translateX(0) scale(0.96);
  /* when pressing, slightly darken the knob shadow to imply depth */
}

/* when input is focused (keyboard) show an outline for accessibility */
.switch input:focus + .slider {
  box-shadow: 0 0 0 3px rgba(16, 146, 255, 0.12);
}

@media (max-width: 420px) {
  .auto-modal {
    padding: 12px;
    width: 96vw;
  }
  /* on very small screens let the time picker take available width so HH:MM fits */
  .time-picker {
    width: 100%;
  }
}

/* loading overlay inside modal */
.modal-loading-overlay {
  /* now scoped to .card: cover only the card area */
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  /* overlay above card content but below any modal-level layers */
  z-index: 5;
  border-radius: 12px;
}
.modal-loading-overlay .loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #0f172a;
}
.modal-loading-overlay .fa-spinner {
  color: #2563eb;
}
.loader-msg {
  color: #0f172a;
  font-weight: 600;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
