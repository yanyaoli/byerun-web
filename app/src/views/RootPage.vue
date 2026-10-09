<template>
  <HomePage v-if="isAuthenticated" />
  <AuthPage v-else />
</template>

<script setup>
defineOptions({
  name: 'RootPage',
});
import { computed } from 'vue';
import AuthPage from '@/views/AuthPage.vue';
import HomePage from '@/views/HomePage.vue';
import { useDataStore } from '@/composables/useDataStore';

const { token } = useDataStore();

const isAuthenticated = computed(() => Boolean(token.value));
</script>