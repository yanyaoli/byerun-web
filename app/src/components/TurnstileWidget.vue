<template>
  <div ref="container" class="turnstile-widget flex justify-center min-h-[65px] items-center"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  siteKey: { type: String, default: '' },
});

const emit = defineEmits(['token', 'expired', 'error']);

const container = ref(null);
let widgetId = null;

const SITE_KEY = props.siteKey || import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

function loadScript() {
  return new Promise((resolve) => {
    if (window.turnstile) {
      resolve();
      return;
    }
    window.__turnstileWidgetLoaded = resolve;
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__turnstileWidgetLoaded';
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  });
}

function renderWidget() {
  if (!window.turnstile || !container.value || !SITE_KEY) return;
  if (widgetId) {
    window.turnstile.remove(widgetId);
    widgetId = null;
  }
  widgetId = window.turnstile.render(container.value, {
    sitekey: SITE_KEY,
    callback: (token) => {
      emit('token', token);
    },
    'expired-callback': () => {
      emit('expired');
    },
    'error-callback': (code) => {
      emit('error', code);
    },
  });
}

function reset() {
  if (window.turnstile && widgetId) {
    window.turnstile.reset(widgetId);
  }
}

onMounted(async () => {
  if (!SITE_KEY) return;
  await loadScript();
  renderWidget();
});

watch(() => props.siteKey, () => {
  if (widgetId && window.turnstile) {
    window.turnstile.remove(widgetId);
    widgetId = null;
  }
  renderWidget();
});

defineExpose({ reset });
</script>
