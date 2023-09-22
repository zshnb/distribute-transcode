import { getLogger } from "../logger";
import { addSplitJob, initSplitQueue } from "./queue/splitQueue";
import { startRouter } from "./router";
import {getTranscodeActiveJobCount, initTranscodeQueue} from "./queue/transcodeQueue";
import { initConcatQueue } from "./queue/concatQueue";
import { getNumberEnv } from "../cfg";
import useTaskMessage from "../message/taskMessage";
import sleep from "sleep-promise";

const logger = getLogger('scheduler')
async function startup() {
  await startRouter()
  initSplitQueue()
  initTranscodeQueue()
  initConcatQueue()
  await startListenTranscodeTaskQueue()
}

startup().then(() => {
  logger.info('startup scheduler')
}).catch(e => {
  logger.error(e, 'scheduler cache error')
})

async function startListenTranscodeTaskQueue() {
  logger.info('start listen transcode task queue')
  const {readMessage} = useTaskMessage()

  const transcodeCapacity = getNumberEnv('TRANSCODE_CONCURRENCY')
  while (true) {
    const transcodeActiveJobCount = await getTranscodeActiveJobCount()
    if (transcodeActiveJobCount < transcodeCapacity) {
      const message = await readMessage()
      if (message) {
        addSplitJob({
          taskId: message.message.taskId,
          fileStorageType: 'FileSystem'
        })
      }
    }
    await sleep(2000)
  }
}
