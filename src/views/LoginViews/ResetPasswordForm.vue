<template>
  <el-header>
    <h1>重置密码</h1>
  </el-header>
  <el-main>
    <el-form :model="resetForm" :rules="rules" ref="resetFormRef">
      <el-form-item prop="phoneNum">
        <el-input
          v-model="resetForm.phoneNum"
          placeholder="请输入手机号"
          class="phone-input"
          clearable
        />
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
        <el-input
          v-model="resetForm.smsCode"
          placeholder="请输入验证码"
          clearable
        />
      </el-form-item>
      <el-form-item prop="newPassword">
        <el-input
          v-model="resetForm.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
          clearable
        />
      </el-form-item>
    </el-form>
    <div class="button-group">
      <el-button type="" @click="$emit('backToLogin')">返回登录</el-button>
      <el-button
        type="primary"
        @click="ResetPasswordHandler"
        :loading="ResetLoading"
        >提交</el-button
      >
    </div>
  </el-main>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { useSms, useResetPassword } from "@/hooks/login/";

const resetForm = ref({
  phoneNum: "",
  newPassword: "",
  smsCode: "",
});

const resetFormRef = ref(null); // 初始化 resetFormRef

const { SmsLoading, codeText, codeDisabled, fetchSendSMS } = useSms();
const { ResetLoading, fetchResetPassword } = useResetPassword();

const rules = {
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
      trigger: "blur",
    },
  ],
  smsCode: [{ required: true, message: "请输入验证码", trigger: "blur" }],
  newPassword: [{ required: true, message: "请输入新密码", trigger: "blur" }],
};

const PhoneValid = (phone) => {
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.error("请输入正确的手机号");
    return false;
  } else {
    return true;
  }
};

const SendSMSHandler = () => {
  if (resetFormRef.value) {
    resetFormRef.value.validateField("phoneNum", (valid) => {
      if (valid) {
        if (PhoneValid(resetForm.value.phoneNum)) {
          fetchSendSMS(resetForm.value.phoneNum);
        }
      } else {
        console.log("error submit!!");
        return false;
      }
    });
  }
};

const ResetPasswordHandler = async () => {
  if (resetFormRef.value) {
    resetFormRef.value.validate(async (valid) => {
      if (valid) {
        if (PhoneValid(resetForm.value.phoneNum)) {
          const success = await fetchResetPassword(
            resetForm.value.phoneNum,
            resetForm.value.newPassword,
            resetForm.value.smsCode
          );
          if (success) {
            resetForm.value.phoneNum = "";
            resetForm.value.newPassword = "";
            resetForm.value.smsCode = "";
          }
        }
      } else {
        console.log("error submit!!");
        return false;
      }
    });
  }
};
</script>

<style scoped>
.el-header {
  width: 100%;
  padding: 20px;
  justify-content: space-between;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.el-form {
  width: 100%;
}

.el-form-item {
  margin-bottom: 20px;
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

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.button-group .el-button {
  width: 48%;
  border-radius: 20px;
}
</style>