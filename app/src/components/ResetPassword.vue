<template>
  <div class="reset-password">
    <div class="reset-content">
      <div class="app-logo">
        <div class="logo-icon">
          <img
            class="logo-image"
            key=""
            src="../assets/logo.png"
            alt="App Logo"
          />
        </div>
      </div>
      <div class="form-card">
        <form @submit.prevent="handleReset">
          <div class="form-group">
            <label>手机号</label>
            <div class="input-with-button">
              <input
                v-model="phone"
                type="text"
                placeholder="请输入手机号"
                required
              />
              <button
                type="button"
                class="send-code-btn"
                @click="sendCode"
                :disabled="sending"
              >
                <div v-if="sending" class="loading-spinner"></div>
                <span v-else>发送验证码</span>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>验证码</label>
            <input
              v-model="code"
              type="text"
              placeholder="请输入短信验证码"
              required
            />
          </div>
          <div class="form-group">
            <label>新密码</label>
            <input
              v-model="password"
              type="password"
              placeholder="请设置新密码"
              required
            />
          </div>
          <button type="submit" :disabled="submitting" class="submit-btn">
            <div v-if="submitting" class="loading-spinner"></div>
            <span v-else>重置密码</span>
          </button>
        </form>
      </div>

      <div class="form-footer">
        <a href="#" @click.prevent="$emit('backToLogin')" class="back-link"
          >返回登录</a
        >
      </div>
      <div v-if="msg" class="message">{{ msg }}</div>
    </div>
  </div>
  <Message ref="messageRef" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import api from "../utils/api";
import CryptoJS from "crypto-js";
import Message from "./Message.vue";

defineEmits<{
  backToLogin: [];
}>();

const phone = ref("");
const password = ref("");
const code = ref("");
const msg = ref("");
const sending = ref(false);
const submitting = ref(false);

const sendCode = async () => {
  if (!phone.value) {
    msg.value = "请输入手机号";
    return;
  }
  sending.value = true;
  msg.value = "";
  try {
    const { data } = await api.get("/auth/sendSmsForPassWord", {
      params: { phoneNum: phone.value },
    });
    if (data.code === 10000) {
      msg.value = "验证码已发送";
    } else {
      msg.value = data.msg || "发送失败";
    }
  } catch (e) {
    msg.value = "发送异常";
  } finally {
    sending.value = false;
  }
};

const handleReset = async () => {
  if (!phone.value || !password.value || !code.value) {
    msg.value = "请填写完整信息";
    return;
  }
  submitting.value = true;
  msg.value = "";
  try {
    const hashed = CryptoJS.MD5(password.value).toString();
    const payload = {
      password: hashed,
      passwordRes: hashed,
      userPhone: Number(phone.value),
      code: Number(code.value),
    };
    const { data } = await api.post("/auth/updateUserPassWord", payload);
    if (data.code === 10000) {
      msg.value = "密码重置成功，请返回登录";
    } else {
      msg.value = data.msg || "重置失败";
    }
  } catch (e) {
    msg.value = "重置异常";
  } finally {
    submitting.value = false;
  }
};
</script>
<script lang="ts">
export default {};
</script>

<style scoped>
/* 重置密码界面 - 与登录页风格统一 */
.reset-password {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  position: relative;
}

.reset-content {
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
  margin-bottom: 6px;
  color: #666;
  font-weight: 500;
}

input {
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

.input-with-button {
  display: flex;
  gap: 10px;
}

.input-with-button input {
  flex: 1;
}

.send-code-btn {
  padding: 0 12px;
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.send-code-btn:disabled {
  background: #71b5ff;
  cursor: not-allowed;
}

.submit-btn {
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
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}

.submit-btn:disabled {
  background: #71b5ff;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

.back-link {
  color: #007aff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  transition: all 0.2s ease;
}

.back-link:hover {
  text-decoration: underline;
}

.message {
  color: #333;
  margin-top: 16px;
  text-align: center;
  font-weight: 500;
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e5e5ea;
  max-width: 340px;
}

.loading-spinner {
  width: 18px;
  height: 18px;
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

/* 响应式适配 */
@media (max-width: 375px) {
  .reset-content {
    padding: 12px;
    padding-top: 24px;
  }

  .form-card {
    padding: 16px;
  }

  .send-code-btn {
    min-width: 90px;
    font-size: 13px;
  }
}

/* 安全区域适配 */
@supports (padding: max(0px)) {
  .reset-password {
    padding-top: max(0px, env(safe-area-inset-top));
    padding-bottom: max(0px, env(safe-area-inset-bottom));
  }
}
</style>