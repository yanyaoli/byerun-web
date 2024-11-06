<template>
  <el-container>
    <el-header>
      <h1>Byerun</h1>
    </el-header>
    <el-main>
      <el-form v-if="showLoginForm" :model="loginForm" :rules="rules" ref="loginFormRef">
        <el-form-item prop="phone">
          <el-input v-model="loginForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          ></el-input>
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
      </el-form>
      <el-form v-else-if="showDisclaimerForm" class="DisclaimerForm">
        <el-space direction="vertical">
          <el-text tag="b" size="large">免责声明</el-text>
          <el-text>为了您的健康，不提倡长期使用。</el-text>
          <el-text>使用本工具所产生的任何后果，用户需自行承担。</el-text>
          <el-text>本工具仅供学习交流使用，不得用于任何商业用途。</el-text>
          <el-link type="primary" :href="githubURL" target="_blank">
            <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2307" width="20" height="20">
                <path d="M64 512c0 195.2 124.8 361.6 300.8 422.4 22.4 6.4 19.2-9.6 19.2-22.4v-76.8c-134.4 16-140.8-73.6-150.4-89.6-19.2-32-60.8-38.4-48-54.4 32-16 64 3.2 99.2 57.6 25.6 38.4 76.8 32 105.6 25.6 6.4-22.4 19.2-44.8 35.2-60.8-144-22.4-201.6-108.8-201.6-211.2 0-48 16-96 48-131.2-22.4-60.8 0-115.2 3.2-121.6 57.6-6.4 118.4 41.6 124.8 44.8 32-9.6 70.4-12.8 112-12.8 41.6 0 80 6.4 112 12.8 12.8-9.6 67.2-48 121.6-44.8 3.2 6.4 25.6 57.6 6.4 118.4 32 38.4 48 83.2 48 131.2 0 102.4-57.6 188.8-201.6 214.4 22.4 22.4 38.4 54.4 38.4 92.8v112c0 9.6 0 19.2 16 19.2C832 876.8 960 710.4 960 512c0-246.4-201.6-448-448-448S64 265.6 64 512z" fill="#040000" p-id="2308"></path>
            </svg>
          </el-link>
        </el-space>
        <el-button
          type="primary"
          @click="
            showLoginForm = true;
            showDisclaimerForm = false;
          "
          >返回登录</el-button
        >
      </el-form>
      <el-form v-else :model="resetForm" :rules="rules" ref="resetFormRef">
        <el-form-item prop="phoneNum">
          <el-input
            v-model="resetForm.phoneNum"
            placeholder="请输入手机号"
            class="phone-input"
          ></el-input>
          <el-button
            type="primary"
            @click="SendSMSHandler"
            :disabled="codeDisabled"
            :loading="SmsLoading"
            block
            class="sms-button"
            >{{ codeText }}</el-button
          >
        </el-form-item>
        <el-form-item prop="smsCode">
          <el-input v-model="resetForm.smsCode" placeholder="请输入验证码"></el-input>
        </el-form-item>
        <el-form-item prop="newPassword">
          <el-input
            v-model="resetForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="ResetPasswordHandler"
            :loading="ResetLoading"
            >提交</el-button
          >
        </el-form-item>
        <el-button type="text" @click="showLoginForm = true"
          >返回登录</el-button
        >
      </el-form>

      <div class="footer-links" v-if="showLoginForm">
        <el-link type="primary" target="_blank" @click="showDisclaimer"
          >免责声明</el-link
        >
        <el-link type="primary" @click="showLoginForm = false"
          >忘记密码</el-link
        >
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import "@/styles/login/index.css";
import { ref, watchEffect, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useLogin, useSms, useResetPassword } from "@/hooks/login/";
import address from "@/services/address";

const { githubURL } = address;

const router = useRouter();

const showLoginForm = ref(true);
const showDisclaimerForm = ref(false);

const loginForm = ref({
  phone: '',
  password: ''
});

const resetForm = ref({
  phoneNum: '',
  newPassword: '',
  smsCode: ''
});

const { LoginLoading, isLoggedIn, fetchLogin, LoginState } = useLogin();
const { SmsLoading, codeText, codeDisabled, fetchSendSMS } = useSms();
const { ResetLoading, fetchResetPassword } = useResetPassword();

// 规则
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
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  phoneNum: [
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
  smsCode: [{ required: true, message: "请输入验证码", trigger: "blur" }],
  newPassword: [{ required: true, message: "请输入新密码", trigger: "blur" }]
};

// 显示免责声明表单
const showDisclaimer = () => {
  showLoginForm.value = false;
  showDisclaimerForm.value = true;
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
  const loginFormRef = ref(null);
  loginFormRef.value.validate((valid) => {
    if (valid) {
      if (PhoneValid(loginForm.value.phone)) {
        fetchLogin(loginForm.value.phone, loginForm.value.password);
      }
    } else {
      console.log('error submit!!');
      return false;
    }
  });
};

const SendSMSHandler = () => {
  const resetFormRef = ref(null);
  resetFormRef.value.validateField('phoneNum', (valid) => {
    if (valid) {
      if (PhoneValid(resetForm.value.phoneNum)) {
        fetchSendSMS(resetForm.value.phoneNum);
      }
    } else {
      console.log('error submit!!');
      return false;
    }
  });
};

const ResetPasswordHandler = async () => {
  const resetFormRef = ref(null);
  resetFormRef.value.validate(async (valid) => {
    if (valid) {
      if (PhoneValid(resetForm.value.phoneNum)) {
        const success = await fetchResetPassword(
          resetForm.value.phoneNum,
          resetForm.value.newPassword,
          resetForm.value.smsCode
        );
        if (success) {
          loginForm.value.phone = resetForm.value.phoneNum;
          loginForm.value.password = resetForm.value.newPassword;
          showLoginForm.value = true;
        }
      }
    } else {
      console.log('error submit!!');
      return false;
    }
  });
};

const goToHome = () => {
  router.push("/");
};

// 路由跳转
const goToDashboard = () => {
  router.push("/dashboard");
};

// 监听登录状态变化，自动跳转
watchEffect(() => {
  if (isLoggedIn.value) {
    goToDashboard();
  }
});

// 页面加载完成后检查 token 和 userData
onMounted(async () => {
  const loginState = await LoginState();
  if (loginState) {
    goToDashboard();
  }
});
</script>

<style scoped></style>