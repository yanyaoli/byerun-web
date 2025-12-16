<template>
    <div class="app container mx-auto p-4">
        <span>        <p>来早了，这里正在施工中</p>
        <i class="fa-solid fa-person-digging"></i></span>

        <!-- <div class="flex items-center justify-between mb-4">
            <nav class="flex gap-2">
                <button v-for="item in menuItems" :key="item.index" @click="handleSelect(item.index)"
                    :class="['px-3 py-1 rounded font-medium', activeName === item.index ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700']">
                    {{ item.label }}
                </button>
            </nav>
        </div>

        <div class="overflow-auto" :style="{ maxHeight: 'calc(100vh - 300px)' }">
            <div v-if="clubs.length === 0" class="text-center text-gray-500 py-12">{{ emptyMessage }}</div>
            <div v-for="(club, idx) in clubs" :key="club.configurationId || club.id || club.taskId || idx"
                class="border rounded-lg p-4 mb-4 bg-white shadow-sm">
                <div class="flex items-start justify-between mb-3">
                    <h3 class="text-lg font-semibold">{{ club.activityName }}</h3>
                    <div>
                        <button @click="handleJoin(club)" :disabled="isDisabled(club)" :class="actionClass(club)">
                            {{ actionLabel(club) }}
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-2 text-sm text-gray-700">
                    <div class="flex items-center gap-2"><span class="text-gray-400">👩‍🏫</span> <span
                            class="font-medium mr-2">教师：</span>{{ club.teacherName }}</div>
                    <div class="flex items-center gap-2"><span class="text-gray-400">👥</span> <span
                            class="font-medium mr-2">人数：</span>{{ club.joinStudentNum }} / {{ club.studentNum }}人</div>
                    <div class="flex items-center gap-2"><span class="text-gray-400">⏰</span> <span
                            class="font-medium mr-2">时间：</span>周{{ weekDayMap[club.weekDay] }} {{ club.startTime }} - {{
                        club.endTime }}</div>
                    <div class="flex items-center gap-2"><span class="text-gray-400">📍</span> <span
                            class="font-medium mr-2">地点：</span>{{ club.addressDetail }}</div>
                    <div class="flex items-center gap-2"><span class="text-gray-400">ℹ️</span> <span
                            class="font-medium mr-2">介绍：</span>{{ club.clubIntroduction }}</div>
                </div>
            </div>
        </div> -->
    </div>
</template>


<script setup>
import { ref, reactive, onMounted, inject, computed } from 'vue';
import { api } from "@/composables/useApi";

const showMessage = inject('showMessage');

const props = defineProps({ userInfo: { type: Object, default: null } });

const user = ref(props.userInfo || JSON.parse(localStorage.getItem('userData')) || null);
const clubs = ref([]);
const loading = ref(true);
const activeName = ref('1');
const menuItems = [
    { index: '1', label: '周一' },
    { index: '2', label: '周二' },
    { index: '3', label: '周三' },
    { index: '4', label: '周四' },
    { index: '5', label: '周五' },
    { index: '6', label: '我的记录' },
    { index: '7', label: '我的任务' },
];
const weekDayMap = reactive({
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六',
    7: '日'
});

const emptyMessage = computed(() => {
    if (activeName.value === '6') return '暂无我的俱乐部记录';
    if (activeName.value === '7') return '暂无俱乐部任务';
    return '暂无俱乐部活动或俱乐部活动已达标';
});



const handleSelect = async (index) => {
    activeName.value = index;
    if (index === '6') {
        await loadMyClubRecords();
    } else if (index === '7') {
        await loadMyTasks();
    } else {
        await fetchClubInfo(index);
    }
};

const fetchClubInfo = async (weekDay) => {
    loading.value = true;
    try {
        const response = await api.queryClubInfo(weekDay);
        const data = response.data;
        if (data && data.code === 10000) {
            if (!data.response || data.response.length === 0) {
                clubs.value = [];
            } else {
                clubs.value = data.response.map(club => ({
                    ...club,
                    weekDay: Number(club.weekDay),
                    joinStatus: Number(club.joinStatus)
                }));
            }
        } else {
            clubs.value = [];
            showMessage(data?.msg || '获取俱乐部信息失败', 'error');
        }
    } catch (e) {
        console.error('fetchClubInfo error:', e);
        clubs.value = [];
        showMessage('获取俱乐部信息异常', 'error');
    } finally {
        loading.value = false;
    }
};

