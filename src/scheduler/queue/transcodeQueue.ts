import {Queue} from "bullmq";
import {createQueue} from "../queueCreator";
import {getLogger} from "../../logger";
import {getTaskIdByJobId} from "../../util/taskIdUtil";
import {setTranscodeCache} from "../../store/taskStore";
import {TranscodeJobRequest, TranscodeJobResponse} from "../../types/worker/transcoder";
import {JobIdError} from "../../error";

const logger = getLogger('transcode-queue')
let queue: Queue
const queueName = 'transcoder'
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
    handleCompletedEvent: async (args, id) => {
      const {index} = JSON.parse(JSON.stringify(args.returnvalue)) as TranscodeJobResponse
      const taskId = getTaskIdByJobId(args.jobId)
      await setTranscodeCache(taskId, index, {
        state: 'completed'
      })
    },
    handleFailedEvent: async (args, id) => {
      const taskId = getTaskIdByJobId(args.jobId)
      const index = getTranscodeIndex(args.jobId)
      await setTranscodeCache(taskId, index, {
        state: 'failed',
        error: args.failedReason
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
  const {taskId, index} = request
  const jobId = `${taskId}:transcode:${index}`
  await queue.add(queueName, request, {
    jobId
  })
}
