<template>
  <el-form
    ref="resetFormRef"
    :model="resetForm"
    :rules="resetRules"
    label-position="left"
  >
    <el-form-item label="" prop="phone">
      <el-input v-model="resetForm.phone" placeholder="请输入手机号">
        <template #prefix>
          <el-icon>
            <Iphone />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item label="" prop="code">
      <el-input v-model="resetForm.code" placeholder="请输入验证码">
        <template #prefix>
          <el-icon>
            <Key />
          </el-icon>
        </template>
        <template #append>
          <el-button
            :disabled="!!countdown || loading"
            @click="handleSendCode"
          >
            {{ countdown ? `${countdown}s` : "获取验证码" }}
          </el-button>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item label="" prop="password">
      <el-input
        v-model="resetForm.password"
        type="password"
        placeholder="请输入新密码"
        show-password
      >
        <template #prefix>
          <el-icon>
            <Lock />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item label="" prop="confirmPassword">
      <el-input
        v-model="resetForm.confirmPassword"
        type="password"
        placeholder="请再次输入新密码"
        show-password
      >
        <template #prefix>
          <el-icon>
            <Lock />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>

    <div class="form-footer">
      <el-button type="text" @click="switchMode" class="backBtn">返回登录</el-button>
      <el-button
        type="primary"
        @click="handleReset"
        :loading="loading"
        class="submit-btn"
      >
        重置密码
      </el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";
import { Lock, Iphone, Key } from '@element-plus/icons-vue';

const resetFormRef = ref<FormInstance>();
const loading = ref(false); // useAuth 替换
const countdown = ref(0);
const emit = defineEmits(['switch-mode', 'reset-password', 'send-code']);

const resetForm = reactive({
  phone: "",
  code: "",
  password: "",
  confirmPassword: "",
});

// 重置密码表单验证规则
const resetRules = {
  phone: [
    { required: true, message: "请输入手机号" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" },
  ],
  code: [
    { required: true, message: "请输入验证码" },
    { len: 6, message: "验证码长度为6位" },
  ],
  password: [
    { required: true, message: "请输入新密码" },
    { min: 6, message: "密码长度不能小于6位" },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码" },
    {
      validator: (rule: any, value: string) => {
        if (value !== resetForm.password) {
          return Promise.reject("两次输入的密码不一致");
        }
        return Promise.resolve();
      },
    },
  ],
};

const handleReset = async () => {
  if (!resetFormRef.value) return;
  try {
    await resetFormRef.value.validate();
    loading.value = true;
    emit('reset-password', resetForm.phone, resetForm.password, resetForm.code);
  } catch (error: any) {
    ElMessage.error(error.message || "重置失败");
  } finally {
    loading.value = false;
  }
};

const handleSendCode = async () => {
  if (!resetForm.phone) {
    ElMessage.warning("请输入手机号");
    return;
  }
  try {
    loading.value = true;
    emit('send-code', resetForm.phone);
  } catch (error: any) {
    ElMessage.error(error.message || "发送失败");
  } finally {
    loading.value = false;
  }
};

const switchMode = () => {
  emit('switch-mode');
};
</script>

<style scoped>
.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

/* 返回按钮 */
.backBtn {
  color: var(--el-text-color-secondary);
  width:100%;
  padding: 0;
}
.backBtn:hover {
  color: var(--text-color);
  transform: translateY(-2px);
}
</style>