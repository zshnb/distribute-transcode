import { Queue } from "bullmq";
import { SplitJobRequest, SplitJobResponse } from "../../types/worker/splitter";
import { createQueue } from "../queueCreator";
import { getLogger } from "../../logger";
import { getTaskIdByJobId } from "../../util/taskIdUtil";
import { setCreatedAt, setSplitCache } from "../../store/taskStore";
import {addTranscodeJob} from "./transcodeQueue";

const logger = getLogger('split-queue')
let queue: Queue
const queueName = 'split'
export function initSplitQueue() {
  queue = createQueue({
    name: queueName,
    handleAddedEvent: async (args: { jobId: string, name: string }) => {
      const taskId = getTaskIdByJobId(args.jobId)
      await setCreatedAt(taskId)
      await setSplitCache(taskId, {
        state: 'active'
      })
    },
    handleCompletedEvent: async (args, id) => {
      const { segmentFiles, fileStorageType } = JSON.parse(JSON.stringify(args.returnvalue)) as SplitJobResponse
      const taskId = getTaskIdByJobId(args.jobId)
      await setSplitCache(taskId, {
        segmentCount: segmentFiles.length,
        state: 'completed'
      })
      for (let i = 0;i < segmentFiles.length;i++) {
        await addTranscodeJob({
          taskId,
          index: i,
          fileStorageType,
          filePath: segmentFiles[i],
          fileUri: segmentFiles[i]
        })
      }
    },
    handleFailedEvent: async (args, id) => {
      const taskId = getTaskIdByJobId(args.jobId)
      await setSplitCache(taskId, {
        state: 'failed',
        error: args.failedReason
      })
    }
  })
  logger.info('create split queue')
}

export async function addSplitJob(request: SplitJobRequest) {
  const { taskId } = request
  const jobId = `${taskId}:split`
  await queue.add(queueName, request, {
    jobId
  })
}
