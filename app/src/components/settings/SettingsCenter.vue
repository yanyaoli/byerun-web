<template>
  <div class="space-y-3">
    <button
      type="button"
      @click="settingsVisible = true"
      class="w-full flex items-center gap-3 rounded-lg px-4 py-3 theme-card-soft transition-colors hover:opacity-80 text-left cursor-pointer border-none"
    >
      <span class="h-9 w-9 rounded-lg flex items-center justify-center theme-card">
        <i class="ri-settings-3-line text-lg theme-text-primary"></i>
      </span>
      <span class="min-w-0 flex-1">
        <span class="block text-sm font-semibold theme-text-primary">设置中心</span>
        <span class="block text-xs theme-text-tertiary truncate">配置自定义接口地址</span>
      </span>
      <i class="ri-arrow-right-s-line text-lg theme-text-tertiary"></i>
    </button>

    <Drawer v-model="settingsVisible" title="设置中心">
      <div class="px-5 py-6 space-y-6">
        <div>
          <div class="flex items-center gap-3 border-b border-[var(--card-border)] pb-4">
            <span class="h-9 w-9 flex items-center justify-center theme-card-soft">
              <i class="ri-server-line text-base theme-text-secondary"></i>
            </span>
            <div>
              <h2 class="text-sm font-bold theme-text-primary">服务接口</h2>
              <p class="text-xs theme-text-tertiary mt-1">自定义后仅保存在当前浏览器</p>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between gap-3">
            <label for="main-api-url" class="text-sm font-semibold theme-text-primary">UNIRUN 主接口</label>
            <span class="text-[11px] theme-text-tertiary">{{ apiBaseUrlIsCustom ? '自定义' : '环境默认' }}</span>
          </div>
          <input
            id="main-api-url"
            v-model="apiBaseUrlOverride"
            type="url"
            inputmode="url"
            autocomplete="url"
            spellcheck="false"
            class="w-full bg-transparent border-0 border-b rounded-none px-0 py-2 text-sm theme-input focus:outline-none"
          />
          <button type="button" @click="resetApiBaseUrl" class="text-xs theme-text-secondary cursor-pointer border-none bg-transparent p-0">
            恢复默认地址
          </button>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between gap-3">
            <label for="autorun-api-url" class="text-sm font-semibold theme-text-primary">自动任务接口</label>
            <span class="text-[11px] theme-text-tertiary">{{ autorunApiBaseUrlIsCustom ? '自定义' : '环境默认' }}</span>
          </div>
          <input
            id="autorun-api-url"
            v-model="autorunApiBaseUrlOverride"
            type="url"
            inputmode="url"
            autocomplete="url"
            spellcheck="false"
            class="w-full bg-transparent border-0 border-b rounded-none px-0 py-2 text-sm theme-input focus:outline-none"
          />
          <button type="button" @click="resetAutorunApiBaseUrl" class="text-xs theme-text-secondary cursor-pointer border-none bg-transparent p-0">
            恢复默认地址
          </button>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between gap-3">
            <label for="chat-api-url" class="text-sm font-semibold theme-text-primary">聊天接口</label>
            <span class="text-[11px] theme-text-tertiary">{{ chatApiBaseUrlIsCustom ? '自定义' : '环境默认' }}</span>
          </div>
          <input
            id="chat-api-url"
            v-model="chatApiBaseUrlOverride"
            type="url"
            inputmode="url"
            autocomplete="url"
            spellcheck="false"
            class="w-full bg-transparent border-0 border-b rounded-none px-0 py-2 text-sm theme-input focus:outline-none"
          />
          <button type="button" @click="resetChatApiBaseUrl" class="text-xs theme-text-secondary cursor-pointer border-none bg-transparent p-0">
            恢复默认地址
          </button>
        </div>

        <button
          type="button"
          @click="saveApiBaseUrls"
          class="w-full theme-button-primary px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer border-none"
        >
          保存设置
        </button>
      </div>
    </Drawer>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Drawer from '@/components/ui/Drawer.vue';
