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
import { api } from "@/composables/useApi";

defineEmits(['showReset']);

// 注入 App.vue 的全局消息方法
const showMessage = inject('showMessage');

const phone = ref("");
const password = ref("");

const loading = ref(false);

const doLogin = async () => {
  if (loading.value) return;

  loading.value = true;
  try {
    const { data } = await api.login(
      phone.value,
      password.value
    );
    if (data.code === 10000) {
      localStorage.setItem("unirun_token", data.response.oauthToken.token);
      localStorage.setItem("unirun_userId", data.response.userId);
      localStorage.setItem("unirun_studentId", data.response.studentId);
      localStorage.setItem("unirun_schoolId", data.response.schoolId);
      window.location.reload();
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
