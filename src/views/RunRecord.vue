<template>
  <el-container>
    <el-main v-if="isLoading && records.length === 0">
      <el-result>
        <template #sub-title>
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
        </template>
        <template #extra> </template>
      </el-result>
    </el-main>
    <el-main v-else>
      <div class="scroll-container" @scroll="handleScroll">
        <div v-for="record in records" :key="record.recordId">
          <el-descriptions
            class="margin-top"
            :key="record.recordId"
            :column="1"
            border
          >
            <template #title>
              <el-icon
                :style="{
                  color: record.defeatedInfo === '有效跑步' ? 'blue' : 'red',
                }"
              >
                <component
                  :is="
                    record.defeatedInfo === '有效跑步'
                      ? SuccessFilled
                      : WarningFilled
                  "
                />
              </el-icon>
              {{ record.defeatedInfo }} - {{ record.recordDate }}
            </template>
            <el-descriptions-item label="跑步时长">
              {{ record.runTime }} 分钟
            </el-descriptions-item>
            <el-descriptions-item label="跑步里程">
              {{ (record.runDistance / 1000).toFixed(2) }} 公里
            </el-descriptions-item>
            <el-descriptions-item label="平均配速">
              {{ formatPace(record.runTime, record.runDistance) }}
            </el-descriptions-item>
            <el-descriptions-item label="记录时间">
              {{ record.createTime }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div v-if="isLoading" class="loading-indicator">
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
        </div>
      </div>
      <el-result
        v-if="!isLoading && records.length === 0"
        icon="success"
        sub-title="暂无跑步记录"
      >
        <template #extra> </template>
      </el-result>
    </el-main>
    <el-button @click="goBack">返回</el-button>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import useRunRecord from "../hooks/run/useRunRecord";
import { SuccessFilled, WarningFilled, Loading } from "@element-plus/icons-vue";

const { runRecord, fetchRunRecord } = useRunRecord();

const user = ref(JSON.parse(localStorage.getItem("userData")) || null);
const records = ref([]);
const isLoading = ref(false);
const pageNum = ref(1);
const pageSize = ref(15);
const router = useRouter();
const noMoreData = ref(false);

const goBack = () => {
  window.history.go(-1);
};

const getRunRecords = async () => {
  if (noMoreData.value) return;

  isLoading.value = true;
  const response = await fetchRunRecord(pageNum.value, pageSize.value);
  isLoading.value = false;

  if (response && response.code === 10000) {
    if (response.response.length < pageSize.value) {
      noMoreData.value = true;
    }
    records.value = [...records.value, ...response.response];
  } else {
    noMoreData.value = true;
    if (records.value.length === 0) {
      ElMessage.success("暂无跑步记录");
    }
  }
};

const handleScroll = (event) => {
  const { scrollTop, clientHeight, scrollHeight } = event.target;
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    loadMore();
  }
};

const loadMore = () => {
  if (!isLoading.value && !noMoreData.value) {
    pageNum.value += 1;
    getRunRecords();
  }
};

const formatPace = (runTime, runDistance) => {
  const pace = runTime / (runDistance / 1000);
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}'${seconds < 10 ? "0" : ""}${seconds}''`;
};

onMounted(() => {
  if (!user.value) {
    router.push("/home");
  } else {
    getRunRecords();
  }
});
</script>

<style scoped>
.el-container {
  max-width: 500px;
  max-height: 100vh;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 5px;
  margin: 0 auto;
}

.el-main {
  width: 100%;
  max-width: 100%;
}

.el-descriptions {
  margin-top: 20px;
}

.el-main .el-descriptions-item {
  word-break: break-word;
}

.scroll-container {
  height: 70vh;
  overflow-y: auto;
}

.scroll-container::-webkit-scrollbar {
  width: 0;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  padding: 10px;
  text-align: center;
  margin: 20px 0;
}
</style>