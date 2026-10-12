import client from "prom-client"
import type { NextFunction, Request, Response } from "express"

export const registry = new client.Registry()
client.collectDefaultMetrics({ register: registry })

export const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status"],
    buckets: [0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
    registers: [registry],
})

export const redirectsTotal = new client.Counter({
    name: "linksnap_redirects_total",
    help: "Redirects served, by cache hit or miss",
    labelNames: ["cache"],
    registers: [registry],
})

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const end = httpRequestDuration.startTimer()
    res.on("finish", () => {
        // Label by route pattern (/r/:code), not the real path, to keep the number of series small.
        const route = req.route?.path ? `${req.baseUrl}${req.route.path}` : "unmatched"
        end({ method: req.method, route, status: res.statusCode })
    })
    next()
}