import { showMessage } from '@/composables/useMessage';
import { getApiBaseUrlDefault, getApiBaseUrlOverride, setApiBaseUrlOverride } from '@/sdk/app';
import {
  getAutorunApiBaseUrlDefault,
  getAutorunApiBaseUrlOverride,
  setAutorunApiBaseUrlOverride,
} from '@/sdk/autorun';
import {
  getChatApiBaseUrlDefault,
  getChatApiBaseUrlOverride,
  setChatApiBaseUrlOverride,
} from '@/sdk/message/config';

const storedApiBaseUrl = getApiBaseUrlOverride();
const apiBaseUrlOverride = ref(storedApiBaseUrl || getApiBaseUrlDefault());
const apiBaseUrlIsCustom = ref(Boolean(storedApiBaseUrl));
const storedAutorunApiBaseUrl = getAutorunApiBaseUrlOverride();
const autorunApiBaseUrlOverride = ref(storedAutorunApiBaseUrl || getAutorunApiBaseUrlDefault());
const autorunApiBaseUrlIsCustom = ref(Boolean(storedAutorunApiBaseUrl));
const storedChatApiBaseUrl = getChatApiBaseUrlOverride();
const chatApiBaseUrlOverride = ref(storedChatApiBaseUrl || getChatApiBaseUrlDefault());
const chatApiBaseUrlIsCustom = ref(Boolean(storedChatApiBaseUrl));
const settingsVisible = ref(false);

watch(settingsVisible, (visible) => {
  if (visible) {
    const mainStored = getApiBaseUrlOverride();
    apiBaseUrlOverride.value = mainStored || getApiBaseUrlDefault();
    apiBaseUrlIsCustom.value = Boolean(mainStored);

    const autoStored = getAutorunApiBaseUrlOverride();
    autorunApiBaseUrlOverride.value = autoStored || getAutorunApiBaseUrlDefault();
    autorunApiBaseUrlIsCustom.value = Boolean(autoStored);

    const chatStored = getChatApiBaseUrlOverride();
    chatApiBaseUrlOverride.value = chatStored || getChatApiBaseUrlDefault();
    chatApiBaseUrlIsCustom.value = Boolean(chatStored);
  }
});

const saveApiBaseUrls = () => {
  apiBaseUrlOverride.value = apiBaseUrlOverride.value.trim() || getApiBaseUrlDefault();
  apiBaseUrlIsCustom.value = apiBaseUrlOverride.value !== getApiBaseUrlDefault();
  setApiBaseUrlOverride(apiBaseUrlIsCustom.value ? apiBaseUrlOverride.value : '');

  autorunApiBaseUrlOverride.value =
    autorunApiBaseUrlOverride.value.trim() || getAutorunApiBaseUrlDefault();
  autorunApiBaseUrlIsCustom.value =
    autorunApiBaseUrlOverride.value !== getAutorunApiBaseUrlDefault();
  setAutorunApiBaseUrlOverride(
    autorunApiBaseUrlIsCustom.value ? autorunApiBaseUrlOverride.value : '',
  );

  chatApiBaseUrlOverride.value = chatApiBaseUrlOverride.value.trim() || getChatApiBaseUrlDefault();
  chatApiBaseUrlIsCustom.value = chatApiBaseUrlOverride.value !== getChatApiBaseUrlDefault();
  setChatApiBaseUrlOverride(chatApiBaseUrlIsCustom.value ? chatApiBaseUrlOverride.value : '');

  showMessage('保存成功', 'success');
};

const resetApiBaseUrl = () => {
  apiBaseUrlOverride.value = getApiBaseUrlDefault();
  apiBaseUrlIsCustom.value = false;
  setApiBaseUrlOverride('');
};

const resetAutorunApiBaseUrl = () => {
  autorunApiBaseUrlOverride.value = getAutorunApiBaseUrlDefault();
  autorunApiBaseUrlIsCustom.value = false;
  setAutorunApiBaseUrlOverride('');
};

const resetChatApiBaseUrl = () => {
  chatApiBaseUrlOverride.value = getChatApiBaseUrlDefault();
  chatApiBaseUrlIsCustom.value = false;
  setChatApiBaseUrlOverride('');
};
</script>