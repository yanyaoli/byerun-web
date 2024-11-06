<template>
  <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
    <el-form-item prop="phone">
      <el-input v-model="loginForm.phone" placeholder="请输入手机号" clearable />
    </el-form-item>
    <el-form-item prop="password">
      <el-input
        v-model="loginForm.password"
        type="password"
        placeholder="请输入密码"
        show-password
        clearable
      />
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="LoginHandler"
        :loading="LoginLoading"
        >立即登录</el-button
      >
    </el-form-item>
    <el-form-item>
      <el-button type="default" @click="goToHome">返回主页</el-button>
    </el-form-item>
    <div class="footer-links">
      <el-link type="primary" @click="$emit('showDisclaimer')">免责声明</el-link>
      <el-link type="primary" @click="$emit('showResetPassword')">忘记密码</el-link>
    </div>
  </el-form>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useLogin } from '@/hooks/login/';

const router = useRouter();

const loginForm = ref({
  phone: '',
  password: ''
});

const loginFormRef = ref(null);

const { LoginLoading, fetchLogin } = useLogin();

const rules = {
  phone: [
    { required: true, message: "请输入正确的手机号码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (/^1\d{10}$/.test(value) === false) {
          callback(new Error("手机号格式错误"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }]
};

const PhoneValid = (phone) => {
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.error("请输入正确的手机号");
    return false;
  } else {
    return true;
  }
};

const LoginHandler = () => {
  if (loginFormRef.value) {
    loginFormRef.value.validate(async (valid) => {
      if (valid) {
        if (PhoneValid(loginForm.value.phone)) {
          const success = await fetchLogin(loginForm.value.phone, loginForm.value.password);
          if (success) {
            router.push('/dashboard');
          }
        }
      } else {
        console.log('error submit!!');
        return false;
      }
    });
  }
};

const goToHome = () => {
  router.push("/");
};
</script>

<style scoped>
.footer-links {
  display: flex;
  justify-content: space-between;
}
</style>