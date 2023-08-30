import { Queue } from "bullmq";
import { SplitJobRequest, SplitJobResponse } from "../../types/worker/splitter";
import { createQueue } from "../queueCreator";
import { getLogger } from "../../logger";
import { schedulerRedisClient } from "../../redis";
import { getTaskIdByJobId } from "../../util/taskIdUtil";
import { setCreatedAt, setSplitCache } from "../../store/taskStore";

const logger = getLogger('split-queue')
let queue: Queue
export function initSplitQueue() {
  queue = createQueue({
    name: 'splitter',
    handleAddedEvent: async (args: { jobId: string, name: string }) => {
      const taskId = getTaskIdByJobId(args.jobId)
      await setCreatedAt(taskId)
      await setSplitCache(taskId, {
        state: 'active'
      })
    },
    handleCompletedEvent: async (args, id) => {
      const { segmentFiles } = JSON.parse(args.jobId) as SplitJobResponse
      const taskId = getTaskIdByJobId(args.jobId)
      await setSplitCache(taskId, {
        segmentCount: segmentFiles.length,
        state: 'completed'
      })
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

export function addSplitJob(request: SplitJobRequest) {
  const { taskId } = request
  const jobId = `${taskId}:split`
  queue.add(jobId, request)
}
