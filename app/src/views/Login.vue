<template>
  <div class="login-container">
    <div class="login-card">
      <LoginHeader />
      <LoginForm
        v-if="!isResetMode"
        @switch-mode="switchMode"
        @login="handleLogin"
      />
      <ResetPasswordForm
        v-else
        @switch-mode="switchMode"
        @reset-password="handleReset"
        @send-code="handleSendCode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { useAuth } from "@/composables/useAuth";
import { ElMessage } from "element-plus";

import LoginHeader from "@/components/Login/LoginHeader.vue";
import LoginForm from "@/components/Login/LoginForm.vue";
import ResetPasswordForm from "@/components/Login/ResetPasswordForm.vue";

const userStore = useUserStore();
const { loading, login, resetPassword, sendVerificationCode } = useAuth();

const isResetMode = ref(false);
const countdown = ref(0);
const resetPhone = ref('');
const loginPhone = ref('');

const handleLogin = async (phone: string, password: string) => {
  try {
    loading.value = true;
    await login(phone, password);
  } catch (error: any) {
    ElMessage.error(error.message || "登录失败");
  } finally {
    loading.value = false;
  }
};

const handleReset = async (phone: string, password: string, code: string) => {
  try {
    loading.value = true;
    await resetPassword(phone, password, code);
    isResetMode.value = false;
  } catch (error: any) {
    ElMessage.error(error.message || "重置失败");
  } finally {
    loading.value = false;
  }
};

const handleSendCode = async (phone: string) => {
  try {
    loading.value = true;
    await sendVerificationCode(phone);
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
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  max-width: 600px;
  margin: 0 auto;
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
  max-width: 600px;
  padding: 24px;
  background-color: transparent;
  box-shadow: none;
  border: none;
}

:deep(.el-input-group__append) {
  padding: 0;
}

:deep(.el-input-group__append button) {
  border: none;
  margin: 0;
  height: 100%;
}
</style>