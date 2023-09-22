import {Queue} from "bullmq";
import {createQueue} from "../queueCreator";
import {getLogger} from "../../logger";
import {getTaskIdByJobId} from "../../util/taskIdUtil";
import {ConcatJobRequest} from "../../types/worker/concater";
import { getMessageId, setConcatCache } from "../../store/taskStore";
import useTaskMessage from "../../message/taskMessage";

const logger = getLogger('concat-queue')
let queue: Queue
const queueName = 'concat'
export function initConcatQueue() {
  queue = createQueue({
    name: queueName,
    handleAddedEvent: async (args: { jobId: string, name: string }) => {
      const taskId = getTaskIdByJobId(args.jobId)
    },
    handleCompletedEvent: async (args, id) => {
      const {ack} = useTaskMessage()
      const taskId = getTaskIdByJobId(args.jobId)
      await setConcatCache(taskId, {
        state: 'completed'
      })
      const messageId = await getMessageId(taskId)
      await ack(messageId)
    },
    handleFailedEvent: async (args, id) => {
      const taskId = getTaskIdByJobId(args.jobId)
      await setConcatCache(taskId, {
        state: 'failed',
        error: args.failedReason
      })
    }
  })
  logger.info('create concat queue')
}

export async function addConcatJob(request: ConcatJobRequest) {
  const {taskId} = request
  const jobId = `${taskId}:concat`
  await queue.add(queueName, request, {
    jobId
  })
}
