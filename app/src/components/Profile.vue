<template>
  <div class="profile-container">
    <!-- 骨架屏加载状态 -->
    <div v-if="loading" class="profile-card">
      <div class="profile-header profile-header-flex">
        <div style="display: flex; align-items: center; gap: 16px">
          <div class="profile-avatar skeleton-avatar"></div>
          <div class="profile-info">
            <div class="skeleton-name"></div>
            <div class="skeleton-id"></div>
          </div>
        </div>
      </div>
    </div>
    <!-- 用户信息卡片 -->
    <div v-else class="profile-card">
      <div class="profile-header profile-header-flex">
        <div style="display: flex; align-items: center; gap: 16px">
          <div class="profile-avatar" v-if="userInfo?.gender == '2'">
            <!-- 女性头像SVG -->
            <FemaleAvatar />
          </div>
          <div class="profile-avatar" v-else-if="userInfo?.gender == '1'">
            <!-- 男性头像SVG -->
            <MaleAvatar />
          </div>
          <div class="profile-avatar" v-else>
            <!-- 默认头像，使用字母 -->
            {{ userInfo?.studentName?.charAt(0) || "U" }}
          </div>
          <div class="profile-info">
            <h2 class="profile-name">
              {{ userInfo?.studentName || "用户" }}
            </h2>
            <p class="profile-id">
              {{ userInfo?.registerCode || "-" }}
            </p>
          </div>
        </div>
        <button class="logout-button logout-plain" @click="handleLogout">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out" aria-hidden="true"><path d="m16 17 5-5-5-5"></path><path d="M21 12H9"></path><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path></svg>
        登出
        </button>
      </div>
    </div>
    <!-- 个人信息区块 -->
    <!-- <div class="info-section">
      <div class="info-table-card">
        <div class="info-table-header">
          <h3 class="section-title">个人信息</h3>
        </div>
        <div class="info-list info-table">
          <template v-if="loading">
            <div class="info-item" v-for="n in 3" :key="n">
              <span class="info-label">{{ getPersonalInfoLabel(n) }}</span>
              <span class="skeleton-value"></span>
            </div>
          </template>
          <template v-else>
            <div class="info-item">
              <span class="info-label">性别</span>
              <span class="info-value">{{
                userInfo?.gender == "1"
                  ? "男"
                  : userInfo?.gender == "2"
                  ? "女"
                  : "-"
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">生日</span>
              <span class="info-value">{{ userInfo?.birthday || "-" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">地址</span>
              <span class="info-value">{{ userInfo?.addrDetail || "-" }}</span>
            </div>
          </template>
        </div>
      </div>
    </div> -->
    <!-- 学校信息区块 -->
    <!-- <div class="info-section">
      <div class="info-table-card">
        <div class="info-table-header">
          <h3 class="section-title">学校信息</h3>
        </div>
        <div class="info-list info-table">
          <template v-if="loading">
            <div class="info-item" v-for="n in 5" :key="n">
              <span class="info-label">{{ getSchoolInfoLabel(n) }}</span>
              <span class="skeleton-value"></span>
            </div>
          </template>
          <template v-else>
            <div class="info-item">
              <span class="info-label">学校</span>
              <span class="info-value">{{ userInfo?.schoolName || "-" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">学院</span>
              <span class="info-value">{{ userInfo?.collegeName || "-" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">专业</span>
              <span class="info-value">{{ userInfo?.majorName || "-" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">班级</span>
              <span class="info-value">{{ userInfo?.className || "-" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">入学年份</span>
              <span class="info-value"
                >{{ userInfo?.startSchool || "-" }}年</span
              >
            </div>
          </template>
        </div>
      </div>
    </div> -->
    <!-- 社交链接 -->
    <div class="social-links">
      <a
        href="https://github.com/yanyaoli/byerun-web"
        target="_blank"
        rel="noopener noreferrer"
        class="social-link"
        title="GitHub 仓库"
      >
        <span><i class="fa-brands fa-github"></i></span>
      </a>
      <a href="mailto:esc@linux.do" class="social-link" title="发送邮件">
        <i class="fa-solid fa-envelope"></i>
      </a>
      <a
        href="https://redirect.where.nyc.mn/byerun-qqgroup"
        target="_blank"
        rel="noopener noreferrer"
        class="social-link"
        title="加入QQ群"
      >
        <i class="fa-brands fa-qq"></i>
      </a>
    </div>
    <!-- 评论区 -->
    <div class="comments-section">
      <div class="info-table-card">
        <div class="info-table-header">
          <h3 class="section-title">评论区</h3>
        </div>
        <div class="artalk-container" ref="artalkContainer"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import Artalk from "artalk";
import "artalk/dist/Artalk.css";
import MaleAvatar from "./Avatar/MaleAvatar.vue";
import FemaleAvatar from "./Avatar/FemaleAvatar.vue";
import { config } from "../utils/config";

defineProps({
  userInfo: Object,
  loading: Boolean
});

// 注入全局消息方法
const showMessage = inject('showMessage');
const artalkContainer = ref(null);

const emit = defineEmits(['logout']);

const handleLogout = () => {
  showMessage("已退出登录", "info");
  emit("logout");
};

onMounted(() => {
  if (artalkContainer.value) {
    new Artalk({
      el: artalkContainer.value,
      pageKey: "/profile",
      pageTitle: "个人主页",
      server: config.api.artalkServer || "https://artalk.example.com",
      site: config.api.artalkSite || "Byerun",
    });
  }
});
</script>

<style scoped>
.profile-page {
  background: #f6f7f9;
}

.profile-container {
  padding: 0px 16px;
}

.profile-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 30px;
  padding: 15px 20px;
  margin-bottom: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); */
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-avatar {
  width: 56px;
  height: 56px;
  background: #4f6d7a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  overflow: hidden;
  position: relative;
  transition: all 0.8s ease;
}

.profile-avatar:hover {
  transform: rotate(360deg);
}

.avatar-svg {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 20px;
  font-weight: 600;
  color: #2d3a3f;
  margin-bottom: 4px;
}

.profile-id {
  font-size: 15px;
  color: #7b8a8b;
}

/* 退出登录按钮 */

.logout-button {
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  outline: none;
}

/* plain风格 */
.logout-plain {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgb(254 242 242);
  color: rgb(220 38 38);
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  font-weight: 700;
  transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1), text-decoration-color 150ms cubic-bezier(0.4, 0, 0.2, 1), fill 150ms cubic-bezier(0.4, 0, 0.2, 1), stroke 150ms cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  outline: none;
  align-self: center;
  box-shadow: none;
}
.logout-plain:hover,
.logout-plain:focus {
  background-color: rgb(254 226 226);
  color: rgb(185 28 28);
  transform: none;
}

/* profile-header左右布局 */
.profile-header-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 信息区块 */
.info-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
  padding: 0;
}

.info-list {
  border-radius: 0 0 30px 30px;
  overflow: hidden;
  border: none;
  border-top: none;
  box-shadow: none;
  background: transparent;
}

.info-table-card {
  display: flex;
  flex-direction: column;
  border-radius: 30px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); */
}

.info-table-header {
  background: rgba(255, 255, 255, 0.05);
  padding: 14px 16px 10px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  border-radius: 30px 30px 0 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #e3e6e8;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 15px;
  color: #4f6d7a;
}

.info-value {
  font-size: 15px;
  color: #2d3a3f;
  font-weight: 500;
}

/* 骨架屏样式 */

.skeleton-container {
  padding: 16px;
}

.skeleton-header {
  display: flex;
  margin-bottom: 20px;
  padding: 14px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e3e6e8;
}

.skeleton-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #e3e6e8;
  margin-right: 14px;
  animation: pulse 1.5s infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.skeleton-info {
  flex: 1;
}

.skeleton-name {
  height: 22px;
  width: 50px;
  background: #e3e6e8;
  border-radius: 4px;
  margin-bottom: 8px;
  animation: pulse 1.5s infinite;
}

.skeleton-id {
  height: 15px;
  width: 80px;
  background: #e3e6e8;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.skeleton-card {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  border: 1px solid #e3e6e8;
}

.skeleton-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skeleton-label {
  display: inline-block;
}

.skeleton-value {
  height: 16px;
  width: 80px;
  background: #e3e6e8;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
  display: inline-block;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.skeleton-label {
  width: 60%;
  height: 14px;
  margin: 0 auto;
}

.skeleton-value {
  width: 60px;
  display: inline-block;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 社交链接样式 */
.social-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 10px 0 30px 0;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #4f6d7a;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); */
}

.social-link:hover {
  color: #3b9eff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #fff;
}

.icon {
  width: 24px;
  height: 24px;
}

/* 添加响应式适配 */
@media (max-width: 375px) {
  .social-links {
    gap: 16px;
    padding: 16px 0;
  }

  .social-link {
    width: 36px;
    height: 36px;
  }

  .icon {
    width: 20px;
    height: 20px;
  }
}

/* 评论区样式 */
.comments-section {
  margin-bottom: 20px;
}

.artalk-container {
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); */
}

.atk-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* 确保评论区内的输入框和按钮不会被scoped样式影响 */
:deep(.artalk-editor-textarea),
:deep(.artalk-send-btn) {
  border-radius: 8px;
}
</style>