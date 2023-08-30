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
  return client
}

function closeRedisClient(client: RedisClientType) {
  client.disconnect()
}

const schedulerRedisClient = getRedisClient()
const workerRedisClient = getRedisClient()
export {
  schedulerRedisClient,
  workerRedisClient
}
