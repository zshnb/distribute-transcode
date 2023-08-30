import { getLogger } from "../logger";
import { initSplitQueue } from "./queue/splitQueue";
import { startRouter } from "./router";

const logger = getLogger('scheduler')
async function startup() {
  await startRouter()
  initSplitQueue()
}

startup().then(() => {
  logger.info('startup scheduler')
})

