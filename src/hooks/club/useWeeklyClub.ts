import { ref } from 'vue';
import { queryWeeklyClub } from '@/apis/club';
import { ElMessage } from 'element-plus';


export default function useWeeklyClub() {
    const weeklyClubs = ref([]);
    const fetchWeeklyClub = async (weekDay: number) => {
        weeklyClubs.value = [];
        try {
            const response = await queryWeeklyClub(weekDay);
            if (response.data.code === 10000) {
                weeklyClubs.value = response.data.response.length === 0 ? [] : response.data.response;
            } else {
                ElMessage.error(response.data.msg);
                weeklyClubs.value = [];
            }
        } catch (error: any) {
            ElMessage.error('获取俱乐部信息出错: ' + error.message);
            weeklyClubs.value = [];
        }
    };
    return {
        weeklyClubs,
        fetchWeeklyClub,
    };
}