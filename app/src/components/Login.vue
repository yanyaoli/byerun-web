<template>
  <div class="min-h-screen flex flex-col justify-center items-center relative">
    <div class="min-w-[340px] p-6 border border-dashed border-gray-600 rounded-lg">
      <div class="flex justify-between items-center mb-4 ">
        <div class="h-[24px] w-[24px] ">
          <img src="../assets/logo.png" alt="App Logo"
            class="w-full h-full object-contain brightness-10 opacity-80 hover:brightness-10 hover:opacity-90" />
        </div>
        <a href="#" @click.prevent="$emit('showReset')"
          class="reset-link text-sm text-gray-600 hover:text-gray-900">忘记密码？</a>
      </div>
      <div class="border border-dashed border-gray-600 mb-4"></div>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-2">手机号</label>
          <input v-model="form.userPhone" placeholder="请输入手机号" required
            class="block w-full p-2 text-sm text-gray-500 border border-dashed rounded-lg border-gray-600 bg-transparent focus:outline-none focus:border-gray-400 placeholder:text-sm placeholder:text-gray-600" />
        </div>
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-2">密码</label>
          <input v-model="form.password" type="password" placeholder="请输入密码" required
            class="block w-full p-2 text-sm text-gray-500 border border-dashed rounded-lg border-gray-600 bg-transparent focus:outline-none focus:border-gray-400 placeholder:text-sm placeholder:text-gray-600" />
        </div>
        <div class="flex justify-end">
          <button type="submit" :disabled="loading"
            class="bg-black/80 hover:bg-black/90 text-md text-gray-200 rounded-lg py-2 px-4 font-medium flex items-center justify-center active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="!loading" class="">登录</span>
            <div v-else class="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin mx-auto"></div>
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
