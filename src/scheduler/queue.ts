import { Queue, QueueEvents } from "bullmq";
export type QueueParame = {
  name: string
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
export function createQueue(params: QueueParame) {
  const queue = new Queue(params.name, {
    connection: redisConnection
  })
  const queueEvent = new QueueEvents(params.name, {
    connection: redisConnection
  })
  queueEvent.on('added', params.handleAddedEvent)
  queueEvent.on('completed', params.handleCompletedEvent)
  queueEvent.on('failed', params.handleFailedEvent)
  if (params.handleDuplicatedEvent) {
    queueEvent.on('duplicated', params.handleDuplicatedEvent)
  }
  if (params.handleProgressEvent) {
    queueEvent.on('progress', params.handleProgressEvent)
  }
  if (params.handleRemovedEvent) {
    queueEvent.on('removed', params.handleRemovedEvent)
  }
  
  return queue
}
