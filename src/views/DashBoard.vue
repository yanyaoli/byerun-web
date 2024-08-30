<template>
  <el-container>
    <el-header>
      <div class="operation-buttons-left">
        <el-dropdown trigger="click">
          <el-button plain class="icon-button" type="primary">
            <el-icon>
              <More />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="getNotice">
                <el-tooltip content="公告" placement="top" open-delay="500">
                  <el-icon>
                    <Bell />
                  </el-icon>
                </el-tooltip>公告
              </el-dropdown-item>
              <el-dropdown-item @click="goDonate">
                <el-tooltip content="赞赏" placement="top" open-delay="500">
                  <el-icon>
                    <Present />
                  </el-icon>
                </el-tooltip>赞赏
              </el-dropdown-item>
              <el-dropdown-item @click="goHome">
                <el-tooltip content="主页" placement="top" open-delay="500">
                  <el-icon>
                    <House />
                  </el-icon>
                </el-tooltip>主页
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="operation-buttons-right">
        <el-tooltip content="刷新" placement="top" open-delay="500">
          <el-button class="icon-button" type="primary" @click="getActivity" :disabled="LoginState">
            <el-icon class="is-loading">
              <Refresh />
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
        <el-popconfirm width="220" confirm-button-text="确定" cancel-button-text="取消" :icon="InfoFilled" icon-color="#626AEF" title="确定要退出账号吗？" @confirm="logout">
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
      <div v-if="user">
        <h1 class="stuInfo" @click="toggleMask" :class="{ masked: masked }">{{ user.studentName }}</h1>
        <p class="stuInfo" @click="toggleMask" :class="{ masked: masked }">{{ user.registerCode }}</p>
      </div>
      <div v-else>
        <h1>
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
        </h1>
        <p>
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
        </p>
      </div>

      <div v-if="activity">
        <el-progress :text-inside="true" :stroke-width="20" :percentage="activity.club_completion_percentage">
          <span>俱乐部完成率：{{ activity.club_completion_rate }}</span>
        </el-progress>
        <el-progress :text-inside="true" :stroke-width="20" :percentage="activity.running_completion_percentage">
          <span>校园跑完成率：{{ activity.running_completion_rate }}</span>
        </el-progress>
      </div>
      <div v-else>
        <el-progress :percentage="100" :text-inside="true" :stroke-width="20" :indeterminate="true" :duration="1" striped striped-flow><span></span></el-progress>
        <el-progress :percentage="100" :text-inside="true" :stroke-width="20" :indeterminate="true" :duration="1" striped striped-flow><span></span></el-progress>
      </div>

      <el-divider />
      <div class="input-group">
        <el-input-number for="runDistance" id="distance" v-model="runDistance" :min="1000" :max="5000" :step="100" style="width: 200px" placeholder="跑步里程（米）"></el-input-number>
      </div>
      <div class="input-group">
        <el-input-number for="runTime" id="time" v-model="runTime" :min="30" :max="100" :step="5" style="width: 200px" placeholder="跑步时长（分钟）"></el-input-number>
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
          <el-icon class="is-loading">
            <RefreshRight />
          </el-icon>
        </el-button>
      </el-tooltip>
      <el-divider />
      <el-button type="primary" @click="goClub" :disabled="LoginState" round>俱乐部</el-button>
      <el-button type="primary" :loading="isSubmitting" @click="submitActivityData" :disabled="LoginState" round>立即提交</el-button>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus"; // 导入 ElMessage
import { InfoFilled } from "@element-plus/icons-vue";
import {
  useUser,
  useActivity,
  useSubmitActivity,
} from "@/hooks/dashboard/index";
import useNotice from "@/hooks/notice/";
import address from "@/services/address";

const donateURL = ref(address.donateURL);
const homeURL = ref(address.homeURL);

const { getNotice } = useNotice();

const { user, fetchUser } = useUser();
const { activity, fetchActivity } = useActivity();
const { isSubmitting, submit } = useSubmitActivity();

const userData = JSON.parse(localStorage.getItem("userData")) || null;
const token = localStorage.getItem("token") || null;

const showMainBoard = ref(true);
const masked = ref(true);

const goDonate = () => {
 window.open(donateURL.value, '_blank');
}

const goHome = () => {
    window.open(homeURL.value, '_blank');
}

const router = useRouter();
const runDistance = ref(null);
const runTime = ref(null);
const mapChoice = ref(null);
const LoginState = ref(true);

// 获取活动信息
const getActivity = async () => {
  await fetchActivity(user.value.schoolId, user.value.studentId);
};

// 提交
const submitActivityData = async () => {
  if (!runDistance.value || !runTime.value || !mapChoice.value) {
    ElMessage.error("参数不完整，请检查后重新提交");
    return;
  }
  const schoolId = userData.schoolId;
  const userId = userData.userId;
  const result = await submit(
    runDistance.value,
    runTime.value,
    mapChoice.value,
    schoolId,
    userId
  );
  if (result) {
    await fetchActivity(user.value.schoolId, user.value.studentId);
  }
};

// 俱乐部活动
const goClub = () => {
  router.push("/club");
};

// 随机填充
const randomizeInputs = () => {
  const maps = ["cuit_lqy", "cuit_hkg", "cdutcm_wj"];
  runDistance.value = Math.floor(Math.random() * (6000 - 1000 + 1)) + 1000;
  runTime.value = Math.floor(Math.random() * (100 - 30 + 1)) + 30;
  mapChoice.value = maps[Math.floor(Math.random() * maps.length)];
};

// 切换用户
const switchUser = () => {
  ElMessage.info("还没有实现该功能");
};

onMounted(async () => {
  getNotice();
  if (!userData || !token) {
    router.push("/home");
  } else {
    const result = await fetchUser();
    if (result) {
      LoginState.value = false;
      await fetchActivity(user.value.schoolId, user.value.studentId);
    }
  }
});

// 退出账号
const logout = () => {
  localStorage.clear();
  router.push("/home");
  ElMessage.info("账号已退出");
};

// 切换蒙版显示
const toggleMask = () => {
  masked.value = !masked.value;
};
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

.stuInfo {
  letter-spacing: 2px;
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

.custom-dropdown-menu {
  padding: 0;
}

.custom-dropdown-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
}

.masked {
  filter: blur(5px);
  cursor: pointer;
}

.masked:hover {
  filter: blur(2px);
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