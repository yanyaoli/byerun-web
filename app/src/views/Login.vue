<template>
  <div class="login-container">
    <div class="login-card">
      <div class="header">
        <img src="@/assets/logo.png" alt="logo" class="logo" />
        <div class="theme-toggle" @click="toggleTheme">
            <el-icon v-if="!isDarkMode"><MoonIcon /></el-icon>
            <el-icon v-else><SunnyIcon /></el-icon>
          </div>
      </div>

      <!-- 登录表单 -->
      <el-form
        v-if="!isResetMode"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="left"
      >
        <el-form-item label="" prop="phone">
          <el-input v-model="loginForm.phone" placeholder="请输入手机号">
            <template #prefix>
              <el-icon>
                <Iphone />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          >
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-button
          type="primary"
          @click="handleLogin"
          :loading="loading"
          class="submit-btn"
          style="width: 100%"
        >
          登录
        </el-button>
        <div class="form-footer">
          <el-button type="text" @click="switchMode" class="forgotBtn"
            >忘记密码？</el-button
          >
        </div>
      </el-form>

      <!-- 重置密码表单 -->
      <el-form
        v-else
        ref="resetFormRef"
        :model="resetForm"
        :rules="resetRules"
        label-position="left"
      >
        <el-form-item label="" prop="phone">
          <el-input v-model="resetForm.phone" placeholder="请输入手机号">
            <template #prefix>
              <el-icon>
                <Iphone />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="" prop="code">
          <el-input v-model="resetForm.code" placeholder="请输入验证码">
            <template #prefix>
              <el-icon>
                <Key />
              </el-icon>
            </template>
            <template #append>
              <el-button
                :disabled="!!countdown || loading"
                @click="handleSendCode"
              >
                {{ countdown ? `${countdown}s` : "获取验证码" }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="" prop="password">
          <el-input
            v-model="resetForm.password"
            type="password"
            placeholder="请输入新密码"
            show-password
          >
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="" prop="confirmPassword">
          <el-input
            v-model="resetForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          >
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <div class="form-footer">
          <el-button type="text" @click="switchMode" class="backBtn">返回登录</el-button>
          <el-button
            type="primary"
            @click="handleReset"
            :loading="loading"
            class="submit-btn"
          >
            重置密码
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useAuth } from "@/composables/useAuth";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";

import { MoonIcon, SunnyIcon } from '@/components/icons';

const userStore = useUserStore();
const { loading, login, resetPassword, sendVerificationCode } = useAuth();
const isDarkMode = ref(userStore.$state.isDarkMode);

const router = useRouter();
const loginFormRef = ref<FormInstance>();
const resetFormRef = ref<FormInstance>();
const isResetMode = ref(false);
const countdown = ref(0);

const loginForm = reactive({
  phone: "",
  password: "",
});

const resetForm = reactive({
  phone: "",
  code: "",
  password: "",
  confirmPassword: "",
});

// 登录表单验证规则
const loginRules = {
  phone: [
    { required: true, message: "请输入手机号" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" },
  ],
  password: [
    { required: true, message: "请输入密码" },
    { min: 6, message: "密码长度不能小于6位" },
  ],
};

// 重置密码表单验证规则
const resetRules = {
  phone: [
    { required: true, message: "请输入手机号" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" },
  ],
  code: [
    { required: true, message: "请输入验证码" },
    { len: 6, message: "验证码长度为6位" },
  ],
  password: [
    { required: true, message: "请输入新密码" },
    { min: 6, message: "密码长度不能小于6位" },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码" },
    {
      validator: (rule: any, value: string) => {
        if (value !== resetForm.password) {
          return Promise.reject("两次输入的密码不一致");
        }
        return Promise.resolve();
      },
    },
  ],
};

const onFinish = async (values: any) => {
  try {
    await login(values.phone, values.password);
  } catch {
    // 错误已在 useAuth 中处理
  }
};

const toggleTheme = () => {
  userStore.toggleDarkMode();
  isDarkMode.value = userStore.$state.isDarkMode;
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  try {
    await loginFormRef.value.validate();
    loading.value = true;
    await login(loginForm.phone, loginForm.password);
  } catch (error: any) {
    ElMessage.error(error.message || "登录失败");
  } finally {
    loading.value = false;
  }
};

const handleReset = async () => {
  if (!resetFormRef.value) return;
  try {
    await resetFormRef.value.validate();
    loading.value = true;
    await resetPassword(resetForm.phone, resetForm.password, resetForm.code);
    isResetMode.value = false;
  } catch (error: any) {
    ElMessage.error(error.message || "重置失败");
  } finally {
    loading.value = false;
  }
};

const handleSendCode = async () => {
  if (!resetForm.phone) {
    ElMessage.warning("请输入手机号");
    return;
  }
  try {
    loading.value = true;
    await sendVerificationCode(resetForm.phone);
    startCountdown();
  } catch (error: any) {
    ElMessage.error(error.message || "发送失败");
  } finally {
    loading.value = false;
  }
};

const startCountdown = () => {
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

const switchMode = () => {
  isResetMode.value = !isResetMode.value;
  if (isResetMode.value) {
    resetForm.phone = loginForm.phone;
  } else {
    loginForm.phone = resetForm.phone;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--background-color);
  background-image:
    linear-gradient(var(--grid-color) 1px, transparent 1px), /* 垂直线 */
    linear-gradient(90deg, var(--grid-color) 1px, transparent 1px); /* 水平线 */
  background-size: 20px 20px;
  background-position: 0 0;
}

.login-card {
  width: 100%;
  width: 300px;
  padding: 24px;
  background-color: transparent;
  box-shadow: none;
  border: none;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}


.theme-toggle {
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

:deep(.el-input-group__append) {
  padding: 0;
}

:deep(.el-input-group__append button) {
  border: none;
  margin: 0;
  height: 100%;
}

/* 按钮 */
/* 忘记密码按钮 */
.forgotBtn {
  padding: 0;
  color: var(--el-text-color-secondary);
  width: 100%;
}
.forgotBtn:hover {
  color: var(--text-color);
  transform: translateY(-2px);
}

/* 返回按钮 */
.backBtn {
  color: var(--el-text-color-secondary);
  width:100%;
  padding: 0;
}
.backBtn:hover {
  color: var(--text-color);
  transform: translateY(-2px);
}
</style>