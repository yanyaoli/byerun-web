<template>
    <el-container>
        <el-header>
            <div class="operation-buttons-left">
                <el-tooltip content="赞赏码" placement="top" open-delay="500">
                    <el-button plain class="icon-button" type="primary" @click="showRewardInfo">
                        <el-icon>
                            <Present />
                        </el-icon>
                    </el-button>
                </el-tooltip>
            </div>
            <div class="operation-buttons-right">
                <el-tooltip content="刷新" placement="top" open-delay="500">
                    <el-button class="icon-button" type="primary" @click="fetchActivity">
                        <el-icon class="is-loading">
                            <Loading />
                        </el-icon>
                    </el-button>
                </el-tooltip>
                <el-tooltip content="切换用户" placement="top" open-delay="500">
                    <el-button class="icon-button" type="primary" @click="switchUser">
                        <el-icon>
                            <Switch />
                        </el-icon>
                    </el-button>
                </el-tooltip>
                <el-popconfirm width="220" confirm-button-text="确定" cancel-button-text="取消" :icon="InfoFilled"
                    icon-color="#626AEF" title="确定要退出账号吗？" @confirm="logout">
                    <template #reference>
                        <el-button class="icon-button" type="danger">
                            <el-icon>
                                <CloseBold />
                            </el-icon>
                        </el-button>
                    </template>
                </el-popconfirm>
            </div>
        </el-header>
        <el-main v-if="showMainBoard">
            <div v-if="isLoading">
                <h1> <el-icon class="is-loading">
                        <Loading />
                    </el-icon></h1>
                <p>
                    <el-icon class="is-loading">
                        <Loading />
                    </el-icon>
                </p>
            </div>
            <div v-else>
                <h1>{{ user.studentName }}</h1>
                <p>{{ user.registerCode }}</p>
            </div>

            <div v-if="activity">
                <el-progress :text-inside="true" :stroke-width="20" :percentage=activity.club_completion_percentage>
                    <span>俱乐部完成率：{{ activity.club_completion_rate }}</span>
                </el-progress>
                <el-progress :text-inside="true" :stroke-width="20" :percentage=activity.running_completion_percentage>
                    <span>校园跑完成率：{{ activity.running_completion_rate }}</span>
                </el-progress>
            </div>
            <div v-else>
                <el-progress :percentage="100" :text-inside="true" :stroke-width="20" :indeterminate="true"
                    :duration="0.5" striped striped-flow><span></span></el-progress>
                <el-progress :percentage="100" :text-inside="true" :stroke-width="20" :indeterminate="true"
                    :duration="0.5" striped striped-flow><span></span></el-progress>
            </div>

            <el-divider />
            <div class="input-group">
                <el-input-number for="runDistance" id="distance" v-model="runDistance" :min="1000" :max="5000"
                    :step="100" style="width: 200px;" placeholder="跑步里程（米）"></el-input-number>
            </div>
            <div class="input-group">
                <el-input-number for="runTime" id="time" v-model="runTime" :min="30" :max="100" :step="5"
                    style="width: 200px;" placeholder="跑步时长（分钟）"></el-input-number>
            </div>
            <div class="input-group">
                <el-select id="map" v-model="mapChoice" placeholder="请选择地图">
                    <el-option label="成都信息工程大学龙泉校区" value="cuit_lqy"></el-option>
                    <el-option label="成都信息工程大学航空港校区" value="cuit_hkg"></el-option>
                    <el-option label="成都中医药大学温江校区" value="cdutcm_wj"></el-option>
                </el-select>
            </div>
            <el-tooltip content="随机填充" placement="top" open-delay="500">
                <el-button class="icon-button" @click="randomizeInputs">
                    <el-icon>
                        <RefreshRight />
                    </el-icon>
                </el-button>
            </el-tooltip>
            <el-divider />
            <el-button type="primary" @click="getClub" round>俱乐部</el-button>
            <el-button type="primary" :loading="isSumbiting" @click="submit" round>立即提交</el-button>
        </el-main>
        <el-main v-else-if="showRewardInfo" class="reward">
            <img src="../../file/qr.jpg" alt="赞赏码" class="reward-image" />
            <el-button><el-link type="primary" href="https://ohnnn.com" target="_blank" />联系我们</el-button>
            <el-button @click="showMainBoard = true; showRewardBoard = false">返回白嫖</el-button>
        </el-main>
    </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';  // 导入 ElMessage
import { getUserInfo, getActivityInfo, getSemesterYear, submitActivityInfo } from '@/apis/user';
import { InfoFilled } from '@element-plus/icons-vue'

