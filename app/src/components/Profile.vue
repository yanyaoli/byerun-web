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
          登出
        </button>
      </div>
    </div>
    <!-- 个人信息区块 -->
    <div class="info-section">
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
    </div>
    <!-- 学校信息区块 -->
    <div class="info-section">
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
    </div>
    <!-- 社交链接 -->
    <div class="social-links">
      <a
        href="https://github.com/yanyaoli/byerun-web"
        target="_blank"
        rel="noopener noreferrer"
        class="social-link"
        title="GitHub 仓库"
      >
        <svg
          t="1752933900476"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="25544"
          width="200"
          height="200"
        >
          <path
            d="M871.374 239.304c15.15-49.778 12.986-101.72-6.493-155.826l-19.478-16.232c-8.657-4.329-24.889-4.329-48.696 0-34.628 8.657-73.585 27.053-116.87 55.188-90.899-21.643-180.715-21.643-269.449 0C364.939 94.3 324.9 76.986 290.272 70.493c-21.642-2.164-36.792-1.082-45.449 3.246l-19.478 12.986c-19.478 45.449-23.807 96.309-12.986 152.58-36.792 43.285-55.188 95.227-55.188 155.826 0 93.063 27.053 165.565 81.159 217.507 36.792 36.792 89.816 61.681 159.072 74.667-15.15 28.135-20.56 57.353-16.232 87.652v12.985c-45.449 10.821-82.242 8.657-110.377-6.493-17.314-8.657-36.792-27.053-58.435-55.188l-3.246-6.493c-15.15-17.314-25.971-29.217-32.464-35.71-15.15-10.821-30.3-17.314-45.449-19.478-6.493-4.328-12.986-4.328-19.478 0-6.493 4.328-10.821 9.739-12.986 16.232-2.164 6.493-1.623 12.986 1.623 19.478s7.034 10.821 11.362 12.986c6.493 2.164 13.527 6.493 21.101 12.985 7.575 6.493 16.773 16.232 27.594 29.217l3.246 3.246c17.314 23.807 31.382 40.039 42.203 48.696 19.478 17.314 41.121 29.217 64.928 35.71 28.135 8.657 60.599 8.657 97.391 0v84.406c0 8.657 3.246 16.232 9.739 22.725 6.493 6.493 13.527 9.739 21.101 9.739s14.609-3.246 21.101-9.739c6.493-6.493 8.657-14.068 6.493-22.725v-152.58c-2.164-32.464 8.657-59.517 32.464-81.159l-16.232-48.696c-47.614-6.493-85.488-16.232-113.623-29.217-38.957-17.314-67.092-42.203-84.406-74.667-23.807-36.792-35.71-86.57-35.71-149.333 0-21.643 4.87-43.826 14.609-66.551s23.266-42.744 40.58-60.058l9.739-29.217c-15.15-34.628-16.232-72.502-3.246-113.623 23.807 0 63.845 17.314 120.116 51.942l22.725 6.493c88.734-23.807 177.469-23.807 266.203 0l22.725-6.493c41.121-28.135 80.077-46.531 116.87-55.188 12.986 38.957 11.903 75.749-3.246 110.377l6.493 32.464c34.628 36.792 51.942 78.995 51.942 126.609 0 62.763-11.903 113.623-35.71 152.58-19.478 32.464-47.614 56.271-84.406 71.42-28.135 12.985-66.01 22.725-113.623 29.217l-16.232 45.449c10.821 12.986 18.937 26.512 24.348 40.58 5.411 14.068 7.034 29.758 4.87 47.073V924.29c0 8.657 2.705 15.691 8.116 21.101s11.903 8.116 19.478 8.116c7.575 0 14.068-2.705 19.478-8.116s8.116-12.444 8.116-21.101V774.957c0-36.792-6.493-66.01-19.478-87.652 69.256-10.821 123.362-34.628 162.319-71.42 49.778-51.942 74.667-126.609 74.667-224-0.001-58.436-18.397-109.296-55.189-152.581z"
            p-id="25545"
            fill="#2c2c2c"
          ></path>
        </svg>
      </a>
      <a href="mailto:esc@linux.do" class="social-link" title="发送邮件">
        <svg
          t="1752933842153"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="23488"
          width="200"
          height="200"
        >
          <path
            d="M789.333333 128a170.666667 170.666667 0 0 1 170.666667 170.666667v426.666666a170.666667 170.666667 0 0 1-170.666667 170.666667H234.666667a170.666667 170.666667 0 0 1-170.666667-170.666667V298.666667a170.666667 170.666667 0 0 1 170.666667-170.666667h554.666666z m106.666667 243.797333l-310.613333 147.925334a170.666667 170.666667 0 0 1-146.773334 0L128 371.797333V725.333333a106.666667 106.666667 0 0 0 102.037333 106.56L234.666667 832h554.666666a106.666667 106.666667 0 0 0 106.56-102.037333L896 725.333333V371.797333zM789.333333 192H234.666667a106.666667 106.666667 0 0 0-106.56 102.037333L128 300.928l338.133333 161.024a106.666667 106.666667 0 0 0 86.549334 2.282667l5.184-2.282667L896 300.906667V298.666667a106.666667 106.666667 0 0 0-102.037333-106.56L789.333333 192z"
            fill="#2c2c2c"
            p-id="23489"
          ></path>
        </svg>
      </a>
      <a
        href="https://redirect.where.nyc.mn/byerun-qqgroup"
        target="_blank"
        rel="noopener noreferrer"
        class="social-link"
        title="加入QQ群"
      >
        <svg
          t="1752933785336"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="18923"
          width="200"
          height="200"
        >
          <path
            d="M683.690667 948.6336c60.416 0 106.564267-25.941333 110.114133-53.6576 2.321067-18.8416-17.066667-40.277333-60.757333-58.231467a25.6 25.6 0 0 1-10.6496-39.253333c16.042667-20.957867 29.9008-47.240533 38.434133-72.9088a25.6 25.6 0 0 1 45.192533-6.690133c15.291733 21.7088 26.4192 30.173867 39.594667 30.173866 2.048 0 3.822933-0.2048 6.007467-0.682666 2.048-0.273067 4.437333-2.321067 7.9872-10.376534 15.9744-36.317867 10.376533-113.0496-14.336-152.234666l-2.798934-4.5056a1285.9392 1285.9392 0 0 0-39.5264-60.6208 25.6 25.6 0 0 1-1.024-27.8528c2.8672-4.9152 4.3008-13.038933 4.3008-26.077867 0-22.050133-4.096-31.061333-13.789866-38.229333a25.6 25.6 0 0 1-10.4448-22.254934c0.4096-6.212267 0.477867-11.8784 0.4096-23.620266l-0.068267-7.9872c0-143.906133-119.808-261.256533-267.127467-261.256534-149.0944 0-265.352533 114.619733-265.352533 261.256534 0 9.898667 0.682667 20.48 2.2528 32.221866a25.6 25.6 0 0 1-9.352533 23.210667c-12.629333 10.171733-18.6368 22.3232-18.6368 36.6592 0 7.099733 3.208533 17.681067 9.079466 30.3104 4.369067 9.352533 2.730667 20.48-4.232533 28.0576-20.002133 21.9136-33.450667 39.7312-43.485867 59.8016-26.965333 53.998933-31.607467 120.149333-16.5888 152.098133 3.754667 8.192 7.099733 10.8544 10.376534 11.605334 8.533333 2.048 21.2992-6.485333 44.2368-34.133334a25.6 25.6 0 0 1 44.2368 9.079467c7.714133 26.077867 21.2992 52.0192 39.185066 74.410667 10.717867 13.448533 5.393067 33.450667-10.581333 39.799466-44.032 17.339733-68.8128 41.437867-65.809067 61.44 4.642133 31.675733 63.556267 55.978667 141.653334 47.5136 44.919467-4.846933 82.875733-22.391467 103.8336-46.762666a25.6 25.6 0 0 1 27.170133-7.714134 44.782933 44.782933 0 0 0 24.439467 0.273067 25.6 25.6 0 0 1 26.897066 7.031467c21.572267 23.552 55.0912 40.277333 95.8464 47.240533 10.922667 1.911467 22.186667 2.8672 33.314134 2.8672z m160.904533-47.240533c-7.509333 58.9824-77.824 98.440533-160.904533 98.440533-13.994667 0-28.125867-1.2288-41.915734-3.549867-45.6704-7.7824-85.333333-25.941333-114.414933-52.6336a98.986667 98.986667 0 0 1-23.210667-0.068266c-30.583467 28.672-75.776 47.5136-126.429866 53.0432-101.853867 10.990933-188.074667-24.576-197.8368-90.999467-6.417067-42.734933 21.7088-77.960533 68.4032-103.082667a276.48 276.48 0 0 1-14.267734-25.8048c-22.050133 19.456-42.325333 26.555733-66.696533 20.6848-18.432-4.369067-34.542933-17.544533-44.8512-39.799466-22.050133-47.172267-16.315733-129.4336 17.2032-196.608 10.513067-20.957867 23.3472-39.1168 40.482133-59.118934a94.754133 94.754133 0 0 1 19.6608-102.8096 281.531733 281.531733 0 0 1-1.160533-25.463466C198.656 198.519467 337.92 61.166933 515.208533 61.166933c175.445333 0 318.327467 140.014933 318.327467 312.251734v7.7824c0.068267 5.870933 0.136533 10.4448 0 14.336 16.247467 16.657067 23.893333 38.912 23.893333 70.178133 0 13.994667-1.160533 25.736533-4.437333 36.2496 8.465067 12.4928 17.749333 27.101867 32.768 51.063467l2.8672 4.437333c33.723733 53.6576 40.686933 148.343467 17.885867 200.0896-10.24 23.415467-26.624 36.795733-45.056 40.1408a76.936533 76.936533 0 0 1-15.701334 1.570133c-20.6848 0-37.410133-6.5536-52.6336-19.182933a317.713067 317.713067 0 0 1-12.4928 22.7328c44.8512 25.053867 68.949333 59.118933 63.965867 98.577067z"
            fill="#2c2c2c"
            p-id="18924"
          ></path>
        </svg>
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

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Artalk from "artalk";
import "artalk/dist/Artalk.css";
import MaleAvatar from "./Avatar/MaleAvatar.vue";
import FemaleAvatar from "./Avatar/FemaleAvatar.vue";
import Message from "./Message.vue";
import type { ComponentPublicInstance } from "vue";
import { config } from "../config";

