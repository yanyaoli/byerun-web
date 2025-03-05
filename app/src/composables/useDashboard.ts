import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user";
import { userService } from "@/services/user";
import { useActivity } from "./useActivity";
import { useRunInfo } from "./useRunInfo";
import { useRunStandard } from "./useRunStandard";
import { useRunRecord } from "./useRunRecord";
import type { RunInfo } from "@/types/run";

export function useDashboard() {
  const router = useRouter();
  const userStore = useUserStore();
  const { activity, isLoading: activityLoading, fetchActivity } = useActivity();
  const { runInfo, fetchRunInfo } = useRunInfo();
  const {
    runStandardData,
    fetchRunStandard,
    runDistanceMin,
    runDistanceMax,
    runTimeMin,
    runTimeMax,
  } = useRunStandard();
  const { records, pagination, fetchRecords, handleTableChange } =
    useRunRecord();

  const loading = ref(false);

  const verifyToken = async () => {
    try {
      const { response } = await userService.getUserInfo();
      return true;
    } catch (error) {
      console.error("Token验证失败:", error);
      ElMessage.error("登录已过期，请重新登录");
      userStore.logout();
      router.push("/login");
      return false;
    }
  };

  const initDashboard = async () => {
    if (loading.value) {
      console.log("正在加载中，请稍候...");
      return;
    }

    const { userId, schoolId, studentId } = userStore.userInfo || {};
    if (!userId || !schoolId || !studentId) {
      ElMessage.error("获取用户信息失败");
      router.push("/login");
      return;
    }

    try {
      loading.value = true;
      console.log("开始加载数据...");

      // 首先验证 token
      const isTokenValid = await verifyToken();
      if (!isTokenValid) {
        console.log("Token验证失败，终止后续请求");
        loading.value = false;
        return;
      }

      console.log("Token验证成功，开始获取数据...");

      try {
        // 1. 先获取跑步标准
        await fetchRunStandard(schoolId);
        console.log("获取跑步标准完成");
      } catch (error) {
        console.error("获取跑步标准失败:", error);
        throw error; // 跑步标准是必需的，失败时终止后续请求
      }

      try {
        // 2. 获取活动信息
        await fetchActivity(schoolId, studentId);
        console.log("获取活动信息完成");
      } catch (error) {
        console.error("获取活动信息失败:", error);
        ElMessage.warning("获取活动信息失败");
        // 继续执行，不影响其他功能
      }

      try {
        // 3. 获取跑步信息
        await fetchRunInfo(userId);
        console.log("获取跑步信息完成");
      } catch (error) {
        console.error("获取跑步信息失败:", error);
        ElMessage.warning("获取跑步信息失败");
        // 继续执行，不影响记录查看
      }

      try {
        // 4. 最后获取跑步记录
        await fetchRecords();
        console.log("获取跑步记录完成");
      } catch (error) {
        console.error("获取跑步记录失败:", error);
        ElMessage.warning("获取跑步记录失败");
        // 继续执行，不影响其他功能
      }
    } catch (error: any) {
      console.error("初始化仪表板失败:", error);
      // 检查是否是 token 相关错误
      if (
        error.response?.status === 401 ||
        error.response?.data?.code === 401
      ) {
        ElMessage.error("登录已过期，请重新登录");
        userStore.logout();
        router.push("/login");
      } else {
        ElMessage.error("数据加载失败，请重试");
      }
    } finally {
      loading.value = false;
      console.log("加载状态结束");
    }
  };

  // 刷新
  const refreshData = async () => {
    // 增加loading状态检查
    if (loading.value) {
      console.log("数据正在刷新中，请稍候...");
      return;
    }
  
    // 先验证 token
    const isTokenValid = await verifyToken();
    if (!isTokenValid) {
      return;
    }
  
    const { userId, schoolId, studentId } = userStore.userInfo || {};
    if (!userId || !schoolId || !studentId) {
      ElMessage.error("获取用户信息失败");
      router.push("/login");
      return;
    }
  
    loading.value = true;
    try {
      // 依次执行各个请求，使用 Promise.all 并发执行
      await Promise.all([
        fetchRunStandard(schoolId),
        fetchActivity(schoolId, studentId),
        fetchRunInfo(userId),
        fetchRecords()
      ]);
      
      console.log("数据刷新完成");
    } catch (error: any) {
      console.error("刷新数据失败:", error);
      if (error.response?.status === 401 || error.response?.data?.code === 401) {
        ElMessage.error("登录已过期，请重新登录");
        userStore.logout();
        router.push("/login");
      } else {
        ElMessage.error("数据刷新失败，请重试");
      }
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    activity,
    runInfo,
    runStandardData,
    runDistanceMin,
    runDistanceMax,
    runTimeMin,
    runTimeMax,
    records,
    pagination,
    handleTableChange,
    refreshData,
    initDashboard,
  };
}
