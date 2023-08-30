import { schedulerRedisClient } from "../redis";
import { SplitCache } from "../types/task";

async function setCreatedAt(taskId: string) {
  await schedulerRedisClient.hSetNX(taskId, 'createdAt', new Date().toISOString())
}

async function setSplitCache(taskId: string, split: Partial<SplitCache>) {
  await schedulerRedisClient.hSet(taskId, 'split', JSON.stringify(split))
}

export {
  setCreatedAt,
  setSplitCache
}
