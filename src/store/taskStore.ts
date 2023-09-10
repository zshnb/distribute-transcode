import { schedulerRedisClient } from "../redis";
import { SplitCache, TranscodeCache } from "../types/task";
import {Mutex} from "async-mutex";

const splitField = 'split'
const transcodeField = 'transcode'
const createdAtField = 'createdAt'
const transcodeMutex = new Mutex()
async function setCreatedAt(taskId: string) {
  await schedulerRedisClient.hSetNX(taskId, createdAtField, new Date().toISOString())
}

async function setSplitCache(taskId: string, split: Partial<SplitCache>) {
  await schedulerRedisClient.hSet(taskId, splitField, JSON.stringify(split))
}

async function getTranscodeCache(taskId: string): Promise<Record<number, TranscodeCache>> {
  const value = await schedulerRedisClient.hGet(taskId, transcodeField)
  if (value) {
    return JSON.parse(value) as Record<number, TranscodeCache>
  } else {
    return {}
  }
}

async function setTranscodeCache(taskId: string, index: number, transcode: Partial<TranscodeCache>) {
  const transcodeCache = await getTranscodeCache(taskId)
  Object.assign(transcodeCache[index], transcode)
  await transcodeMutex.runExclusive(async () => {
    await schedulerRedisClient.hSet(taskId, transcodeField, JSON.stringify(transcodeCache))
  })
}

export {
  setCreatedAt,
  setSplitCache,
  setTranscodeCache
}
