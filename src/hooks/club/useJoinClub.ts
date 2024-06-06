import { ref } from 'vue';
import { joinClub } from '@/apis/club';
import { ElMessage } from 'element-plus';

export default function useJoinClub() {
    const JoinLoading = ref(false);
    const fetchJoinClub = async (configurationId: number, type: number) => {
        JoinLoading.value = true;
        try {
            const response = await joinClub(configurationId, type);
            if (response.data.code === 10000) {
                ElMessage.success(response.data.response.message);
                return true;
            } else {
                ElMessage.error(response.data.msg);
                return false;
            }
        } catch (error: any) {
            ElMessage.error(error.message);
            return false;
        } finally {
            JoinLoading.value = false;
        }
    };
    return {
        JoinLoading,
        fetchJoinClub,
    };
}
