import { schedulerRedisClient } from "../redis";

export type TranscodeTaskMessage = {
  id: string
  message: {
    trakscodeId: string
  }
}
const lastAckMessageKey = 'last-ack-message-id'
const streamKey = 'transcode-task'
async function setLastAckMessageId(id: string) {
  await schedulerRedisClient.setNX(lastAckMessageKey, id)
}

async function getLaskAckMessageId(): Promise<string | null> {
  return schedulerRedisClient.get(lastAckMessageKey)
}

async function createGroup() {
  await schedulerRedisClient.xGroupCreate(streamKey, 'group1', '0')
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
