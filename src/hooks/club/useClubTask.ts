import { queryClubTask } from "@/apis/club";
import { ElMessage } from 'element-plus';
import { ref } from "vue";

export default function useClubTask() {
    const clubTask = ref([]);
    const fetchClubTask = async () => {
        clubTask.value = [];
        try {
            const response = await queryClubTask();
            if (response.data.code === 10000) {
                if (response.data.response.length === 0) {
                    clubTask.value = [];
                } else {
                    clubTask.value = response.data.response.map((task: any) => ({
                        ...task,
                        joinStatus: 3
                    }));
                }
            } else {
                ElMessage.error(response.data.msg);
                clubTask.value = [];
            }
        } catch (error: any) {
            ElMessage.error('获取俱乐部任务信息出错: ' + error.message);
            clubTask.value = []
        }
    }
    return {
        clubTask,
        fetchClubTask
    }
}
