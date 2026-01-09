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
      <form @submit.prevent="doLogin">
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-2">手机号</label>
          <input v-model="phone" placeholder="请输入手机号" required
            class="block w-full p-2 text-sm text-gray-500 border border-dashed rounded-lg border-gray-600 bg-transparent focus:outline-none focus:border-gray-400 placeholder:text-sm placeholder:text-gray-600" />
        </div>
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-2">密码</label>
          <input v-model="password" type="password" placeholder="请输入密码" required
            class="block w-full p-2 text-sm text-gray-500 border border-dashed rounded-lg border-gray-600 bg-transparent focus:outline-none focus:border-gray-400 placeholder:text-sm placeholder:text-gray-600" />
        </div>
        <div class="flex items-center justify-between mb-6">
          <label class="flex items-center space-x-2 cursor-pointer group">
            <input type="checkbox" v-model="rememberMe" class="hidden" />
            <div class="w-4 h-4 border border-gray-600 rounded flex items-center justify-center transition"
              :class="{ 'bg-black border-black': rememberMe }">
              <i v-if="rememberMe" class="fa-solid fa-check text-[10px] text-white"></i>
            </div>
            <span class="text-xs text-gray-600 group-hover:text-gray-800 transition">记住我</span>
          </label>
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
import { ref, inject, onMounted } from "vue";
import { api } from "@/composables/useApi";
import { useDataStore } from "@/composables/useDataStore";
import { encrypt, decrypt } from "@/utils/crypto";

defineEmits(['showReset']);

// 注入 App.vue 的全局消息方法
const showMessage = inject('showMessage');

const { userInfo } = useDataStore();

const phone = ref("");
const password = ref("");
const rememberMe = ref(localStorage.getItem('unirun_remember') === 'true');
const loading = ref(false);

onMounted(() => {
  if (rememberMe.value) {
    phone.value = localStorage.getItem('unirun_saved_phone') || "";
    // 从本地存储获取加密的密码并填充
    const savedPass = localStorage.getItem('unirun_saved_pass');
    if (savedPass) {
      const decryptedPass = decrypt(savedPass);
      if (decryptedPass) password.value = decryptedPass;
    }
  }
});

const doLogin = async () => {
  if (loading.value) return;

  loading.value = true;
  try {
    const { data } = await api.login(
      phone.value,
      password.value
    );
    if (data.code === 10000) {
      const resp = data.response;

      // 处理记住我 (账号密码)
      if (rememberMe.value) {
        localStorage.setItem('unirun_saved_phone', phone.value);
        localStorage.setItem('unirun_saved_pass', encrypt(password.value));
        localStorage.setItem('unirun_remember', 'true');
      } else {
        localStorage.removeItem('unirun_saved_phone');
        localStorage.removeItem('unirun_saved_pass');
        localStorage.setItem('unirun_remember', 'false');
      }

      // 设置数据，useDataStore 会自动加密并持久化
      userInfo.value = resp;
    } else {
      showMessage(data.msg, "error");
    }
  } catch (e) {
    console.error(e);
    showMessage("登录失败", "error");
  } finally {
    loading.value = false;
  }
};
</script>
