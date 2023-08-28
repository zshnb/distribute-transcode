import { Queue } from "bullmq";
import { SplitJobRequest } from "../../types/worker/splitter";
import { createQueue } from "../queueCreator";
import { getLogger } from "../../logger";

const logger = getLogger('split-queue')
let queue: Queue
function initSplitterQueue() {
  queue = createQueue({
    name: 'splitter',
    handleAddedEvent: (args: {jobId: string, name: string}) => {
    },
    handleCompletedEvent: (args, id) => {

    },
    handleFailedEvent: (args, id) => {

    }
  })
}

function addSplitJob(request: SplitJobRequest) {
  const {taskId} = request
  const jobId = `${taskId}:split`
  queue.add(jobId, request)
}
