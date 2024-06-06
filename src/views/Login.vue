<template>
    <el-container>
        <el-header>
            <h1>UNIRUN HELPER</h1>
            <el-text tag="p">欢迎使用UNIRUN校园跑助手</el-text>
        </el-header>
        <el-main>
            <el-form v-if="showLoginForm">
                <el-form-item>
                    <el-input v-model="phone" placeholder="请输入手机号"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="password" type="password" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="Login" :loading="loginStore.loginLoading">立即登录</el-button>
                </el-form-item>
            </el-form>
            <el-form v-else-if="showDisclaimerForm" class="DisclaimerForm">
                <el-space direction="vertical">
                    <el-text tag="b" size="large">免责声明</el-text>
                    <el-text>为了您的健康，不提倡长期使用。</el-text>
                    <el-text>使用本工具所产生的任何后果，用户需自行承担。</el-text>
                    <el-text>本工具仅供学习交流使用，不得用于任何商业用途。</el-text>
                    <el-link type="primary" href="https://github.com/yanyaoli/unirun-web" target="_blank">开源地址</el-link>
                </el-space>
                <el-button type="primary" @click="showLoginForm = true; showDisclaimerForm = false">返回登录</el-button>
            </el-form>
            <el-form v-else>
                <el-form-item>
                    <el-input v-model="phoneNum" placeholder="请输入手机号" class="phone-input"></el-input>
                    <el-button type="primary" @click="SendSMS" :disabled="codeDisabled" :loading="loginStore.smsLoading" block
                        class="sms-button">{{ codeText }}</el-button>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="smsCode" placeholder="请输入验证码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="newPassword" type="password" placeholder="请输入新密码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="ResetPassword" :loading="loginStore.resetLoading">提交</el-button>
                </el-form-item>
                <el-button type="text" @click="showLoginForm = true">返回登录</el-button>
            </el-form>

            <div class="footer-links" v-if="showLoginForm">
                <el-link type="primary" target="_blank" @click="showDisclaimer">免责声明</el-link>
                <el-link type="primary" @click="showLoginForm = false">忘记密码</el-link>
            </div>
        </el-main>
    </el-container>
</template>

<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import stores from '@/hooks/login/index';

// 使用 Pinia stores
const loginStore = stores.useLoginStore();
const smsStore = stores.useSmsStore();
const resetPasswordStore = stores.useResetPasswordStore();
const router = useRouter();

// 组件内部状态
const showLoginForm = ref(true);
const showDisclaimerForm = ref(false);
const phone = ref('');
const password = ref('');
const phoneNum = ref('');
const newPassword = ref('');
const smsCode = ref('');

// 显示免责声明表单
const showDisclaimer = () => {
    showLoginForm.value = false;
    showDisclaimerForm.value = true;
};

const PhoneValid = () => {
    if (!/^1[3-9]\d{9}$/.test(phone.value)) {
        ElMessage.error('请输入正确的手机号');
        return;
    }
};
// 登录方法
const Login = async () => {
    PhoneValid();
    await loginStore.login(phone.value, password.value);
};

// 发送短信验证码方法
const SendSMS = async () => {
    PhoneValid();
    smsStore.sendSms(phoneNum.value);
};

// 重置密码方法
const ResetPassword = async () => {
    PhoneValid();
    await resetPasswordStore.resetPassword(phoneNum.value, newPassword.value, smsCode.value);
};

// 路由跳转
const goToDashboard = () => {
    router.push('/dashboard');
};

// 监听登录状态变化，自动跳转
watchEffect(() => {
    if (loginStore.isLoggedIn) {
        goToDashboard();
    }
});

// 页面加载完成后检查 token 和 userData
onMounted(() => {
    if (loginStore.token && loginStore.userData) {
        goToDashboard();
    }
});
</script>

<style scoped>
.el-container {
    max-width: 500px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 20px;
    margin: 0 auto;
}

.el-header {
    height: 100px;
    justify-content: space-between;
    width: 100%;
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

.el-button {
    width: 100%;
    border-radius: 20px;
}

.el-link {
    margin-right: 8px;
    text-align: center;
    display: inline-block;
}

.footer-links {
    display: flex;
    justify-content: space-between;
}

.phone-input {
    position: relative;
}

.sms-button {
    position: absolute;
    width: 100px;
    right: 0;
    top: 0;
    border-radius: 0;
}

.DisclaimerForm {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin: auto;
}

.DisclaimerForm .el-space {
    padding: 20px;
}
.DisclaimerForm .el-space .el-text {
    text-align: center !important;
    line-height: 1.5 !important;
}

</style>
