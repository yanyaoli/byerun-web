<template>
    <div class="user-info">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else class="card">
            <div class="operation-buttons">
                <el-tooltip content="刷新" placement="top" open-delay="500">
                    <el-button class="icon-button" type="primary" @click="fetchActivity">
                        <el-icon>
                            <Refresh />
                        </el-icon>
                    </el-button>
                </el-tooltip>

                <el-popconfirm title="确定要退出账号吗？" content="退出" placement="top" open-delay="500">
                    <template #reference>
                        <el-button class="icon-button" type="danger" @click="logout">
                            <el-icon>
                                <CloseBold />
                            </el-icon>
                        </el-button>
                    </template>
                    <el-popconfirm />
                    <el-icon>
                        <CloseBold />
                    </el-icon>
                </el-popconfirm>
            </div>
            <h1>{{ user ? user.studentName : '加载中...' }}</h1>
            <p>{{ user ? user.registerCode : '加载中' }}</p>
            <p>俱乐部完成率：{{ activity ? activity.club_completion_rate : '加载中...' }}</p>
            <p>校园跑完成率：{{ activity ? activity.running_completion_rate : '加载中...' }}</p>
            <el-divider />
            <div class="input-group">
                <el-input-number for="runDistance" id="distance" v-model="runDistance" :min="1" :max="6000"
                    style="width: 200px;" placeholder="跑步里程（米）"></el-input-number>
            </div>
            <div class="input-group">
                <el-input-number for="runTime" id="time" v-model="runTime" :min="30" :max="1000" style="width: 200px;"
                    placeholder="跑步时长（分钟）"></el-input-number>
            </div>
            <div class="input-group">
                <el-select id="map" v-model="mapChoice" placeholder="请选择地图">
                    <el-option label="成都信息工程大学龙泉校区" value="cuit_lqy"></el-option>
                    <el-option label="成都信息工程大学航空港校区" value="cuit_hkg"></el-option>
                    <el-option label="成都中医药大学温江校区" value="cdutcm_wj"></el-option>
                </el-select>
            </div>
            <el-divider />

            <el-button type="primary" @click="getClub" round>俱乐部</el-button>

            <el-button type="primary" @click="submit" round>立即提交</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';  // 导入 ElMessage
import { getUserInfo, getActivityInfo, getSemesterYear, submitActivityInfo } from '@/apis/user.api';


const user = ref(JSON.parse(localStorage.getItem('userData')) || null);
const activity = ref(null);
const loading = ref(true);
const router = useRouter();
const runDistance = ref(null);
const runTime = ref(null);
const mapChoice = ref(null);

// 获取用户活动信息
const fetchActivity = async () => {
    await fetchUser();
    getActivityInfo(user.value.schoolId, user.value.studentId).then(response => {
        if (response.data.code === 10000) {
            const totalNum = response.data.response.totalNum
            const joinNum = response.data.response.joinNum
            const runTotalNum = response.data.response.runTotalNum
            const runJoinNum = response.data.response.runJoinNum
            const club_completion_rate = `${joinNum}/${totalNum}`
            const running_completion_rate = `${runJoinNum}/${runTotalNum}`
            activity.value = { 'club_completion_rate': club_completion_rate, 'running_completion_rate': running_completion_rate }
            loading.value = false;
            ElMessage.success('刷新成功');
        }
        else {
            activity.value = null;
            loading.value = false;
            localStorage.clear();
            ElMessage.error('获取活动信息失败: ' + response.data.msg);
        }
    })
};

const fetchUser = () => {
    getUserInfo().then(response => {
        if (response.data.code === 10000) {
            user.value = response.data.response;
            loading.value = false;
            const token = response.data.response.oauthToken.token;
            const userData = response.data.response;
            localStorage.setItem('token', token);
            localStorage.setItem('userData', JSON.stringify(userData));
        }
        else {
            user.value = null;
            loading.value = false;
            localStorage.clear();
            ElMessage.error('获取用户信息失败: ' + response.data.msg);
            router.push('/login');
        }
    })
};

const logout = () => {
    localStorage.clear();
    router.push('/login');
    ElMessage.info('账号已退出');
};

// 提交
const submit = async () => {
    try {
        // 验证用户输入
        if (!runDistance.value || !runTime.value || !mapChoice.value) {
            ElMessage.error('参数不完整，请检查后重新提交');
            return;
        }
        const schoolId = user.value.schoolId;

        const response = await getSemesterYear(schoolId);
        if (response.data.code !== 10000) {
            ElMessage.error('获取学年学期失败: ' + response.data.msg);
            return;
        }
        const semesterYear = response.data.response.semesterYear;
        const data = {
            runDistance: runDistance.value,
            runTime: runTime.value,
            mapChoice: mapChoice.value,
            userId: user.value.userId,
            semesterYear: semesterYear
        };
        const submitResponse = await submitActivityInfo(data);
        if (submitResponse.data.code !== 10000) {
            ElMessage.error('提交失败: ' + submitResponse.data.msg);
            return;
        }
        ElMessage.success('提交成功,' + submitResponse.data.response.resultDesc);
        await fetchActivity();
    } catch (error) {
        ElMessage.error('提交失败: ' + error.message);
    }
};

const getClub = () => {
    router.push('/club');
}

onMounted(() => {
    if (!user.value) {
        router.push('/login');
    } else {
        fetchActivity();
    }
});

</script>

<style scoped>
.user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: Arial, sans-serif;
}

.card {
    position: relative;
    border-radius: 10px;
    padding: 20px;
    width: 300px;
    text-align: center;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.input-group {
    margin: 10px 0;
}

.operation-buttons {
    display: flex;
    justify-content: end;
}

.icon-button {
    border: none;
    color: #000;
    background-color: transparent;
    font-size: 20px;
    padding: 0;
    margin-left: 5px;
}

.icon-button:hover {
    color: red;
}
</style>