import { Queue, QueueEvents } from "bullmq";
import { getLogger } from "../logger";
import { QueueEnum } from "../types/queue";
export type QueueParame = {
  name: QueueEnum
  handleAddedEvent: (args: { jobId: string, name: string }) => void
  handleCompletedEvent: (args: { jobId: string, returnvalue: string, prev?: string }, id: string) => void
  handleProgressEvent?: (args: { jobId: string, data: number | object }, id: string) => void
  handleDuplicatedEvent?: (args: { jobId: string }, id: string) => void
  handleRemovedEvent?: (args: { jobId: string }, id: string) => void
  handleFailedEvent: (args: { jobId: string, failedReason: string, prev?: string }, id: string) => void

}
const redisConnection = {
  host: 'localhost',
  port: 6379
}
const logger = getLogger('create-queue')
export function createQueue(params: QueueParame) {
  const queue = new Queue(params.name, {
    connection: redisConnection
  })
  const queueEvent = new QueueEvents(params.name, {
    connection: redisConnection
  })
  queueEvent.on('added', (args) => {
    params.handleAddedEvent(args)
    logger.info(`job: ${args.jobId} add into ${params.name}`)
  })
  queueEvent.on('completed', (args, id) => {
    params.handleCompletedEvent(args, id)
    logger.info(`job: ${args.jobId} completed in the ${params.name}`)
  })
  queueEvent.on('failed', (args, id) => {
    params.handleFailedEvent(args, id)
    logger.info(`job: ${args.jobId} failed in the ${params.name}, reason: ${args.failedReason}`)
  })

  if (params.handleDuplicatedEvent) {
    queueEvent.on('duplicated', (args, id) => {
      params.handleDuplicatedEvent?.(args, id)
      logger.info(`job: ${args.jobId} duplicated add in the ${params.name}, ignore it`)
    })
  }
  if (params.handleProgressEvent) {
    queueEvent.on('progress', (args, id) => {
      params.handleProgressEvent?.(args, id)
      logger.info(`job: ${args.jobId} has progress update in the ${params.name}`)
    })
  }
  if (params.handleRemovedEvent) {
    queueEvent.on('removed', (args, id) => {
      params.handleRemovedEvent?.(args, id)
      logger.info(`job: ${args.jobId} is been removed in the ${params.name}`)
    })
  }

  return queue
}
