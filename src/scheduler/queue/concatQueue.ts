import {Queue} from "bullmq";
import {createQueue} from "../queueCreator";
import {getLogger} from "../../logger";
import {getTaskIdByJobId} from "../../util/taskIdUtil";
import {setTranscodeCache} from "../../store/taskStore";
import {TranscodeJobRequest, TranscodeJobResponse} from "../../types/worker/transcoder";
import {JobIdError} from "../../error";
import {ConcatJobRequest} from "../../types/worker/concater";

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
      const taskId = getTaskIdByJobId(args.jobId)
    },
    handleFailedEvent: async (args, id) => {
      const taskId = getTaskIdByJobId(args.jobId)
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
