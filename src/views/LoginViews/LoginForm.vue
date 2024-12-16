<template>
  <el-header>
    <h1>Byerun</h1>
  </el-header>
  <el-main>
    <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
      <el-form-item prop="phone">
        <el-input
          v-model="loginForm.phone"
          placeholder="请输入手机号"
          clearable
        />
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
        <el-button type="primary" @click="LoginHandler" :loading="LoginLoading"
          >立即登录</el-button
        >
      </el-form-item>
      <div class="disclaimer-container">
        <el-link
          type="text"
          :underline="false"
          @click="$emit('showDisclaimer')"
          class="disclaimer-link"
        ><el-icon><InfoFilled /></el-icon>  
          选择登录表示您已阅读并同意<span class="disclaimer-text"
            >免责声明</span
          >
        </el-link>
      </div>
      <div class="footer-links">
        <el-link type="default" :underline="false" @click="goToHome">返回主页</el-link>
        <el-link type="primary" :underline="false" @click="$emit('showResetPassword')"
          >忘记密码</el-link
        >
      </div>
    </el-form>
  </el-main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useLogin } from "@/hooks/login/";

const router = useRouter();

const loginForm = ref({
  phone: "",
  password: "",
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
      trigger: "blur",
    },
  ],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
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
          const success = await fetchLogin(
            loginForm.value.phone,
            loginForm.value.password
          );
          if (success) {
            router.push("/dashboard");
          }
        }
      } else {
        console.log("error submit!!");
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
.el-header {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.el-main {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px;
}

.el-form {
  width: 100%;
}

.el-button {
  width: 100%;
  border-radius: 20px;
}

.phone-input {
  position: relative;
}

.sms-button {
  position: absolute;
  max-width: 100px;
  right: 0;
  top: 0;
  border-radius: 0;
}

.footer-links {
  display: flex;
  justify-content: space-between;
  text-decoration: none;
}

.disclaimer-container {
  text-align: center;
  margin-top:-16px;
  margin-bottom: 16px;
}

.disclaimer-link {
  font-size: 10px;
  color: #999;
}

.disclaimer-text {
  color: #409eff;
}
</style>