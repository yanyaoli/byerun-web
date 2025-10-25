<template>
    <div class="login-page">
        <Login v-if="!isLogin && !showResetPassword" @showReset="showResetPassword = true" />
        <ResetPassword v-else-if="!isLogin && showResetPassword" @backToLogin="showResetPassword = false" />
    </div>
</template>

<script setup>
import { ref } from "vue";
import Login from "../components/Login.vue";
import ResetPassword from "../components/ResetPassword.vue";

const isLogin = ref(false);
const showResetPassword = ref(false);
</script>