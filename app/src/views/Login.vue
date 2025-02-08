<template>
  <div class="login-container">
    <div class="login-card">
      <div class="header">
        <img src="@/assets/logo.png" alt="logo" class="logo" />
        <div class="theme-toggle" @click="toggleTheme">
          <el-icon v-if="!isDarkMode" ><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill-opacity="0" d="M15.22 6.03l2.53-1.94L14.56 4L13.5 1l-1.06 3l-3.19.09l2.53 1.94l-.91 3.06l2.63-1.81l2.63 1.81z" fill="currentColor"><animate id="lineMdSunnyOutlineToMoonLoopTransition0" fill="freeze" attributeName="fill-opacity" begin="0.6s;lineMdSunnyOutlineToMoonLoopTransition0.begin+6s" dur="0.4s" values="0;1"/><animate fill="freeze" attributeName="fill-opacity" begin="lineMdSunnyOutlineToMoonLoopTransition0.begin+2.2s" dur="0.4s" values="1;0"/></path><path fill-opacity="0" d="M13.61 5.25L15.25 4l-2.06-.05L12.5 2l-.69 1.95L9.75 4l1.64 1.25l-.59 1.98l1.7-1.17l1.7 1.17z" fill="currentColor"><animate fill="freeze" attributeName="fill-opacity" begin="lineMdSunnyOutlineToMoonLoopTransition0.begin+3s" dur="0.4s" values="0;1"/><animate fill="freeze" attributeName="fill-opacity" begin="lineMdSunnyOutlineToMoonLoopTransition0.begin+5.2s" dur="0.4s" values="1;0"/></path><path fill-opacity="0" d="M19.61 12.25L21.25 11l-2.06-.05L18.5 9l-.69 1.95l-2.06.05l1.64 1.25l-.59 1.98l1.7-1.17l1.7 1.17z" fill="currentColor"><animate fill="freeze" attributeName="fill-opacity" begin="lineMdSunnyOutlineToMoonLoopTransition0.begin+0.4s" dur="0.4s" values="0;1"/><animate fill="freeze" attributeName="fill-opacity" begin="lineMdSunnyOutlineToMoonLoopTransition0.begin+2.8s" dur="0.4s" values="1;0"/></path><path fill-opacity="0" d="M20.828 9.731l1.876-1.439l-2.366-.067L19.552 6l-.786 2.225l-2.366.067l1.876 1.439L17.601 12l1.951-1.342L21.503 12z" fill="currentColor"><animate fill="freeze" attributeName="fill-opacity" begin="lineMdSunnyOutlineToMoonLoopTransition0.begin+3.4s" dur="0.4s" values="0;1"/><animate fill="freeze" attributeName="fill-opacity" begin="lineMdSunnyOutlineToMoonLoopTransition0.begin+5.6s" dur="0.4s" values="1;0"/></path><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><g><path stroke-dasharray="2" stroke-dashoffset="4" d="M12 21v1M21 12h1M12 3v-1M3 12h-1"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.2s" values="4;2"/></path><path stroke-dasharray="2" stroke-dashoffset="4" d="M18.5 18.5l0.5 0.5M18.5 5.5l0.5 -0.5M5.5 5.5l-0.5 -0.5M5.5 18.5l-0.5 0.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.2s" dur="0.2s" values="4;2"/></path><set fill="freeze" attributeName="opacity" begin="0.5s" to="0"/></g><path d="M7 6 C7 12.08 11.92 17 18 17 C18.53 17 19.05 16.96 19.56 16.89 C17.95 19.36 15.17 21 12 21 C7.03 21 3 16.97 3 12 C3 8.83 4.64 6.05 7.11 4.44 C7.04 4.95 7 5.47 7 6 Z" opacity="0"><set fill="freeze" attributeName="opacity" begin="0.5s" to="1"/></path></g><mask id="lineMdSunnyOutlineToMoonLoopTransition1"><circle cx="12" cy="12" r="12" fill="#fff"/><circle cx="12" cy="12" r="4"><animate fill="freeze" attributeName="r" begin="0.1s" dur="0.4s" values="4;8"/></circle><circle cx="22" cy="2" r="3" fill="#fff"><animate fill="freeze" attributeName="cx" begin="0.1s" dur="0.4s" values="22;18"/><animate fill="freeze" attributeName="cy" begin="0.1s" dur="0.4s" values="2;6"/><animate fill="freeze" attributeName="r" begin="0.1s" dur="0.4s" values="3;12"/></circle><circle cx="22" cy="2" r="1"><animate fill="freeze" attributeName="cx" begin="0.1s" dur="0.4s" values="22;18"/><animate fill="freeze" attributeName="cy" begin="0.1s" dur="0.4s" values="2;6"/><animate fill="freeze" attributeName="r" begin="0.1s" dur="0.4s" values="1;10"/></circle></mask><circle cx="12" cy="12" r="6" mask="url(#lineMdSunnyOutlineToMoonLoopTransition1)" fill="currentColor"><animate fill="freeze" attributeName="r" begin="0.1s" dur="0.4s" values="6;10"/><set fill="freeze" attributeName="opacity" begin="0.5s" to="0"/></circle></svg></el-icon>
            <el-icon v-else><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="2" stroke-dashoffset="2" d="M12 19v1M19 12h1M12 5v-1M5 12h-1"><animate fill="freeze" attributeName="d" begin="1.2s" dur="0.2s" values="M12 19v1M19 12h1M12 5v-1M5 12h-1;M12 21v1M21 12h1M12 3v-1M3 12h-1"/><animate fill="freeze" attributeName="stroke-dashoffset" begin="1.2s" dur="0.2s" values="2;0"/></path><path stroke-dasharray="2" stroke-dashoffset="2" d="M17 17l0.5 0.5M17 7l0.5 -0.5M7 7l-0.5 -0.5M7 17l-0.5 0.5"><animate fill="freeze" attributeName="d" begin="1.4s" dur="0.2s" values="M17 17l0.5 0.5M17 7l0.5 -0.5M7 7l-0.5 -0.5M7 17l-0.5 0.5;M18.5 18.5l0.5 0.5M18.5 5.5l0.5 -0.5M5.5 5.5l-0.5 -0.5M5.5 18.5l-0.5 0.5"/><animate fill="freeze" attributeName="stroke-dashoffset" begin="1.4s" dur="0.2s" values="2;0"/></path><animateTransform attributeName="transform" dur="30s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></g><g fill="currentColor"><path d="M15.22 6.03L17.75 4.09L14.56 4L13.5 1L12.44 4L9.25 4.09L11.78 6.03L10.87 9.09L13.5 7.28L16.13 9.09L15.22 6.03Z"><animate fill="freeze" attributeName="fill-opacity" dur="0.4s" values="1;0"/></path><path d="M19.61 12.25L21.25 11L19.19 10.95L18.5 9L17.81 10.95L15.75 11L17.39 12.25L16.8 14.23L18.5 13.06L20.2 14.23L19.61 12.25Z"><animate fill="freeze" attributeName="fill-opacity" begin="0.2s" dur="0.4s" values="1;0"/></path></g><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 6 C7 12.08 11.92 17 18 17 C18.53 17 19.05 16.96 19.56 16.89 C17.95 19.36 15.17 21 12 21 C7.03 21 3 16.97 3 12 C3 8.83 4.64 6.05 7.11 4.44 C7.04 4.95 7 5.47 7 6 Z"><set fill="freeze" attributeName="opacity" begin="0.6s" to="0"/></path><mask id="lineMdMoonToSunnyOutlineLoopTransition0"><circle cx="12" cy="12" r="12" fill="#fff"/><circle cx="12" cy="12" r="8"><animate fill="freeze" attributeName="r" begin="0.6s" dur="0.4s" values="8;4"/></circle><circle cx="18" cy="6" r="12" fill="#fff"><animate fill="freeze" attributeName="cx" begin="0.6s" dur="0.4s" values="18;22"/><animate fill="freeze" attributeName="cy" begin="0.6s" dur="0.4s" values="6;2"/><animate fill="freeze" attributeName="r" begin="0.6s" dur="0.4s" values="12;3"/></circle><circle cx="18" cy="6" r="10"><animate fill="freeze" attributeName="cx" begin="0.6s" dur="0.4s" values="18;22"/><animate fill="freeze" attributeName="cy" begin="0.6s" dur="0.4s" values="6;2"/><animate fill="freeze" attributeName="r" begin="0.6s" dur="0.4s" values="10;1"/></circle></mask><circle cx="12" cy="12" r="10" mask="url(#lineMdMoonToSunnyOutlineLoopTransition0)" opacity="0" fill="currentColor"><animate fill="freeze" attributeName="r" begin="0.6s" dur="0.4s" values="10;6"/><set fill="freeze" attributeName="opacity" begin="0.6s" to="1"/></circle></svg></el-icon>
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
import MoonIcon from "@/components/icons/MoonIcon.vue";
import SunnyIcon from "@/components/icons/SunnyIcon.vue";

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
  background-color: var(--login-container-bg-color);
}

.login-card {
  width: 100%;
  width: 300px;
  padding: 24px;
  background-color: var(--login-card-bg-color);
  border-radius: 25px;
  box-shadow: var(--login-card-box-shadow);
  border: var(--login-card-border);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.logo {
  height: 24px;
  filter: brightness(var(--logo-value));
}


.theme-toggle {
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
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