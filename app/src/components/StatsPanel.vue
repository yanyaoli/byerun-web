<template>
  <div class="stats-panel">
    <el-skeleton :loading="loading" animated>
      <template #template>
        <el-row :gutter="16">
          <el-col :span="8" v-for="i in 3" :key="i">
            <div class="stats-skeleton">
              <el-skeleton-item variant="text" style="width: 30%; margin-bottom: 8px" />
              <el-skeleton-item variant="text" style="width: 50%" />
            </div>
          </el-col>
        </el-row>
      </template>
      <template #default>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-statistic title="俱乐部完成率" :value="activity?.joinNum || 0" value-style="color: #413a3a;">
              <template #suffix>/{{ activity ? activity.totalNum.toFixed(0) : "0" }}</template>
            </el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic title="校园跑完成率" :value="activity?.runJoinNum || 0" value-style="color: #413a3a;">
              <template #suffix>/{{ activity ? activity.runTotalNum.toFixed(0) : "0" }}</template>
            </el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic title="里程完成率" :value="runInfo ? +(runInfo.runValidDistance / 1000).toFixed(2) : 0" value-style="color: #413a3a;">
              <template #suffix>/{{ runInfo ? (runInfo.needRunDistance / 1000).toFixed(0) : "0" }}</template>
            </el-statistic>
          </el-col>
        </el-row>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean;
  activity: any;
  runInfo: any;
}

defineProps<Props>();
</script>

<style scoped>
.stats-panel {
  border: var(--stats-panel-border);
  text-align: center;
  padding: 16px 8px;
  color: var(--el-text-color-primary);
  overflow-x: auto;
}

.stats-skeleton {
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>