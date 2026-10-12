import http from "http"
import { Worker } from "bullmq"
import client from "prom-client"
import { WORKER_CONCURRENCY, WORKER_PORT } from "./config/environment.js"
import { logger } from "./config/logger.js"
import { connectToDatabase, disconnectFromDatabase, isDatabaseReady } from "./config/database.js"
import { createQueueConnection } from "./config/redis.js"
import { CLICK_QUEUE_NAME, type ClickJobData } from "./queues/clickQueue.js"
import { recordClick } from "./services/clickService.js"

const registry = new client.Registry()
client.collectDefaultMetrics({ register: registry })

const jobsTotal = new client.Counter({
    name: "linksnap_worker_jobs_total",
    help: "Click jobs processed by the worker",
    labelNames: ["status"],
    registers: [registry],
})

const start = async () => {
    await connectToDatabase()

    const worker = new Worker<ClickJobData>(CLICK_QUEUE_NAME, (job) => recordClick(job.id!, job.data), {
        connection: createQueueConnection(),
        concurrency: WORKER_CONCURRENCY,
    })

    worker.on("completed", () => jobsTotal.inc({ status: "completed" }))
    worker.on("failed", (job, error) => {
        jobsTotal.inc({ status: "failed" })
        logger.warn({ jobId: job?.id, err: error }, "Click job failed")
    })
    worker.on("error", (error) => logger.error({ err: error }, "Worker error"))

    // Small HTTP server so Kubernetes/ECS can probe the worker and Prometheus can scrape it.
    const server = http.createServer(async (req, res) => {
        if (req.url === "/healthz") {
            res.writeHead(200).end("ok")
        } else if (req.url === "/readyz") {
            const ready = isDatabaseReady() && worker.isRunning()
            res.writeHead(ready ? 200 : 503).end(ready ? "ready" : "not ready")
        } else if (req.url === "/metrics") {
            res.writeHead(200, { "Content-Type": registry.contentType }).end(await registry.metrics())
        } else {
            res.writeHead(404).end()
        }
    })
    server.listen(WORKER_PORT, () => logger.info(`Worker running, health/metrics on port ${WORKER_PORT}`))

    let shuttingDown = false
    const gracefulShutdown = async (signal: string) => {
        if (shuttingDown) return
        shuttingDown = true
        logger.info(`Received ${signal}. Shutting down worker gracefully...`)
        setTimeout(() => process.exit(1), 10_000).unref()

        // Waits for jobs currently being processed to finish.
        await worker.close()
        server.close()
        await disconnectFromDatabase()
        process.exit(0)
    }

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
    process.on("SIGINT", () => gracefulShutdown("SIGINT"))
}

start().catch((error) => {
    logger.fatal({ err: error }, "Worker failed to start")
    process.exit(1)
})