const showMainBoard = ref(true)
const showRewardBoard = ref(false)
const showRewardInfo = () => {
    showMainBoard.value = false;
    showRewardBoard.value = true;
}

const user = ref(JSON.parse(localStorage.getItem('userData')) || null);
const activity = ref(null);
const isLoading = ref(false);
const isSumbiting = ref(false)
const router = useRouter();
const runDistance = ref(null);
const runTime = ref(null);
const mapChoice = ref(null);

// 获取用户活动信息
const fetchActivity = async () => {
    activity.value = null;
    getActivityInfo(user.value.schoolId, user.value.studentId).then(response => {
        if (response.data.code === 10000) {
            const totalNum = response.data.response.totalNum
            const joinNum = response.data.response.joinNum
            const runTotalNum = response.data.response.runTotalNum
            const runJoinNum = response.data.response.runJoinNum
            const club_completion_rate = `${joinNum}/${totalNum}`
            const running_completion_rate = `${runJoinNum}/${runTotalNum}`
            const club_completion_percentage = Math.min((joinNum / totalNum) * 100, 100);
            const running_completion_percentage = Math.min((runJoinNum / runTotalNum) * 100, 100);
            activity.value = {
                'club_completion_rate': club_completion_rate,
                'running_completion_rate': running_completion_rate,
                'club_completion_percentage': club_completion_percentage,
                'running_completion_percentage': running_completion_percentage
            }
        }
        else {
            activity.value = null;
            localStorage.clear();
            ElMessage.error('获取活动信息失败: ' + response.data.msg);
        }
    })
};

// 获取用户信息
const fetchUser = () => {
    isLoading.value = true;
    user.value = null;
    getUserInfo().then(response => {
        isLoading.value = false;
        if (response.data.code === 10000) {
            user.value = response.data.response;
            const token = response.data.response.oauthToken.token;
            const userData = response.data.response;
            localStorage.setItem('token', token);
            localStorage.setItem('userData', JSON.stringify(userData));
            fetchActivity();
        }
        else {
            user.value = null;
            localStorage.clear();
            ElMessage.error('获取用户信息失败: ' + response.data.msg);
            router.push('/login');
            return;
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
    isSumbiting.value = true;
    try {
        // 验证用户输入
        if (!runDistance.value || !runTime.value || !mapChoice.value) {
            ElMessage.error('参数不完整，请检查后重新提交');
            isSumbiting.value = false;
            return;
        }

        const schoolId = user.value.schoolId;

        const response = await getSemesterYear(schoolId);
        if (response.data.code !== 10000) {
            ElMessage.error('获取学年学期失败: ' + response.data.msg);
            isSumbiting.value = false;
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
            isSumbiting.value = false;

            runDistance.value = null;
            runTime.value = null;
            mapChoice.value = null;

            return;
        }
        ElMessage.success('提交成功,' + submitResponse.data.response.resultDesc);
        isSumbiting.value = false;
        runDistance.value = null;
        runTime.value = null;
        mapChoice.value = null;
        await fetchActivity();
    } catch (error) {
        ElMessage.error('提交失败: ' + error.message);
        isSumbiting.value = false;
    }
};

const getClub = () => {
    router.push('/club');
}

const randomizeInputs = () => {
    const maps = ['cuit_lqy', 'cuit_hkg', 'cdutcm_wj'];
    runDistance.value = Math.floor(Math.random() * (6000 - 1000 + 1)) + 1000;
    runTime.value = Math.floor(Math.random() * (100 - 30 + 1)) + 30;
    mapChoice.value = maps[Math.floor(Math.random() * maps.length)];
};

const switchUser = () => {
    ElMessage.info('还没有实现该功能')
}

onMounted(() => {
    if (!user.value) {
        router.push('/login');
    } else {
        fetchUser();
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
    display: flex;
    justify-content: space-between;
    width: 100%;

}

.el-main {
    position: relative;
    width: 100%;
    text-align: center;
    margin-top: -20px;
}

.el-progress--line {
    margin-bottom: 15px;
    max-width: 600px;
    text-align: center;
}

.input-group {
    margin: 10px 0;
}

.operation-buttons-right {
    float: right;
    display: flex;
    justify-content: end;
}

.operation-buttons-left {
    float: left;
    display: flex;
    justify-content: end;
}

.icon-button {
    border: none;
    color: #000;
    background-color: transparent;
    font-size: 20px;
    padding: 0;
}

.icon-button:hover {
    color: red;
}

.reward-image {
    display: block;
    margin: auto;
    width: auto;
    height: auto;
    max-width: 200px;
    max-height: 200px;
    margin-bottom: 20px;
}
</style>