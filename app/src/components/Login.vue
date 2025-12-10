<template>
  <div class="login-container">
    <div class="login-content">
      <div class="app-logo">
        <div class="logo-icon">
          <img src="../assets/logo.png" alt="App Logo" />
        </div>
      </div>

      <div class="form-card">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>手机号</label>
            <input
              v-model="form.userPhone"
              placeholder="请输入手机号"
              required
            />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              required
            />
          </div>
          <button type="submit" :disabled="loading" class="login-button">
            <span v-if="!loading">登录</span>
            <div v-else class="loading-spinner"></div>
          </button>
        </form>
      </div>

      <div class="form-footer">
        <a href="#" @click.prevent="$emit('showReset')" class="reset-link"
          >忘记密码？</a
        >
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, inject } from "vue";
import api from "../utils/api";
import { getLoginParams } from "../utils/config";
import CryptoJS from "crypto-js";

defineEmits(['showReset']);

// 注入 App.vue 的全局消息方法
const showMessage = inject('showMessage');

const form = ref({
  userPhone: "",
  password: "",
});
const loading = ref(false);

const handleLogin = async () => {
  if (loading.value) return;

  loading.value = true;
  try {
    // 使用自动检测的设备信息
    const baseParams = getLoginParams();
    const params = {
      ...baseParams,
      // password: CryptoJS.MD5(form.value.password).toString(),
      password: form.value.password,
      userPhone: form.value.userPhone,
    };

    const { data } = await api.post("/auth/login/password", params);
    if (data.code === 10000) {
      localStorage.setItem("token", data.response.oauthToken.token);
      localStorage.setItem("userId", data.response.userId);
      localStorage.setItem("studentId", data.response.studentId);
      localStorage.setItem("schoolId", data.response.schoolId);
      window.location.reload();
    } else {
      showMessage(data.msg, "error");
    }
  } catch (e) {
    showMessage("登录失败", "error");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 登录页面 - 与App风格统一 */
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  position: relative;
}

.login-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  padding-top: 32px;
}

.app-logo {
  margin: 32px 0;
  text-align: center;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: none;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin: 0 auto;
}

.logo-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.form-card {
  min-width: 340px;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e3e6e8;
  box-shadow: none;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
}

input {
  display: block;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e5e5ea;
  border-radius: 8px;
  font-size: 15px;
  background: #fff;
  color: #333;
  transition: all 0.2s ease;
  -webkit-appearance: none;
  appearance: none;
}

input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
}

input::placeholder {
  color: #aaa;
}

button {
  width: 100%;
  padding: 13px 16px;
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-top: 16px;
}

button:hover {
  background: #0056d3;
}

button:active {
  transform: translateY(1px);
}

button:disabled {
  background: #71b5ff;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.form-footer {
  text-align: center;
  margin-top: 5px;
}

.reset-link {
  color: #007aff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  transition: all 0.2s ease;
}

.reset-link:hover {
  text-decoration: underline;
}

/* 响应式适配 */
@media (max-width: 375px) {
  .login-content {
    padding: 12px;
  }

  .app-logo {
    margin: 24px 0;
  }

  .logo-icon {
    width: 70px;
    height: 70px;
  }

  .form-card {
    padding: 16px;
  }
}

/* 安全区域适配 */
@supports (padding: max(0px)) {
  .login-container {
    padding-top: max(0px, env(safe-area-inset-top));
    padding-bottom: max(0px, env(safe-area-inset-bottom));
  }
}
</style>
