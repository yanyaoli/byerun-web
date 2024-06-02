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
                    <el-button type="primary" @click="Login" :loading="LoginLoading">立即登录</el-button>
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
                    <el-button type="primary" @click="SendSMS" :disabled="codeDisabled" :loading="SmsLoading" block
                        class="sms-button">{{ codeText }}</el-button>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="smsCode" placeholder="请输入验证码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="newPassword" type="password" placeholder="请输入新密码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="ResetPassword" :loading="ResetLoading">提交</el-button>
                </el-form-item>
                <el-button type="text" @click="showLoginForm = true">返回登录</el-button>
            </el-form>

            <div class="footer-links" v-if="showLoginForm">
                <el-link type="primary" target="_blank" @click="showDisclaimer">免责声明</el-link>
                <el-tooltip content="主页" placement="top" open-delay="300">
                    <el-link type="primary" href="https://ohnnn.com" target="_blank">
                        <el-icon><HomeFilled /></el-icon>
                    </el-link>
                </el-tooltip>
                <el-link type="primary" @click="showLoginForm = false">忘记密码</el-link>
            </div>
        </el-main>
    </el-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { login, sendSms, updatePassword } from '@/apis/login';


const showLoginForm = ref(true);
const showDisclaimerForm = ref(false);
const showDisclaimer = () => {
    showLoginForm.value = false;
    showDisclaimerForm.value = true;
}

const phone = ref('');
const password = ref('');
const phoneNum = ref('');
const newPassword = ref('');
const smsCode = ref('');
const codeDisabled = ref(false);
const codeText = ref('获取验证码');
const LoginLoading = ref(false);
const SmsLoading = ref(false);
const ResetLoading = ref(false);
const router = useRouter();

const startTimer = (duration, onTick, onComplete) => {
    let seconds = duration;
    const intervalId = setInterval(() => {
        if (seconds <= 0) {
            clearInterval(intervalId);
            onComplete();
        } else {
            seconds -= 1;
            onTick(seconds);
        }
    }, 1000);
}

const Login = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone.value)) {
        ElMessage.error('请输入正确的手机号');
        return;
    }
    LoginLoading.value = true;

    const response = await login(phone.value, password.value);

    if (response.data.code === 10000) {
        const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
        accounts.push({ phone: phone.value, password: password.value });
        localStorage.setItem('accounts', JSON.stringify(accounts));
        const token = response.data.response.oauthToken.token;
        const userData = response.data.response;
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        ElMessage.success('登录成功');
        LoginLoading.value = false;
        router.push('/user');
    } else {
        ElMessage.error('登录失败: ' + response.data.msg);
        LoginLoading.value = false;
    }
}

const SendSMS = async () => {
    SmsLoading.value = true;
    if (!/^1[3-9]\d{9}$/.test(phoneNum.value)) {
        ElMessage.error('请输入正确的手机号');
        SmsLoading.value = false;
        return;
    }
    try {
        codeText.value = '正在发送';
        const response = await sendSms(phoneNum.value);
        if (response.data.code === 10000) {
            ElMessage.success('验证码发送成功');
            SmsLoading.value = false;
        } else {
            ElMessage.error('验证码发送失败: ' + response.data.msg);
            SmsLoading.value = false;
        }
        startTimer(10, (seconds) => {
            codeText.value = `${seconds} 秒后重新获取`;
        }, () => {
            codeText.value = '获取验证码';
            codeDisabled.value = false;
        });

    } catch (error) {
        ElMessage.error(error.message);
        codeText.value = '获取验证码';
        codeDisabled.value = false;
    }
}

const ResetPassword = async () => {
    ResetLoading.value = true;
    if (!/^1[3-9]\d{9}$/.test(phoneNum.value)) {
        ElMessage.error('请输入正确的手机号');
        ResetLoading.value = false;
        return;
    }
    const response = await updatePassword(phoneNum.value, newPassword.value, smsCode.value);
    if (response.data.code === 10000) {
        ElMessage.success('密码重置成功');
        ResetLoading.value = false;
        phone.value = phoneNum.value;
        password.value = newPassword.value;
        showLoginForm.value = true;
    } else {
        ElMessage.error('密码重置失败: ' + response.data.msg);
        ResetLoading.value = false;
    }
}
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
