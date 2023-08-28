import { Job, Worker } from "bullmq";
import { getLogger } from "../../logger";
import { processSplit } from "./splitter";
import { SplitJobRequest, SplitJobResponse } from "../../types/worker/splitter";
import { Context, runWithContext } from "../../context";

const logger = getLogger('splitter-starter')
let worker: Worker
function start() {
  worker = new Worker('splitter', (job: Job) => {
    const request = job.data as SplitJobRequest
    const context: Context = {
      taskId: request.taskId
    }
    return runWithContext<SplitJobResponse, Job>(context, processSplit, job)
  }, {
    autorun: false,
    connection: {
      host: 'localhost',
      port: 6379
    }
  })
  try {
    worker.run()
    logger.info('start splitter worker')
  } catch (e) {
    logger.error(e, 'start splitter error')
  }
}

export function stop() {
  if (worker) {
    worker.close()
  }
}

start()
