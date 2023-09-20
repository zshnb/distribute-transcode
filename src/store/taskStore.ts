import {schedulerRedisClient} from "../redis";
import {ConcatCache, SplitCache, TranscodeCache, TranscodeProgressData} from "../types/task";
import {Mutex} from "async-mutex";
import {getLogger} from "../logger";

const splitField = 'split'
const transcodeField = 'transcode'
const concatField = 'concat'
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
async function getTranscodeCaches(taskId: string): Promise<Record<string, TranscodeCache>> {
  const value = await schedulerRedisClient.hGet(taskId, transcodeField)
  if (value) {
    return JSON.parse(value) as Record<string, TranscodeCache>
  } else {
    return {}
  }
}

async function setTranscodeCache(taskId: string, index: number, transcodeCache: Partial<TranscodeCache>) {
  await transcodeMutex.runExclusive(async () => {
    const transcodeCaches = await getTranscodeCaches(taskId)
    if (!transcodeCaches[index]) {
      transcodeCaches[index] = {
        state: 'active',
        progress: {
          totalFrames: 0,
          frames: 0,
          speed: 0
        },
        videoFile: ''
      }
    }
    transcodeCaches[index] = Object.assign(transcodeCaches[index], transcodeCache)
    await schedulerRedisClient.hSet(taskId, transcodeField, JSON.stringify(transcodeCaches))
    logger.info(`hset ${taskId} ${transcodeField} ${JSON.stringify(transcodeCaches[index])}`)
  })
}

async function updateTranscodeProgress(taskId: string, index: number, data: TranscodeProgressData) {
  await transcodeMutex.runExclusive(async () => {
    const transcodeCaches = await getTranscodeCaches(taskId)
    transcodeCaches[index].progress = data
    await schedulerRedisClient.hSet(taskId, transcodeField, JSON.stringify(transcodeCaches))
    logger.debug(`hset ${taskId} ${transcodeField} ${index}: ${JSON.stringify(transcodeCaches[index])}`)
  })
}

async function setConcatCache(taskId: string, concatCache: Partial<ConcatCache>) {
  await schedulerRedisClient.hSet(taskId, concatField, JSON.stringify(concatCache))
  logger.info(`hset ${concatField} ${JSON.stringify(concatCache)}`)
}

async function getConcatCache(taskId: string): Promise<ConcatCache> {
  const value = await schedulerRedisClient.hGet(taskId, concatField)
  if (value) {
    return JSON.parse(value) as ConcatCache
  } else {
    return {} as ConcatCache
  }
}

export {
  setCreatedAt,
  setSplitCache,
  getSplitCache,
  setTranscodeCache,
  getTranscodeCaches,
  updateTranscodeProgress,
  setConcatCache,
  getConcatCache
}
