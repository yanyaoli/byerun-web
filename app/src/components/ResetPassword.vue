<template>
  <div class="min-h-screen flex flex-col justify-center items-center relative">
    <div class="min-w-[340px] p-6 border border-dashed border-gray-600 rounded-lg">
      <div class="flex justify-between items-center mb-4">
        <div class="h-[24px] w-[24px]">
          <img src="../assets/logo.png" alt="App Logo"
            class="w-full h-full object-contain brightness-10 opacity-80 hover:brightness-10 hover:opacity-90" />
        </div>
      </div>
      <div class="border border-dashed border-gray-600 mb-4"></div>
      <form @submit.prevent="handleReset">
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-2">手机号</label>
          <div class="flex gap-2">
            <input v-model="phone" placeholder="请输入手机号" required
              class="flex-1 p-2 text-md text-gray-300 border border-dashed rounded-lg border-gray-600 bg-transparent focus:outline-none focus:border-gray-400 placeholder:text-sm placeholder:text-gray-600" />
            <button type="button" @click="sendCode" :disabled="sending"
              class="px-3 py-2 bg-black/80 hover:bg-black/90 text-sm text-gray-200 rounded-lg font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="!sending">发送验证码</span>
              <div v-else class="w-4 h-4 border-2 border-white/30 rounded-full border-t-white animate-spin"></div>
            </button>
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-2">验证码</label>
          <input v-model="code" placeholder="请输入短信验证码" required
            class="block w-full p-2 text-md text-gray-300 border border-dashed rounded-lg border-gray-600 bg-transparent focus:outline-none focus:border-gray-400 placeholder:text-sm placeholder:text-gray-600" />
        </div>
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-2">新密码</label>
          <input v-model="password" type="password" placeholder="请设置新密码" required
            class="block w-full p-2 text-md text-gray-300 border border-dashed rounded-lg border-gray-600 bg-transparent focus:outline-none focus:border-gray-400 placeholder:text-sm placeholder:text-gray-600" />
        </div>
        <div>
          <button type="submit" :disabled="submitting"
            class="mt-8 bg-black/80 hover:bg-black/90 text-md text-gray-200 w-full rounded-lg py-2 font-medium flex items-center justify-center active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="!submitting">重置密码</span>
            <div v-else class="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin mx-auto"></div>
          </button>
        </div>
      </form>
      <div class="text-center mt-4">
        <a href="#" @click.prevent="$emit('backToLogin')" class="text-sm text-gray-600 hover:text-gray-900">返回登录</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from "vue";
import api from "../utils/api";
import CryptoJS from "crypto-js";

defineEmits(['backToLogin']);

// 注入全局消息方法
const showMessage = inject('showMessage');

const phone = ref("");
const password = ref("");
const code = ref("");
const sending = ref(false);
const submitting = ref(false);

const sendCode = async () => {
  if (!phone.value) {
    showMessage("请输入手机号", "error");
    return;
  }
  sending.value = true;
  try {
    const { data } = await api.get("/auth/sendSmsForPassWord", {
      params: { phoneNum: phone.value },
    });
    if (data.code === 10000) {
      showMessage("验证码已发送", "success");
    } else {
      showMessage(data.msg || "发送失败", "error");
    }
  } catch (e) {
    showMessage("发送异常", "error");
  } finally {
    sending.value = false;
  }
};

const handleReset = async () => {
  if (!phone.value || !password.value || !code.value) {
    showMessage("请填写完整信息", "error");
    return;
  }
  submitting.value = true;
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
      showMessage("密码重置成功，请返回登录", "success");
      // 清空表单
      phone.value = "";
      password.value = "";
      code.value = "";
    } else {
      showMessage(data.msg || "重置失败", "error");
    }
  } catch (e) {
    showMessage("重置异常", "error");
  } finally {
    submitting.value = false;
  }
};
</script>
