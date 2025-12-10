<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-[#f7f8fa] relative">
    <div class="form-card">
      <div class="form-header">
        <div class="h-[24px] w-[24px] ">
          <img src="../assets/logo.png" alt="App Logo" class="w-full h-full object-contain brightness-0 opacity-90" />
        </div>
        <a href="#" @click.prevent="$emit('showReset')" class="reset-link text-black">忘记密码？</a>
      </div>
      <hr class="form-divider" />
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>手机号</label>
          <input v-model="form.userPhone" placeholder="请输入手机号" required />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="请输入密码" required />
        </div>
        <div>
          <button type="submit" :disabled="loading"
            class="bg-white/90 text-md text-black hover:bg-white/100 w-full min-h-12 border border-neutral-300 rounded-lg px-4 py-8 font-medium transition-all duration-200 flex items-center justify-center">
            <span v-if="!loading">登录</span>
            <div v-else class="loading-spinner"></div>
          </button>
        </div>
      </form>
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
      password: CryptoJS.MD5(form.value.password).toString(),
      // password: form.value.password,
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
.login-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  padding-top: 32px;
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

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.form-divider {
  border: none;
  border-top: 1px solid #e3e6e8;
  margin: 0 0 15px 0;
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


.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

</style>
