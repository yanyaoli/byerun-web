<template>
  <el-header class="dashboard-header">
    <div class="dashboard-header-content">
      <img
        src="@/assets/logo.png"
        alt="logo"
        class="logo"
        @click="$emit('refresh')"
      />
      <div class="header-right">
        <div class="header-icon-button" @click="handleThemeToggle">
          <el-icon v-if="!isDarkMode"><MoonIcon /></el-icon>
          <el-icon v-else><SunnyIcon /></el-icon>
        </div>
        <a
          :href="config.urls.github"
          target="_blank"
          rel="noopener noreferrer"
          class="header-icon-button"
        >
          <el-icon><GithubIcon /></el-icon>
        </a>
        <el-dropdown
          @command="handleCommand"
          trigger="click"
          placement="bottom-end"
        >
          <div class="header-icon-button">
            <el-icon><SettingsIcon /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="menu-item">
              <el-dropdown-item command="refresh">
                <el-icon>
                  <UserIcon />
                </el-icon>
                {{ userName }}
              </el-dropdown-item>
              <el-dropdown-item command="refresh">
                <el-icon>
                  <RefreshIcon />
                </el-icon>
                刷新数据
              </el-dropdown-item>
              <el-dropdown-item command="showEndDate">
                <el-icon><AlarmClockIcon /></el-icon>
                截止日期
              </el-dropdown-item>
              <el-dropdown-item command="logout">
                <el-icon>
                  <LogoutIcon />
                </el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-header>
</template>


<style scoped>
.dashboard-header {
  height: 50px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  overflow: hidden;
  background-color: var(---nav-background-color);
}


.dashboard-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  position: relative;
  z-index: 2;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
  border-radius: 50%;
  color: var(--el-text-color-primary);
  transition: all 0.3s ease;
  background-color: transparent;
}

.header-icon-button:hover {
  background-color: rgba(var(--el-color-primary-rgb), 0.15);
  transform: translateY(-1px);
}

.logo {
  height: 32px;
  width: 32px;
  margin-right: 24px;
  object-fit: contain;
  cursor: pointer;
  filter: brightness(var(--logo-value));
}

:deep(.el-dropdown-menu) {
  background-color: rgba(var(--el-bg-color-rgb), 0.7); /* 降低不透明度 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(var(--el-border-color-rgb), 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

:deep(.el-dropdown-menu__item) {
  transition: all 0.3s ease;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: rgba(var(--el-color-primary-rgb), 0.1);
}
.menu-item {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
}

@media screen and (max-width: 480px) {
  .dashboard-header {
    height: 48px;
  }

  .header-icon-button {
    width: 36px;
    height: 36px;
  }

  .logo {
    height: 28px;
    width: 28px;
    margin-right: 16px;
  }
}
</style>

<script setup lang="ts">
import { computed } from 'vue';
import { config } from "@/config";
import {
  UserIcon,
  SettingsIcon,
  MoonIcon,
  SunnyIcon,
  GithubIcon,
  LogoutIcon,
  AlarmClockIcon,
  RefreshIcon,
} from "@/components/icons";

interface Props {
  isDarkMode: boolean;
  userName?: string;
}

interface Emits {
  (e: 'refresh'): void;
  (e: 'showEndDate'): void;
  (e: 'logout'): void;
  (e: 'toggleTheme'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleCommand = (command: string) => {
  switch (command) {
    case "refresh":
      emit('refresh');
      break;
    case "showEndDate":
      emit('showEndDate');
      break;
    case "logout":
      emit('logout');
      break;
  }
};

const handleThemeToggle = () => {
  emit('toggleTheme');
};
</script>