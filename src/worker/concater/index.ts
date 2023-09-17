import { Job, Worker } from "bullmq";
import { getLogger } from "../../logger";
import { Context, runWithContext } from "../../context";
import { ConcatJobRequest, ConcatJobResponse } from "../../types/worker/concater";
import { processConcat } from "./concater";

const logger = getLogger('concater-starter')
let worker: Worker
function start() {
  worker = new Worker('concat', async (job: Job) => {
    try {
      const request = job.data as ConcatJobRequest
      const context: Context = {
        taskId: request.taskId
      }
      return await runWithContext<ConcatJobResponse, Job>(context, processConcat, job)
    } catch (e) {
      logger.error(e, 'process concater failed')
      throw e
    }
  }, {
    autorun: false,
    connection: {
      host: 'localhost',
      port: 6379
    },
    concurrency: 10
  })
  try {
    worker.run()
    logger.info('start concater worker')
  } catch (e) {
    logger.error(e, 'start concater error')
  }
}

export function stop() {
  if (worker) {
    worker.close()
  }
}

start()
