import { Job, Worker } from "bullmq";
import { getLogger } from "../../logger";
import { processSplit } from "./splitter";
import { SplitJobRequest, SplitJobResponse } from "../../types/worker/splitter";
import { Context, runWithContext } from "../../context";
import { getCfg, getNumberCfg } from "../../cfg";

const logger = getLogger('splitter-starter')
let worker: Worker
function start() {
  worker = new Worker('split', async (job: Job) => {
    try {
      const request = job.data as SplitJobRequest
      const context: Context = {
        taskId: request.taskId,
        jobId: job.id
      }
      return await runWithContext<SplitJobResponse, Job>(context, processSplit, job)
    } catch (e) {
      logger.errorObj(e, 'process split failed')
      throw e
    }
  }, {
    autorun: false,
    connection: {
      host: getCfg().REDIS_HOST,
      port: getNumberCfg('REDIS_PORT')
    }
  })
  try {
    worker.run()
    logger.info('start splitter worker')
  } catch (e) {
    logger.errorObj(e, 'start splitter error')
  }
}

export function stop() {
  if (worker) {
    worker.close()
  }
}

start()

