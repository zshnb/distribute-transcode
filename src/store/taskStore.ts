import {schedulerRedisClient} from "../redis";
import {SplitCache, TranscodeCache} from "../types/task";
import {Mutex} from "async-mutex";
import {getLogger} from "../logger";

const splitField = 'split'
const transcodeField = 'transcode'
const createdAtField = 'createdAt'
const transcodeMutex = new Mutex()
const logger = getLogger('task-store')

async function setCreatedAt(taskId: string) {
  const now = new Date().toISOString()
  await schedulerRedisClient.hSetNX(taskId, createdAtField, now)
  logger.info(`hsetnx ${createdAtField} ${now}`)
}

async function setSplitCache(taskId: string, split: Partial<SplitCache>) {
  await schedulerRedisClient.hSet(taskId, splitField, JSON.stringify(split))
  logger.info(`hset ${splitField} ${JSON.stringify(split)}`)
}

async function getSplitCache(taskId: string): Promise<SplitCache> {
  const value = await schedulerRedisClient.hGet(taskId, splitField)
  if(value) {
    return JSON.parse(value) as SplitCache
  } else {
    return {} as SplitCache
  }
}
async function getTranscodeCaches(taskId: string): Promise<Record<number, TranscodeCache>> {
  const value = await schedulerRedisClient.hGet(taskId, transcodeField)
  if (value) {
    return JSON.parse(value) as Record<number, TranscodeCache>
  } else {
    return {}
  }
}

async function setTranscodeCache(taskId: string, index: number, transcodeCache: Partial<TranscodeCache>) {
  await transcodeMutex.runExclusive(async () => {
    const transcodeCaches = await getTranscodeCaches(taskId)
    if (transcodeCache.state && transcodeCache.videoFile) {
      transcodeCaches[index] = {
        state: transcodeCache.state,
        videoFile: transcodeCache.videoFile,
        error: transcodeCache.error
      }
      await schedulerRedisClient.hSet(taskId, transcodeField, JSON.stringify(transcodeCaches))
      logger.info(`hset ${taskId} ${transcodeField} ${JSON.stringify(transcodeCaches)}`)
    } else {
      logger.error(`transcode: ${JSON.stringify(transcodeCache)} doesn't exist video file`)
    }
  })
}

export {
  setCreatedAt,
  setSplitCache,
  getSplitCache,
  setTranscodeCache,
  getTranscodeCaches
}
