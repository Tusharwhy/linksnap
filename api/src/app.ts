import express from "express"
import { pinoHttp } from "pino-http"
import { ZodError } from "zod"
import router from "./routers/index.js"
import redirectRouter from "./routers/redirect.js"
import { API_BASE_URL, TRUST_PROXY } from "./config/environment.js"
import { logger } from "./config/logger.js"
import { isDatabaseReady } from "./config/database.js"
import { isRedisReady } from "./config/redis.js"
import { HttpError } from "./utils/httpError.js"
import { metricsMiddleware, registry } from "./utils/metrics.js"

const app = express()

app.set("trust proxy", TRUST_PROXY)

const quietPaths = ["/healthz", "/readyz", "/metrics"]
app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => quietPaths.includes(req.url ?? "") } }))
app.use(metricsMiddleware)

app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ limit: "10kb", extended: true }))

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to LinkSnap API"
    })
})

// Liveness: the process is up. Never checks dependencies, or a DB blip would restart every pod.
app.get("/healthz", (req, res) => {
    res.status(200).json({
        message: "LinkSnap API is healthy"
    })
})

// Readiness: can this instance serve traffic? MongoDB is required.
// Redis is reported but not required, because the app falls back to MongoDB without it.
app.get("/readyz", async (req, res) => {
    const mongo = isDatabaseReady()
    const redis = await isRedisReady()
    res.status(mongo ? 200 : 503).json({ mongo, redis })
})

app.get("/metrics", async (req, res) => {
    res.set("Content-Type", registry.contentType)
    res.send(await registry.metrics())
})

app.use("/r", redirectRouter)
app.use(API_BASE_URL, router)

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" })
})

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Validation failed",
            errors: err.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }))
        })
    }
    if (err instanceof HttpError) {
        return res.status(err.status).json({ message: err.message })
    }
    // Errors like invalid JSON come with a 4xx status from Express itself
    const status = err?.status ?? err?.statusCode ?? 500
    if (status < 500) {
        return res.status(status).json({ message: err.message })
    }
    req.log.error({ err }, "Unhandled error")
    res.status(500).json({ message: "Internal Server Error" })
})

export default app
