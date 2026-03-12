<template>
  <div
    class="auth-page h-full min-h-0 w-full flex flex-col justify-center items-center relative px-4"
  >
    <div class="w-full max-w-[360px] p-6 border border-dashed border-gray-600 rounded-lg">
      <div class="flex justify-between items-center mb-4">
        <div class="h-[24px] w-[24px]">
          <img
            src="../assets/logo.png"
            alt="App Logo"
            class="w-full h-full object-contain invert brightness-0 opacity-80 hover:brightness-0 hover:opacity-90"
          />
        </div>
        <span class="text-sm text-gray-600 font-medium font-mono">UNORUN</span>
      </div>
      <div class="border border-dashed border-gray-600 mb-4"></div>
      <form @submit.prevent="handleSubmit" @focusout="handleInputBlur">
        <div class="mb-4">
          <label class="block text-sm text-gray-600 mb-2">手机号</label>
          <input
            v-model="phone"
            placeholder="请输入手机号"
            required
            @blur="handleInputBlur"
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
            @blur="handleInputBlur"
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
              @blur="handleInputBlur"
              class="flex-1 p-2 text-sm text-gray-500 border border-dashed rounded-lg border-gray-600 bg-transparent focus:outline-none focus:border-gray-400 placeholder:text-sm placeholder:text-gray-600"
            />
            <button
              type="button"
              @click="sendCode"
              :disabled="sending"
              class="px-3 py-2 bg-stone-900 text-gray-300 rounded-md hover:text-black/90 text-sm text-black/80 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
            @blur="handleInputBlur"
            class="block w-full p-2 text-sm text-gray-500 border border-dashed rounded-lg border-gray-600 bg-transparent focus:outline-none focus:border-gray-400 placeholder:text-sm placeholder:text-gray-600"
          />
        </div>
        <div class="flex items-center justify-between mb-4">
          <label v-if="mode === 'login'" class="flex items-center space-x-2 cursor-pointer group">
            <input type="checkbox" v-model="rememberMe" class="hidden" />
            <div
              class="w-4 h-4 border border-slate-300 rounded flex items-center justify-center transition-colors"
              :class="{ 'bg-slate-900 border-slate-900': rememberMe }"
            >
              <i v-if="rememberMe" class="ri-check-line text-[10px] text-white"></i>
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
            class="w-full bg-stone-900 hover:bg-black/90 text-gray-200 text-md rounded-lg py-2 font-medium flex items-center justify-center active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
import { ref, inject, watch, onMounted, onUnmounted } from 'vue';
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
const keyboardInset = ref(0);
const viewportBaseHeight = ref(0);
let keyboardWasVisible = false;
let keyboardMeasureTimer = 0;

function restoreViewportPosition() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function getViewportBaseHeight() {
  const cssHeight = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--app-vh'),
  );
  if (Number.isFinite(cssHeight) && cssHeight > 0) return cssHeight;
  return window.innerHeight || document.documentElement?.clientHeight || 0;
}

function syncViewportBaseHeight() {
  viewportBaseHeight.value = getViewportBaseHeight();
}

function measureKeyboardInset() {
  const viewport = window.visualViewport;
  const layoutHeight = viewportBaseHeight.value || getViewportBaseHeight();
  const visibleHeight = Math.max(0, viewport?.height || layoutHeight);
  const offsetTop = Math.max(0, viewport?.offsetTop || 0);
  const inset = Math.max(0, layoutHeight - (visibleHeight + offsetTop));
  keyboardInset.value = inset;

  if (keyboardWasVisible && inset <= 0) {
    restoreViewportPosition();
  }
  keyboardWasVisible = inset > 0;
}

function scheduleKeyboardMeasure() {
  if (keyboardMeasureTimer) clearTimeout(keyboardMeasureTimer);
  keyboardMeasureTimer = window.setTimeout(() => {
    syncViewportBaseHeight();
    measureKeyboardInset();
    keyboardMeasureTimer = 0;
  }, 60);
}

function handleInputBlur() {
  window.setTimeout(() => {
    syncViewportBaseHeight();
    measureKeyboardInset();
    if (keyboardInset.value <= 0) {
      restoreViewportPosition();
    }
  }, 120);
}

onMounted(() => {
  if (rememberMe.value) {
    phone.value = savedPhone.value || '';
  }
  syncViewportBaseHeight();
  measureKeyboardInset();
  window.addEventListener('resize', scheduleKeyboardMeasure);
  window.addEventListener('orientationchange', scheduleKeyboardMeasure);
  window.visualViewport?.addEventListener('resize', scheduleKeyboardMeasure);
  window.visualViewport?.addEventListener('scroll', scheduleKeyboardMeasure);
});

onUnmounted(() => {
  if (keyboardMeasureTimer) {
    clearTimeout(keyboardMeasureTimer);
    keyboardMeasureTimer = 0;
  }
  window.removeEventListener('resize', scheduleKeyboardMeasure);
  window.removeEventListener('orientationchange', scheduleKeyboardMeasure);
  window.visualViewport?.removeEventListener('resize', scheduleKeyboardMeasure);
  window.visualViewport?.removeEventListener('scroll', scheduleKeyboardMeasure);
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
