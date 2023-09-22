import { Job, Worker } from "bullmq";
import { getLogger } from "../../logger";
import { Context, runWithContext } from "../../context";
import { processTranscode } from "./transcoder";
import {TranscodeJobRequest, TranscodeJobResponse} from "../../types/worker/transcoder";
import { getCfg, getNumberEnv } from "../../cfg";

const logger = getLogger('transcoder-starter')
let worker: Worker
function start() {
  worker = new Worker('transcode', async (job: Job) => {
    try {
      const request = job.data as TranscodeJobRequest
      const context: Context = {
        taskId: request.taskId,
        jobId: job.id
      }
      return await runWithContext<TranscodeJobResponse, Job>(context, processTranscode, job)
    } catch (e) {
      logger.errorObj(e, 'process transcode failed')
      throw e
    }
  }, {
    autorun: false,
    connection: {
      host: getCfg().REDIS_HOST,
      port: getNumberEnv('REDIS_PORT')
    },
    concurrency: getNumberEnv('TRANSCODE_CONCURRENCY')
  })
  try {
    worker.run()
    logger.info('start transcoder worker')
  } catch (e) {
    logger.errorObj(e, 'start transcoder error')
  }
}

export function stop() {
  if (worker) {
    worker.close()
  }
}

start()
