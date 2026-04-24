<template>
  <div
    class="auth-page h-full min-h-0 w-full flex flex-col items-center relative px-4 theme-text-primary"
  >
    <AppHeader
      ref="appHeaderRef"
      :show-github="false"
      :icons-only="true"
      :transparent="true"
      class="absolute top-0 left-0 right-0 z-10"
    />

    <div class="w-full flex-1 min-h-0 flex items-center justify-center">
      <div class="w-full max-w-[480px] p-6">
        <div class="mb-4 text-center">
          <h1 class="text-3xl font-black theme-text-primary mb-4 tracking-tight">Byerun Web</h1>
          <p class="theme-text-secondary mb-8 text-xm max-w-xs mx-auto leading-relaxed">
            免费且开源的校园生存工具
          </p>
        </div>
        <form @submit.prevent="handleSubmit" @focusout="handleInputBlur">
          <div class="mb-4">
            <label class="block text-sm mb-2 theme-text-secondary">手机号</label>
            <div class="relative">
              <i
                class="ri-smartphone-line absolute left-3 top-1/2 -translate-y-1/2 theme-input-icon pointer-events-none"
              ></i>
              <input
                v-model="phone"
                placeholder="请输入手机号"
                required
                @blur="handleInputBlur"
                class="block w-full p-2 pl-9 text-sm border border-dashed rounded-lg bg-transparent focus:outline-none placeholder:text-sm theme-input"
              />
            </div>
          </div>
          <div v-if="mode === 'reset'" class="mb-4">
            <label class="block text-sm mb-2 theme-text-secondary">新密码</label>
            <div class="relative">
              <i
                class="ri-lock-2-line absolute left-3 top-1/2 -translate-y-1/2 theme-input-icon pointer-events-none"
              ></i>
              <input
                v-model="password"
                type="password"
                placeholder="请设置新密码"
                required
                @blur="handleInputBlur"
                class="block w-full p-2 pl-9 text-sm border border-dashed rounded-lg bg-transparent focus:outline-none placeholder:text-sm theme-input"
              />
            </div>
          </div>
          <div v-if="mode === 'reset'" class="mb-4">
            <label class="block text-sm theme-text-secondary mb-2">验证码</label>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <i
                  class="ri-key-2-line absolute left-3 top-1/2 -translate-y-1/2 theme-input-icon pointer-events-none"
                ></i>
                <input
                  v-model="code"
                  placeholder="请输入短信验证码"
                  required
                  @blur="handleInputBlur"
                  class="w-full p-2 pl-9 text-sm border border-dashed rounded-lg bg-transparent focus:outline-none placeholder:text-sm theme-input"
                />
              </div>
              <button
                type="button"
                @click="sendCode"
                :disabled="sending"
                class="px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap theme-button-primary"
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
            <label class="block text-sm mb-2 theme-text-secondary">密码</label>
            <div class="relative">
              <i
                class="ri-lock-2-line absolute left-3 top-1/2 -translate-y-1/2 theme-input-icon pointer-events-none"
              ></i>
              <input
                v-model="password"
                type="password"
                placeholder="请输入密码"
                required
                @blur="handleInputBlur"
                class="block w-full p-2 pl-9 text-sm border border-dashed rounded-lg bg-transparent focus:outline-none placeholder:text-sm theme-input"
              />
            </div>
          </div>
          <div class="flex items-center justify-between mt-6 mb-8">
            <label v-if="mode === 'login'" class="flex items-center space-x-2 cursor-pointer group">
              <input type="checkbox" v-model="rememberMe" class="hidden" />
              <div
                class="w-2 h-2 border rounded flex items-center justify-center transition-colors auth-remember-box"
                :class="{ 'is-checked': rememberMe }"
              >
                <i v-if="rememberMe" class="ri-check-line text-[10px] text-white"></i>
              </div>
              <span class="text-xs theme-link transition">记住账号</span>
            </label>
            <a
              v-if="mode === 'login'"
              href="#"
              @click.prevent="mode = 'reset'"
              class="text-xs theme-link"
              >忘记密码？</a
            >
          </div>
          <div class="flex gap-2">
            <button
              type="submit"
              :disabled="loading"
              class="w-full font-bold text-base rounded-full py-3 shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 theme-button-primary"
            >
              <span v-if="!loading">{{ mode === 'login' ? '立即登录' : '重置密码' }}</span>
              <div
                v-else
                class="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin mx-auto"
              ></div>
            </button>
          </div>
          <div v-if="mode === 'reset'" class="text-center mt-4">
            <a href="#" @click.prevent="mode = 'login'" class="text-xs theme-link">返回登录</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '@/components/layout/AppHeader.vue';
import { api } from '@/sdk/app';
import { useDataStore } from '@/composables/useDataStore';

const rootShowMessage = inject('showMessage', null);
const { userInfo, fetchUserData, rememberLogin, savedPhone } = useDataStore();
const router = useRouter();
const appHeaderRef = ref(null);

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

function showMessage(message, type = 'info') {
  if (appHeaderRef.value?.show) {
    appHeaderRef.value.show(message, type);
    return;
  }

  if (typeof rootShowMessage === 'function') {
    rootShowMessage(message, type);
  }
}

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

<style scoped>
.auth-remember-box {
  border-color: var(--card-divider);
}

.auth-remember-box.is-checked {
  background-color: var(--button-primary-bg);
  border-color: var(--button-primary-bg);
}
</style>
