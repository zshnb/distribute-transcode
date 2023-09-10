import { Job, Worker } from "bullmq";
import { getLogger } from "../../logger";
import { SplitJobRequest, SplitJobResponse } from "../../types/worker/splitter";
import { Context, runWithContext } from "../../context";
import { processTranscode } from "./transcoder";

const logger = getLogger('transcoder-starter')
let worker: Worker
function start() {
  worker = new Worker('transcoder', (job: Job) => {
    const request = job.data as SplitJobRequest
    const context: Context = {
      taskId: request.taskId
    }
    return runWithContext<SplitJobResponse, Job>(context, processTranscode, job)
  }, {
    autorun: false,
    connection: {
      host: 'localhost',
      port: 6379
    }
  })
  try {
    worker.run()
    logger.info('start transcoder worker')
  } catch (e) {
    logger.error(e, 'start transcoder error')
  }
}

export function stop() {
  if (worker) {
    worker.close()
  }
}

start()
