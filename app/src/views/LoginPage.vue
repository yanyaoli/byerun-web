<template>
  <div class="flex items-center justify-center min-h-screen ">
    <Login v-if="!showResetPassword" @showReset="showResetPassword = true" />
    <ResetPassword v-else @backToLogin="showResetPassword = false" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import Login from "../components/Login.vue";
import ResetPassword from "../components/ResetPassword.vue";

const showResetPassword = ref(false);
</script>