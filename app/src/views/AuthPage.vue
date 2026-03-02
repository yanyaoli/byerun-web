<template>
  <div class="min-h-screen flex flex-col justify-center items-center relative">
    <div class="min-w-[340px] p-6 border border-dashed border-gray-600 rounded-lg">
      <div class="flex justify-between items-center mb-4">
        <div class="h-[24px] w-[24px]">
          <img
            src="../assets/logo.png"
            alt="App Logo"
            class="w-full h-full object-contain brightness-10 opacity-80 hover:brightness-10 hover:opacity-90"
          />
        </div>
        <span class="text-sm text-gray-600 font-medium font-mono">UNORUN</span>
      </div>
      <div class="border border-dashed border-gray-600 mb-4"></div>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-2">手机号</label>
          <input
            v-model="phone"
            placeholder="请输入手机号"
            required
            class="block w-full p-2 text-sm text-gray-500 border border-dashed rounded-lg border-gray-600 bg-transparent focus:outline-none focus:border-gray-400 placeholder:text-sm placeholder:text-gray-600"
          />
        </div>
        <div v-if="mode === 'reset'" class="mb-4">
          <label class="block text-sm text-gray-600 mb-2">新密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请设置新密码"
            required
            class="block w-full p-2 text-sm text-gray-500 border border-dashed rounded-lg border-gray-600 bg-transparent focus:outline-none focus:border-gray-400 placeholder:text-sm placeholder:text-gray-600"
          />
        </div>
        <div v-if="mode === 'reset'" class="mb-4">
          <label class="block text-sm text-gray-600 mb-2">验证码</label>
          <div class="flex gap-2">
            <input
              v-model="code"
              placeholder="请输入短信验证码"
              required
              class="flex-1 p-2 text-sm text-gray-500 border border-dashed rounded-lg border-gray-600 bg-transparent focus:outline-none focus:border-gray-400 placeholder:text-sm placeholder:text-gray-600"
            />
            <button
              type="button"
              @click="sendCode"
              :disabled="sending"
              class="px-3 py-2 hover:text-black/90 text-sm text-black/80 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <span v-if="!sending">发送验证码</span>
              <div
                v-else
                class="w-4 h-4 border-2 border-white/30 rounded-full border-t-white animate-spin"
              ></div>
            </button>
          </div>
        </div>
        <div v-if="mode === 'login'" class="mb-4">
          <label class="block text-sm text-gray-600 mb-2">密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            required
            class="block w-full p-2 text-sm text-gray-500 border border-dashed rounded-lg border-gray-600 bg-transparent focus:outline-none focus:border-gray-400 placeholder:text-sm placeholder:text-gray-600"
          />
        </div>
        <div class="flex items-center justify-between mb-4">
          <label v-if="mode === 'login'" class="flex items-center space-x-2 cursor-pointer group">
            <input type="checkbox" v-model="rememberMe" class="hidden" />
            <div
              class="w-4 h-4 border border-gray-600 rounded flex items-center justify-center transition"
              :class="{ 'bg-black border-black': rememberMe }"
            >
              <i v-if="rememberMe" class="fa-solid fa-check text-[10px] text-white"></i>
            </div>
            <span class="text-xs text-gray-600 group-hover:text-gray-800 transition">记住我</span>
          </label>
          <a
            v-if="mode === 'login'"
            href="#"
            @click.prevent="mode = 'reset'"
            class="text-xs text-gray-600 hover:text-gray-900"
            >忘记密码？</a
          >
        </div>
        <div class="flex gap-2">
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-black/80 hover:bg-black/90 text-gray-200 text-md rounded-lg py-2 font-medium flex items-center justify-center active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">{{ mode === 'login' ? '登 录' : '重置密码' }}</span>
            <div
              v-else
              class="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin mx-auto"
            ></div>
          </button>
        </div>
        <div v-if="mode === 'reset'" class="text-center mt-4">
          <a
            href="#"
            @click.prevent="mode = 'login'"
            class="text-xs text-gray-600 hover:text-gray-900"
            >返回登录</a
          >
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/composables/useApi';
import { useDataStore } from '@/composables/useDataStore';

const showMessage = inject('showMessage');
const { userInfo, fetchUserData, rememberLogin, savedPhone } = useDataStore();
const router = useRouter();

const mode = ref('login');
const phone = ref('');
const password = ref('');
const code = ref('');
const rememberMe = ref(!!rememberLogin.value);
const loading = ref(false);
const sending = ref(false);

onMounted(() => {
  if (rememberMe.value) {
    phone.value = savedPhone.value || '';
  }
});

watch(rememberMe, (val) => {
  rememberLogin.value = !!val;

  if (!val) {
    savedPhone.value = '';
  }
});

const sendCode = async () => {
  if (!phone.value) {
    showMessage('请输入手机号', 'error');
    return;
  }
  sending.value = true;
  try {
    const { data } = await api.sendVerifyCode(phone.value);
    if (data.code === 10000) {
      showMessage('验证码已发送', 'success');
    } else {
      showMessage(data.msg || '发送失败', 'error');
    }
  } catch (e) {
    showMessage('发送异常', 'error');
  } finally {
    sending.value = false;
  }
};

const handleLogin = async () => {
  loading.value = true;
  try {
    const { data } = await api.login(phone.value, password.value);
    if (data.code === 10000) {
      if (rememberMe.value) {
        savedPhone.value = phone.value;
      } else {
        savedPhone.value = '';
      }
      userInfo.value = data.response;
      try {
        await fetchUserData();
      } catch (e) {}
      router.replace({ name: 'home' }).catch(() => {});
    } else {
      showMessage(data.msg, 'error');
    }
  } catch (e) {
    console.error(e);
    showMessage('登录失败', 'error');
  } finally {
    loading.value = false;
  }
};

const handleReset = async () => {
  if (!code.value) {
    showMessage('请输入验证码', 'error');
    return;
  }
  loading.value = true;
  try {
    const { data } = await api.updatePassword(phone.value, password.value, code.value);
    if (data.code === 10000) {
      showMessage('密码重置成功，请登录', 'success');
      phone.value = '';
      password.value = '';
      code.value = '';
      mode.value = 'login';
    } else {
      showMessage(data.msg || '重置失败', 'error');
    }
  } catch (e) {
    showMessage('重置异常', 'error');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = () => {
  if (mode.value === 'login') {
    handleLogin();
  } else {
    handleReset();
  }
};
</script>