defineProps<{
  userInfo: any;
  loading: boolean;
}>();

const messageRef = ref<ComponentPublicInstance<typeof Message> | null>(null);
const artalkContainer = ref<HTMLElement | null>(null);

const emit = defineEmits<{
  (e: "logout"): void;
}>();

const handleLogout = () => {
  messageRef.value?.show("已退出登录");
  emit("logout");
};

// 获取个人信息标签
const getPersonalInfoLabel = (index: number) => {
  const labels = ["性别", "生日", "地址"];
  return labels[index - 1];
};

// 获取学校信息标签
const getSchoolInfoLabel = (index: number) => {
  const labels = ["学校", "学院", "专业", "班级", "入学年份"];
  return labels[index - 1];
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
<script lang="ts">
export default {
  name: "Profile",
};
</script>

<style scoped>
.profile-page {
  background: #f6f7f9;
}

.profile-container {
  padding: 0px 20px;
}

.profile-card {
  background: #fff;
  border-radius: 10px;
  padding: 15px 20px;
  margin-bottom: 15px;
  border: 1px solid #e3e6e8;
  box-shadow: none;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-avatar {
  width: 64px;
  height: 64px;
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
  font-size: 22px;
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
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  outline: none;
}

/* plain风格 */
.logout-plain {
  background: none;
  border: none;
  color: #e57373;
  border: 1px solid #e57373;
  border-radius: 12px;
  padding: 6px 16px;
  margin-left: 24px;
  align-self: center;
  box-shadow: none;
}
.logout-plain:hover,
.logout-plain:focus {
  background: #ffeaea;
  color: #c62828;
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
  background: #fff;
  border-radius: 0 0 10px 10px;
  overflow: hidden;
  border: 1px solid #e3e6e8;
  border-top: none;
  box-shadow: none;
}

.info-table-card {
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: none;
}

.info-table-header {
  background: #f6f7fa;
  padding: 14px 16px 10px 16px;
  border: 1px solid #e3e6e8;
  border-bottom: none;
  border-radius: 10px 10px 0 0;
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
  background: #f6f7f9;
  border: 1px solid #e3e6e8;
}

.social-link:hover {
  color: #3b9eff;
  transform: translateY(-2px);
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
  background: #fff;
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