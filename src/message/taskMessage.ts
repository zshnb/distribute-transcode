import { getLogger } from "../logger";
import { schedulerRedisClient } from "../redis";

const logger = getLogger('task-message')
export type TranscodeTaskMessage = {
  id: string
  message: {
    taskId: string
  }
}
const lastAckMessageKey = 'last-ack-message-id'
const streamKey = 'transcode-task'
async function setLastAckMessageId(id: string) {
  await schedulerRedisClient.setNX(lastAckMessageKey, id)
  logger.info(`set lastAckMessageId: ${id}`)
}

async function getLaskAckMessageId(): Promise<string | null> {
  const lastAckMessageId = await schedulerRedisClient.get(lastAckMessageKey)
  logger.info(`lastAckMessageId: ${lastAckMessageId}`)
  return lastAckMessageId
}

async function createGroup() {
  await schedulerRedisClient.xGroupCreate(streamKey, 'group1', '0')
  logger.info(`created transcode-task group1`)
}

async function readMessage(): Promise<TranscodeTaskMessage | undefined> {
  const result = await schedulerRedisClient.xReadGroup('group1', 'consumer1', { id: '>', key: streamKey }, {
    COUNT: 1
  })
  if (result) {
    return result[0].messages[0] as TranscodeTaskMessage
  }
}

async function ack(messageId: string) {
  await schedulerRedisClient.xAck(streamKey, 'group1', messageId)
  logger.info(`ack ${messageId}`)
}

export default function useTaskMessage() {
  return {
    readMessage,
    createGroup,
    setLastAckMessageId,
    getLaskAckMessageId,
    ack
  }
}
