<template>
    <div class="app">
        <el-container class="login-container">
            <el-header>
                <h1>UNIRUN HELPER</h1>
            </el-header>
            <el-text>欢迎使用UNIRUN校园跑助手</el-text>
            <el-main>
                <el-form>
                    <el-form-item>
                        <el-input v-model="phone" placeholder="手机号"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-input v-model="password" type="password" placeholder="密码"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="doLogin" :loading="isLoading">立即登录</el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-link type="primary" :href="contactUrl" target="_blank">联系我们</el-link>
                    </el-form-item>
                </el-form>
            </el-main>
        </el-container>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';  // 导入 ElMessage
import { login } from '@/apis/login.api';

const phone = ref('');
const password = ref('');
const isLoading = ref(false);
const router = useRouter();
const contactUrl = ref('https://qm.qq.com/q/s80hGTQMNi');

const doLogin = async () => {

    if (!/^1[3-9]\d{9}$/.test(phone.value)) {
        ElMessage({
            message: '请输入有效的手机号码',
            type: 'error'
        });
        return;
    }
    isLoading.value = true;

    const response = await login(phone.value, password.value);

    if (response.data.code === 10000) {
        const token = response.data.response.oauthToken.token;
        const userData = response.data.response;
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        ElMessage.success('登录成功')
        router.push('/user');
    } else {
        ElMessage.error('登录失败: ' + response.data.msg);
        isLoading.value = false;
    }
}
</script>

<style scoped>
.app {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 100px 0 100px 0;
}

.login-container {
    max-width: 400px;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

h1 {
    margin-bottom: 20px;
    text-align: center;
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

.el-link .el-icon--right.el-icon {
    vertical-align: text-bottom;
}
</style>