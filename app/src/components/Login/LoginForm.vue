<template>
  <el-form
    ref="loginFormRef"
    :model="loginForm"
    :rules="loginRules"
    label-position="left"
  >
    <el-form-item label="" prop="phone">
      <el-input 
        v-model="loginForm.phone" 
        placeholder="请输入手机号"
        :disabled="loading"
      >
        <template #prefix>
          <el-icon>
            <Iphone />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item label="" prop="password">
      <el-input
        v-model="loginForm.password"
        type="password"
        placeholder="请输入密码"
        show-password
        :disabled="loading"
      >
        <template #prefix>
          <el-icon>
            <Lock />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>
    <el-button
      type="primary"
      @click="handleLogin"
      :loading="loading"
      :disabled="loading"
      class="submit-btn"
      style="width: 100%"
    >
      {{ loading ? '登录中...' : '登录' }}
    </el-button>
    <div class="form-footer">
      <el-button type="text" @click="switchMode" :disabled="loading" class="forgotBtn"
        >忘记密码？</el-button
      >
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";
import { Lock, Iphone } from '@element-plus/icons-vue';

const router = useRouter();
const loginFormRef = ref<FormInstance>();
const emit = defineEmits(['switch-mode', 'login']);

// 只使用父组件传递的loading状态
const props = defineProps<{
  loading: boolean
}>();

const loginForm = reactive({
  phone: "",
  password: "",
});

// 登录表单验证规则
const loginRules = {
  phone: [
    { required: true, message: "请输入手机号" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" },
  ],
  password: [
    { required: true, message: "请输入密码" },
    { min: 6, message: "密码长度不能小于6位" },
  ],
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  try {
    await loginFormRef.value.validate();
    emit('login', loginForm.phone, loginForm.password);
  } catch (error: any) {
    ElMessage.error(error.message || "登录失败");
  }
};

const switchMode = () => {
  if (props.loading) return; // 如果正在加载，不允许切换模式
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
/* 按钮 */
/* 忘记密码按钮 */
.forgotBtn {
  padding: 0;
  color: var(--el-text-color-secondary);
  width: 100%;
}
.forgotBtn:hover {
  color: var(--text-color);
  transform: translateY(-2px);
}
</style>