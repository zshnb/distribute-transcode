import { getLogger } from "../logger";
import { initSplitQueue } from "./queue/splitQueue";
import { startRouter } from "./router";
import {initTranscodeQueue} from "./queue/transcodeQueue";
import { initConcatQueue } from "./queue/concatQueue";

const logger = getLogger('scheduler')
async function startup() {
  await startRouter()
  initSplitQueue()
  initTranscodeQueue()
  initConcatQueue()
}

startup().then(() => {
  logger.info('startup scheduler')
}).catch(e => {
  logger.error(e, 'scheduler cache error')
})

