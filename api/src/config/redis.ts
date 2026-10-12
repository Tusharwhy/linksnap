import { Redis } from "ioredis"
import { REDIS_URL } from "./environment.js"
import { logger } from "./logger.js"

// Cache + rate limit client. Fails fast so that when Redis is down or unresponsive,
// requests fall back to MongoDB instead of hanging:
// - enableOfflineQueue: false -> error immediately while disconnected
// - commandTimeout -> error if Redis is connected but not answering (e.g. network issue)
export const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    commandTimeout: 500,
})

redis.on("error", (error) => logger.warn({ err: error }, "Redis error"))

// BullMQ needs its own connections with maxRetriesPerRequest: null.
export const createQueueConnection = () => {
    const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null })
    connection.on("error", (error) => logger.warn({ err: error }, "Queue Redis error"))
    return connection
}

export const isRedisReady = async () => {
    try {
        return (await redis.ping()) === "PONG"
    } catch {
        return false
    }
}
