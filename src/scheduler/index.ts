import { getLogger } from "../logger";
import { initSplitQueue } from "./queue/splitQueue";
import { startRouter } from "./router";
import {initTranscodeQueue} from "./queue/transcodeQueue";

const logger = getLogger('scheduler')
async function startup() {
  await startRouter()
  initSplitQueue()
  initTranscodeQueue()
}

startup().then(() => {
  logger.info('startup scheduler')
}).catch(e => {
  logger.error(e, 'scheduler cache error')
})

