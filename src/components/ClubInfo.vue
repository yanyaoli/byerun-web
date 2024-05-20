<template>
    <div class="app">
        <el-main>
            <el-menu :default-active="activeName" class="week-menu" mode="horizontal" @select="handleSelect">
                <el-menu-item index="0"><el-icon><ArrowLeft /></el-icon></el-menu-item>
                <el-menu-item index="1">周一</el-menu-item>
                <el-menu-item index="2">周二</el-menu-item>
                <el-menu-item index="3">周三</el-menu-item>
                <el-menu-item index="4">周四</el-menu-item>
                <el-menu-item index="5">周五</el-menu-item>
                <el-menu-item index="6">我的俱乐部</el-menu-item>
            </el-menu>

            <el-scrollbar height="calc(100vh - 300px)">
                <div v-for="club in clubs" :key="club.configurationId">
                    <el-descriptions class="margin-top" :title="club.activityName" :key="club.configurationId"
                        :column="1" border>
                        <template #extra>
                            <el-button v-if="club.joinStatus == 0" type="primary"
                                @click="handleJoin(club)">报名</el-button>
                            <el-button v-else-if="club.joinStatus == 1" type="danger"
                                @click="handleJoin(club)">取消报名</el-button>
                            <el-button v-else-if="club.joinStatus == 2" type="warning"
                                @click="handleJoin(club)">报名</el-button>
                            <el-button v-else-if="club.joinStatus == 3" type="success"
                                @click="handleJoin(club)">活动进行中</el-button>
                            <el-button v-else type="info" disabled>活动已失效</el-button>
                        </template>
                        <el-descriptions-item>
                            <template #label>
                                <div class="cell-item">
                                    <el-icon :style="iconStyle">
                                        <User />
                                    </el-icon>
                                    教师
                                </div>
                            </template>
                            {{ club.teacherName }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template #label>
                                <div class="cell-item">
                                    <el-icon :style="iconStyle">
                                        <Checked />
                                    </el-icon>
                                    人数
                                </div>
                            </template>
                            {{ club.joinStudentNum }} / {{ club.studentNum
                            }}人
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template #label>
                                <div class="cell-item">
                                    <el-icon :style="iconStyle">
                                        <clock />
                                    </el-icon>
                                    时间
                                </div>
                            </template>
                            周{{ weekDayMap[club.weekDay] }} {{ club.startTime }} - {{
                                club.endTime }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template #label>
                                <div class="cell-item">
                                    <el-icon :style="iconStyle">
                                        <location />
                                    </el-icon>
                                    地点
                                </div>
                            </template>
                            {{ club.addressDetail }}
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template #label>
                                <div class="cell-item">
                                    <el-icon :style="iconStyle">
                                        <InfoFilled />
                                    </el-icon>
                                    介绍
                                </div>
                            </template>
                            {{ club.clubIntroduction }}
                        </el-descriptions-item>
                    </el-descriptions>
                </div>
            </el-scrollbar>
        </el-main>
    </div>

</template>


<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { queryClubInfo, queryMyTask, queryMyClub, joinClub } from '@/apis/club.api';
import { useRouter } from 'vue-router';

const user = ref(JSON.parse(localStorage.getItem('userData')) || null);
const clubs = ref([]);
const loading = ref(true);
const router = useRouter();
const activeName = ref('1');
const weekDayMap = reactive({
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六',
    7: '日'
});

const iconStyle = {
    large: '8px',
    default: '6px',
    small: '4px',
};

const goBack = () => {
    router.push('/user');
};

const handleSelect = (index) => {
    if (index === '0') {
        goBack();
        return;
    } if (index === '6') {
        fetchMyClubs();
    } else {
        fetchClubInfo(index);
    }
};

const fetchClubInfo = (weekDay) => {
    queryClubInfo(weekDay).then(response => {
        if (response.data.code === 10000) {
            if (response.data.response.length === 0) {
                ElMessage.success('暂无俱乐部活动或俱乐部活动已达标');
                clubs.value = [];
            } else {
                clubs.value = response.data.response.map(club => ({
                    ...club,
                    weekDay: Number(club.weekDay),
                    joinStatus: Number(club.joinStatus)
                }));
            }
            loading.value = false;
        } else {
            clubs.value = [];
            loading.value = false;
            ElMessage.error('获取俱乐部信息失败: ' + response.data.msg);
            router.push('/user');
        }
    });
};

const fetchMyTask = () => {
    return queryMyTask().then(response => {
        if (response.data.code === 10000) {
            if (response.data.response.length === 0) {
                ElMessage.success('暂无需要参加的俱乐部活动');
                return [];
            } else {
                return response.data.response;
            }
        } else {
            ElMessage.error('获取任务信息失败: ' + response.data.msg);
            return [];
        }
    });
};

const fetchMyClub = () => {
    const studentId = user.value.studentId;
    return queryMyClub(studentId).then(response => {
        if (response.data.code === 10000) {
            if (response.data.response.length === 0) {
                ElMessage.success('无俱乐部活动记录');
                return [];
            } else {
                return response.data.response;
            }
        } else {
            ElMessage.error('获取俱乐部信息失败: ' + response.data.msg);
            return [];
        }
    });
};

const fetchMyClubs = () => {
    Promise.all([fetchMyTask(), fetchMyClub()]).then(responses => {
        const [taskData, clubData] = responses;
        clubs.value = [...taskData, ...clubData];
        if (clubs.value.length === 0) {
            ElMessage.success('暂无需要参加的俱乐部活动');
        }
        loading.value = false;
    });
};

const handleJoin = (club) => {
    let type;
    if (club.joinStatus === 0 || club.joinStatus === 2) {
        type = 1;
    } else if (club.joinStatus === 1 || club.joinStatus === 3) {
        type = 2;
    } else {
        return;
    }
    joinClub(club.configurationId, type).then(response => {
        if (response.data.code === 10000) {
            ElMessage.success(response.data.response.message);
            fetchClubInfo('1');
        } else {
            ElMessage.error(response.data.msg);
        }
    });
};

onMounted(() => {
    if (!user.value) {
        router.push('/login');
    } else {
        fetchClubInfo('1');
    }
});

</script>

<style scoped>
.app {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px 0 20px 0;
}

.navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #fff;
    z-index: 1000;
}

.navbar > el-button {
    margin-left: 10px;
}

.el-main {
    width: 100%;
    max-width: 1200px;
    /* 设置最大宽度，防止在大屏幕上过宽 */
}

.el-main .el-descriptions {
    padding: 20px;
    margin-top: 10px;
}

.el-main .el-descriptions-item {
    word-break: break-word;
    /* 设置单词过长时自动换行 */
}

.week-menu>.el-menu-item {
    padding: 10px;
    color: #6b778c;
    font-size: 15px;
    font-weight: 500;
}

.cell-item {
    display: flex;
    align-items: center;
    min-width: 50px;
}
</style>