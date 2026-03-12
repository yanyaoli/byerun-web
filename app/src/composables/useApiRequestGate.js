import { computed, ref } from 'vue';

const pendingCount = ref(0);
const idleWaiters = new Set();

const isIdle = computed(() => pendingCount.value === 0);

const flushIdleWaiters = () => {
  if (pendingCount.value !== 0) return;
  idleWaiters.forEach((resolve) => resolve());
  idleWaiters.clear();
};

export const beginApiRequest = () => {
  pendingCount.value += 1;
};

export const endApiRequest = () => {
  pendingCount.value = Math.max(0, pendingCount.value - 1);
  flushIdleWaiters();
};

export const waitForApiIdle = () =>
  pendingCount.value === 0
    ? Promise.resolve()
    : new Promise((resolve) => {
        idleWaiters.add(resolve);
      });

export const useApiRequestGate = () => ({
  pendingCount,
  isIdle,
  waitForIdle: waitForApiIdle,
});