const fetchMyTask = async () => {
    try {
        const response = await api.queryMyClubTask();
        const data = response.data;
        if (data && data.code === 10000) {
            return data.response || [];
        } else {
            showMessage(data?.msg || '获取任务信息失败', 'error');
            return [];
        }
    } catch (e) {
        console.error('fetchMyTask error:', e);
        showMessage('获取任务信息异常', 'error');
        return [];
    }
};

const fetchMyClub = async () => {
    try {
        const studentId = user.value?.studentId;
        if (!studentId) return [];
        const response = await api.queryMyClubRecord(studentId);
        const data = response.data;
        if (data && data.code === 10000) {
            return data.response || [];
        } else {
            showMessage(data?.msg || '获取我的俱乐部失败', 'error');
            return [];
        }
    } catch (e) {
        console.error('fetchMyClub error:', e);
        showMessage('获取我的俱乐部异常', 'error');
        return [];
    }
};

const loadMyClubRecords = async () => {
    loading.value = true;
    try {
        const data = await fetchMyClub();
        const normalize = (item) => ({
            ...item,
            weekDay: item.weekDay ? Number(item.weekDay) : item.weekDay,
            joinStatus: item.joinStatus !== undefined ? Number(item.joinStatus) : item.joinStatus
        });
        clubs.value = (data || []).map(normalize);
    } catch (e) {
        console.error('loadMyClubRecords error:', e);
        showMessage('加载俱乐部记录失败', 'error');
        clubs.value = [];
    } finally {
        loading.value = false;
    }
};

const loadMyTasks = async () => {
    loading.value = true;
    try {
        const data = await fetchMyTask();
        const normalize = (item) => ({
            ...item,
            weekDay: item.weekDay ? Number(item.weekDay) : item.weekDay,
            joinStatus: item.joinStatus !== undefined ? Number(item.joinStatus) : item.joinStatus
        });
        clubs.value = (data || []).map(normalize);
    } catch (e) {
        console.error('loadMyTasks error:', e);
        showMessage('加载俱乐部任务失败', 'error');
        clubs.value = [];
    } finally {
        loading.value = false;
    }
};

const handleJoin = async (club) => {
    let type;
    if (club.joinStatus === 0 || club.joinStatus === 2) {
        type = 1;
    } else if (club.joinStatus === 1 || club.joinStatus === 3) {
        type = 2;
    } else {
        return;
    }

    try {
        const response = await api.joinClub(club.configurationId, type);
        const data = response.data;
        if (data && data.code === 10000) {
            showMessage(data.response?.message || '操作成功', 'success');
            if (activeName.value === '6') {
                await loadMyClubRecords();
            } else if (activeName.value === '7') {
                await loadMyTasks();
            } else {
                await fetchClubInfo(activeName.value);
            }
        } else {
            showMessage(data?.msg || '操作失败', 'error');
        }
    } catch (e) {
        console.error('handleJoin error:', e);
        showMessage('报名/取消报名操作异常', 'error');
    }
};

const actionLabel = (club) => {
    if (club.joinStatus === 0) return '报名';
    if (club.joinStatus === 1) return '取消报名';
    if (club.joinStatus === 2) return '报名';
    if (club.joinStatus === 3) return '活动进行中';
    return '活动已失效';
};

const actionClass = (club) => {
    const base = 'px-3 py-1 rounded font-medium text-sm';
    if (club.joinStatus === 0 || club.joinStatus === 2) return base + ' bg-blue-600 text-white hover:bg-blue-700';
    if (club.joinStatus === 1) return base + ' bg-red-600 text-white hover:bg-red-700';
    if (club.joinStatus === 3) return base + ' bg-green-600 text-white';
    return base + ' bg-gray-300 text-gray-600';
};

const isDisabled = (club) => {
    // Treat expired (>3) as disabled
    return !(club.joinStatus === 0 || club.joinStatus === 1 || club.joinStatus === 2 || club.joinStatus === 3);
};

onMounted(async () => {
    // prefer provided prop
    if (props.userInfo) {
        user.value = props.userInfo;
    } else if (!user.value) {
        // try deriving from localStorage keys set by Login
        const studentId = localStorage.getItem('studentId');
        const userId = localStorage.getItem('userId');
        const schoolId = localStorage.getItem('schoolId');
        if (studentId) {
            user.value = { studentId: Number(studentId), userId, schoolId };
        }
    }

    if (!user.value) {
        // not logged in, redirect to login
        window.location.href = '/login';
        return;
    }

    if (activeName.value === '6') {
        await loadMyClubRecords();
    } else if (activeName.value === '7') {
        await loadMyTasks();
    } else {
        await fetchClubInfo(activeName.value);
    }
});

</script>
