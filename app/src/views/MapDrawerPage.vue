<template>
  <div class="map-drawer-page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <button type="button" class="btn-back" @click="goBack" title="返回">
        <i class="ri-arrow-left-line"></i>
        返回
      </button>
      <h1 class="header-title">绘制路线</h1>
      <div class="header-actions">
        <button
          type="button"
          class="btn-confirm"
          @click="openCompleteDialog"
          :disabled="mapDrawerTrack.length < 2"
        >
          <i class="ri-check-line"></i>
          完成（{{ mapDrawerTrack.length }}）
        </button>
      </div>
    </div>

    <!-- 地图绘制组件 -->
    <div class="drawer-container">
      <MapDrawer
        :initial-track="initialTrack"
        @track-changed="onMapTrackChanged"
        @track-saved="onMapTrackSaved"
      />
    </div>

    <Teleport v-if="showCompleteDialog" to="body">
      <div class="complete-dialog-mask">
        <div class="complete-dialog-card">
          <h3 class="complete-dialog-title">完成绘制</h3>
          <p class="complete-dialog-desc">请选择保存方式：保存到本地地图，或导出为 JSON 文件后返回。</p>
          <div class="complete-dialog-group">
            <label class="complete-dialog-label">地图名称（保存到本地）</label>
            <input
              v-model.trim="saveMapName"
              type="text"
              class="complete-dialog-input"
              placeholder="例如：手绘路线 1"
            />
          </div>
          <div class="complete-dialog-actions">
            <button type="button" class="complete-btn complete-btn-cancel" @click="showCompleteDialog = false">
              取消
            </button>
            <button type="button" class="complete-btn complete-btn-export" @click="exportAndBack">
              导出 JSON 并返回
            </button>
            <button type="button" class="complete-btn complete-btn-save" @click="saveToLocalAndBack">
              保存到本地并返回
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, inject, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { saveCustomMap } from '@/utils/map';

const MapDrawer = defineAsyncComponent(() => import('@/components/MapDrawer.vue'));
const router = useRouter();
const showMessage = inject('showMessage', null);

const mapDrawerTrack = ref([]);
const initialTrack = ref([]);
const showCompleteDialog = ref(false);
const saveMapName = ref('');
const editCustomMapId = ref('');

// 获取来自上一个页面的初始轨迹
if (router.currentRoute.value.query.track) {
  try {
    initialTrack.value = JSON.parse(router.currentRoute.value.query.track);
  } catch (e) {
    console.error('Failed to parse track data:', e);
  }
}

function onMapTrackChanged(track) {
  mapDrawerTrack.value = track;
}

function onMapTrackSaved(trackData) {
  // 轨迹已导出，无需额外操作
}

if (router.currentRoute.value.query.editCustomMapId) {
  editCustomMapId.value = String(router.currentRoute.value.query.editCustomMapId || '').trim();
}

if (router.currentRoute.value.query.editCustomMapName) {
  saveMapName.value = String(router.currentRoute.value.query.editCustomMapName || '').trim();
}

function showToast(message, type = 'info') {
  if (typeof showMessage === 'function') {
    showMessage(message, type);
  }
}

function goBack() {
  router.back();
}

function openCompleteDialog() {
  if (mapDrawerTrack.value.length < 2) {
    return;
  }

  if (!saveMapName.value) {
    saveMapName.value = `手绘路线-${new Date().toLocaleString().replace(/[\s/:]/g, '-')}`;
  }
  showCompleteDialog.value = true;
}

function getManualTrack() {
  const manualTrack = mapDrawerTrack.value.map((p) => [p[1], p[0]]);
  return manualTrack;
}

function persistResultAndBack(customRoute = '') {
  const manualTrack = getManualTrack();
  const selectedCustomRoute = String(customRoute || '').trim();
  sessionStorage.setItem(
    '_map_drawer_result',
    JSON.stringify({
      track: manualTrack,
      customRoute: selectedCustomRoute,
    }),
  );
  showCompleteDialog.value = false;
  router.back();
}

function exportTrackJson(points) {
  const data = points.map((p) => `${p[1].toFixed(6)},${p[0].toFixed(6)}`);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `track-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function saveToLocalAndBack() {
  if (mapDrawerTrack.value.length < 2) return;
  const mapName = saveMapName.value || `手绘路线-${Date.now()}`;
  const data = mapDrawerTrack.value.map((p) => `${p[1]},${p[0]}`);
  const savedMapId = saveCustomMap(editCustomMapId.value, mapName, data);
  const selectedCustomRoute = savedMapId ? `custom_${savedMapId}` : '';
  showToast(editCustomMapId.value ? '已更新本地地图' : '已保存到本地地图', 'success');
  persistResultAndBack(selectedCustomRoute);
}

function exportAndBack() {
  if (mapDrawerTrack.value.length < 2) return;
  exportTrackJson(mapDrawerTrack.value);
  showToast('已导出 JSON 文件', 'success');
  persistResultAndBack();
}
</script>

<style scoped>
.map-drawer-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: #0f172a;
  color: #f1f5f9;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  flex-shrink: 0;
  gap: 16px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  color: #cbd5e1;
  border: 1px solid #334155;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-back:hover {
  background: #334155;
  color: #f1f5f9;
  border-color: #475569;
}

.btn-back i {
  font-size: 16px;
}

.header-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: #f8fafc;
  text-align: center;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-confirm {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-confirm:hover:not(:disabled) {
  background: #2563eb;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-confirm i {
  font-size: 16px;
}

.drawer-container {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.complete-dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(2, 6, 23, 0.68);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.complete-dialog-card {
  width: min(520px, 100%);
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 12px 40px rgba(2, 6, 23, 0.45);
}

.complete-dialog-title {
  margin: 0;
  color: #f8fafc;
  font-size: 18px;
  font-weight: 600;
}

.complete-dialog-desc {
  margin: 10px 0 14px;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.5;
}

.complete-dialog-group {
  margin-bottom: 14px;
}

.complete-dialog-label {
  display: block;
  font-size: 13px;
  margin-bottom: 6px;
  color: #cbd5e1;
}

.complete-dialog-input {
  width: 100%;
  box-sizing: border-box;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  color: #f1f5f9;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
}

.complete-dialog-input:focus {
  border-color: #38bdf8;
}

.complete-dialog-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.complete-btn {
  border: none;
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.complete-btn-cancel {
  background: #334155;
  color: #e2e8f0;
}

.complete-btn-export {
  background: #2563eb;
  color: #fff;
}

.complete-btn-save {
  background: #0ea5e9;
  color: #082f49;
}

/* 响应式 */
@media (max-width: 640px) {
  .header {
    height: 48px;
    padding: 0 12px;
    gap: 12px;
  }

  .btn-back {
    padding: 6px 10px;
    font-size: 13px;
  }

  .header-title {
    font-size: 16px;
  }

  .btn-confirm {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
