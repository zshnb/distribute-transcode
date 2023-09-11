import { RedisClientType, createClient } from "redis"
import { getLogger } from "../logger"

const redisConnection = {
  host: 'localhost',
  port: 6379
}

const logger = getLogger('redis-client')
function getRedisClient() {
  const client = createClient({
    url: `redis://${redisConnection.host}:${redisConnection.port}`
  })
  logger.info('create redis client')
  client.connect()
  return client
}

async function closeRedisClient(client: RedisClientType) {
  await client.disconnect()
}

const schedulerRedisClient = getRedisClient()
const workerRedisClient = getRedisClient()
export {
  schedulerRedisClient,
  workerRedisClient
}
