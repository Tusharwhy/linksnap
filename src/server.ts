import http from "http"
import app from "./app.js"
import { SERVER_PORT } from "./config/environment.js"
import { logger } from "./config/logger.js"
import { connectToDatabase, disconnectFromDatabase } from "./config/database.js"
import { redis } from "./config/redis.js"
import { closeClickQueue } from "./queues/clickQueue.js"

const server = http.createServer(app)

server.on("error", (error) => {
    logger.fatal({ err: error }, "Server error")
    process.exit(1)
})

const start = async () => {
    try {
        await connectToDatabase()
    } catch (error) {
        logger.fatal({ err: error }, "Could not connect to MongoDB")
        process.exit(1)
    }
    server.listen(SERVER_PORT, () => {
        logger.info(`Server is running on port ${SERVER_PORT}`)
    })
}

let shuttingDown = false

const gracefulShutdown = (signal: string) => {
    if (shuttingDown) return
    shuttingDown = true
    logger.info(`Received ${signal}. Shutting down gracefully...`)

    // If in-flight requests never finish, force exit after 10s.
    setTimeout(() => {
        logger.error("Forcing shutdown")
        process.exit(1)
    }, 10_000).unref()

    server.close(async () => {
        logger.info("HTTP Server closed")
        await Promise.allSettled([disconnectFromDatabase(), closeClickQueue(), redis.quit()])
        process.exit(0)
    })
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))

start()
