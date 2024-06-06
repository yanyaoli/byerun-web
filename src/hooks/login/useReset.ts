import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { updatePassword } from '@/apis/login';

interface ResetResponse {
    data: {
        code: number;
        msg: string;
    };
}

export default function useResetPassword() {
    const ResetLoading = ref(false);

    const fetchResetPassword = async (phoneNum: number, newPassword: string, smsCode: number) => {
        ResetLoading.value = true;
        const response: ResetResponse = await updatePassword(phoneNum, newPassword, smsCode);
        if (response.data.code === 10000) {
            ElMessage.success('密码重置成功');
            ResetLoading.value = false;
            return true;
        } else {
            ElMessage.error('密码重置失败: ' + response.data.msg);
            ResetLoading.value = false;
            return false;
        }
    };

    return {
        ResetLoading,
        fetchResetPassword,
    };
}
