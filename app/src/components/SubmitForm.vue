<template>
  <el-card class="submit-card">
    <el-form ref="formRef" :model="formState" :rules="rules" label-position="left" label-width="auto">
      <!-- 表单内容 -->
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <!-- 跑步里程输入 -->
          <el-form-item label="跑步里程" prop="distance">
            <el-input
              v-model="formState.distance"
              type="number"
              :controls="false"
              style="width: 100%"
              placeholder="请输入跑步里程（米），系统只会记录学校规定的区间限制内的有效值"
            >
              <template #append>米</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <!-- 跑步时长输入 -->
          <el-form-item label="跑步时长" prop="duration">
            <el-input
              v-model="formState.duration"
              type="number"
              :controls="false"
              style="width: 100%"
              placeholder="请输入跑步时长（分钟），系统只会记录学校规定的区间限制内的有效值"
            >
              <template #append>分钟</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 地图选择 -->
      <el-form-item label="地图选择" prop="route">
        <el-select v-model="formState.route" style="width: 100%" placeholder="请选择学校地图">
          <el-option v-for="map in maps" :key="map.value" :label="map.label" :value="map.value" />
        </el-select>
      </el-form-item>

      <!-- 配速显示 -->
      <div class="form-info" v-if="formState.distance && formState.duration">
        <span :class="{ 'text-error': !paceLimit }">
          当前配速: {{ formState.distance === 0 ? "0:00" : formatPace(formState.duration, formState.distance) }}/公里
        </span>
        <div v-if="!paceLimit" class="pace-error-message">
          配速过慢，请重新输入
        </div>
      </div>

      <!-- 按钮区域 -->
      <div class="form-footer">
        <el-button
          plain
          @click="onRandomFill"
          :disabled="submitting"
          class="footer-btn random-btn"
        >
          随机填充
        </el-button>
        <el-button
          type="primary"
          @click="onSubmit"
          :loading="submitting"
          :disabled="submitting || !paceLimit || submitting"
          class="footer-btn submit-btn"
        >
          提交记录
        </el-button>
      </div>

      <!-- 地图显示 -->
      <RunMapContainer
        :route="formState.route"
        :visible="showMap"
        :distance="formState.distance"
        :duration="formState.duration"
      />
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { formatPace } from '@/utils/format'
import { getSchoolMaps } from '@/utils/map'
import RunMapContainer from './RunMapContainer.vue'
import { ElMessage } from "element-plus";

interface Props {
  formState: {
    distance: number
    duration: number
    route: string
  }
  submitting: boolean
  distanceLimits: {
    min: number
    max: number
  }
  timeLimits: {
    min: number
    max: number
  }
}

interface Emits {
  (e: 'submit'): void
  (e: 'update-form-state', newState: { distance: number; duration: number }): void;
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref()
const showMap = ref(false)
const maps = getSchoolMaps()

const { distanceLimits, timeLimits } = props

const distanceMin = computed(() => distanceLimits.min)
const distanceMax = computed(() => distanceLimits.max)
const timeMin = computed(() => timeLimits.min)
const timeMax = computed(() => timeLimits.max)

// 计算配速限制
const paceLimit = computed(() => {
  if (!props.formState.distance || !props.formState.duration || props.formState.distance === 0) return true;
  
  const distanceInKilometers = props.formState.distance / 1000;
  const paceInMinutes = props.formState.duration / distanceInKilometers;

  return isNaN(paceInMinutes) || paceInMinutes >= 6;
});

// 校验规则
const rules = {
  distance: [
    { required: true, message: '请输入跑步里程' },
    { 
      validator: (rule: any, value: any, callback: any) => {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          callback(new Error('请输入有效数字'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  duration: [
    { required: true, message: '请输入跑步时长' },
    {
      validator: (rule: any, value: any, callback: any) => {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          callback(new Error('请输入有效数字'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  route: [
    { required: true, message: '请选择学校地图' }
  ]
};

const onSubmit = async () => {
  try {
    await formRef.value.validate();
    // 转换为数字类型
    const distance = Number(props.formState.distance);
    const duration = Number(props.formState.duration);
    
    // 更新表单状态
    props.formState.distance = distance;
    props.formState.duration = duration;
    
    if (!paceLimit.value) {
      ElMessage.error('配速不能小于6分钟/公里');
      return;
    }
    emit('submit');
  } catch (error) {
    console.error(error);
  }
};

const onRandomFill = () => {
  // 里程区间：0到学校上限要求+1000米
  const maxDistance = distanceMax.value + 1000;
  const maxDuration = timeMax.value + 10;
  let randomDistance: number, randomDuration: number;

  do {
    randomDistance = Math.floor(Math.random() * maxDistance);
    randomDuration = Math.floor(Math.random() * maxDuration);
  } while (randomDistance > 0 && (randomDuration / (randomDistance / 1000)) < 6);

  emit('update-form-state', { distance: randomDistance, duration: randomDuration });
}

// 监听路线变化显示地图
watch(
  () => props.formState.route,
  (newVal) => {
    if (newVal) {
      showMap.value = true
    }
  }
)
</script>

<style scoped>
.submit-card {
  background: transparent;
  border: none;
  box-shadow: none;
  color: var(--el-text-color-primary);
  overflow: hidden;
}

.form-info {
  margin: 10px 0 20px 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-align: center;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  gap: 12px;
}

.footer-btn {
  flex: 1;
  width: 50%;
}

/* 随机填充按钮样式 */
.random-btn {
  background-color: transparent;
  border: none;
  color: var(--el-text-color-secondary);
}

/* 提交记录按钮样式 */
.submit-btn {
  --el-button-hover-bg-color: var(--el-color-primary-light-3);
  --el-button-hover-border-color: var(--el-color-primary-light-3);
}

.text-error {
  color: var(--el-color-danger);
}

/* 配速过慢提示样式 */
.pace-error-message {
  color: var(--el-color-danger);
  font-size: 12px;
  text-align: center;
  margin-top: 5px;
}

@media screen and (max-width: 480px) {
  .submit-card {
    margin: 8px 0;
  }

  .form-footer {
    gap: 8px;
  }

}
</style>