import { Worker } from "bullmq";
import { QueueEnum } from "../../types/queue";
import { getLogger } from "../../logger";

const logger = getLogger('splitter-starter')
function start() {
  const worker = new Worker<any, any, QueueEnum>('splitter', process, {
    autorun: false,
    connection: {
      host: 'localhost',
      port: 6379
    }
  })
  try {
    worker.run()
  } catch(e) {
    logger.error(e, 'start splitter error')
  
  }
}

start()
