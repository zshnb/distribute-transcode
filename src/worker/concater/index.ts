import { Job, Worker } from "bullmq";
import { getLogger } from "../../logger";
import { Context, runWithContext } from "../../context";
import { ConcatJobRequest, ConcatJobResponse } from "../../types/worker/concater";
import { processConcat } from "./concater";
import { getCfg, getNumberCfg } from "../../cfg";

const logger = getLogger('concater-starter')
let worker: Worker
function start() {
  worker = new Worker('concat', async (job: Job) => {
    try {
      const request = job.data as ConcatJobRequest
      const context: Context = {
        taskId: request.taskId,
        jobId: job.id
      }
      return await runWithContext<ConcatJobResponse, Job>(context, processConcat, job)
    } catch (e) {
      logger.errorObj(e, 'process concater failed')
      throw e
    }
  }, {
    autorun: false,
    connection: {
      host: getCfg().REDIS_HOST,
      port: getNumberCfg('REDIS_PORT')
    },
    concurrency: 10
  })
  try {
    worker.run()
    logger.info('start concater worker')
  } catch (e) {
    logger.errorObj(e, 'start concater error')
  }
}

export function stop() {
  if (worker) {
    worker.close()
  }
}

start()
