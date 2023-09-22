import { Queue } from "bullmq";
import { createQueue } from "../queueCreator";
import { getLogger } from "../../logger";
import { getTaskIdByJobId } from "../../util/taskIdUtil";
import { getSplitCache, getTranscodeCaches, setTranscodeCache } from "../../store/taskStore";
import { TranscodeJobRequest, TranscodeJobResponse } from "../../types/worker/transcoder";
import { JobIdError } from "../../error";
import { addConcatJob } from "./concatQueue";
import { TranscodeProgressData } from "../../types/task";

const logger = getLogger('transcode-queue')
let queue: Queue
const queueName = 'transcode'
export function initTranscodeQueue() {
  queue = createQueue({
    name: queueName,
    handleAddedEvent: async (args: { jobId: string, name: string }) => {
      const taskId = getTaskIdByJobId(args.jobId)
      const index = getTranscodeIndex(args.jobId)
      await setTranscodeCache(taskId, index, {
        state: 'active'
      })

    },
    handleProgressEvent: async (args: { jobId: string, data: number | object }, id: string) => {
      const { frames, speed, totalFrames } = args.data as TranscodeProgressData
      const taskId = getTaskIdByJobId(args.jobId)
      const index = getTranscodeIndex(args.jobId)
      await setTranscodeCache(taskId, index, {
        progress: {
          totalFrames,
          frames,
          speed
        }
      })
    },
    handleCompletedEvent: async (args, id) => {
      const { index, videoFile, fileStorageType } = JSON.parse(JSON.stringify(args.returnvalue)) as TranscodeJobResponse
      const taskId = getTaskIdByJobId(args.jobId)
      const transcodeCache = (await getTranscodeCaches(taskId))[index.toString()]
      await setTranscodeCache(taskId, index, {
        state: 'completed',
        videoFile,
        progress: {
          totalFrames: transcodeCache.progress.totalFrames,
          frames: transcodeCache.progress.totalFrames,
          speed: transcodeCache.progress.speed
        }
      })
      await checkAndAddConcatJob()
      async function checkAndAddConcatJob() {
        const splitCache = await getSplitCache(taskId)
        const segmentCount = splitCache.segmentCount
        const transcodeCaches = await getTranscodeCaches(taskId)
        const completeSegmentCount = Object.values(transcodeCaches).filter(it => it.state === 'completed').length
        if (segmentCount === completeSegmentCount) {
          await addConcatJob({
            taskId,
            segmentFiles: Object.values(transcodeCaches).map(it => it.videoFile),
            fileStorageType
          })
        }
      }
    },
    handleFailedEvent: async (args, id) => {
      const taskId = getTaskIdByJobId(args.jobId)
      const index = getTranscodeIndex(args.jobId)
      await setTranscodeCache(taskId, index, {
        state: 'failed',
        error: args.failedReason.substring(0, 100)
      })
    }
  })
  logger.info('create transcode queue')
}

function getTranscodeIndex(jobId: string) {
  const array = jobId.split(':')
  if (array.length < 3) {
    throw new JobIdError(`Transcode job id doesn't include segment index`)
  }
  return parseInt(array[2])
}

export async function addTranscodeJob(request: TranscodeJobRequest) {
  const { taskId, index } = request
  const jobId = `${taskId}:transcode:${index}`
  await queue.add(queueName, request, {
    jobId
  })
}

export async function getTranscodeActiveJobCount() {
  const activeCount = await queue.getActiveCount()
  return activeCount
}
