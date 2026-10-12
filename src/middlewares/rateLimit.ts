import type { NextFunction, Request, Response } from "express"
import { redis } from "../config/redis.js"

interface RateLimitOptions {
    prefix: string
    limit: number
    windowSeconds: number
}

// Fixed-window limiter in Redis, shared by all API replicas.
// Fails open: if Redis is down, requests are allowed rather than blocking every user.
export const rateLimit = ({ prefix, limit, windowSeconds }: RateLimitOptions) =>
    async (req: Request, res: Response, next: NextFunction) => {
        const window = Math.floor(Date.now() / 1000 / windowSeconds)
        const key = `rl:${prefix}:${req.ip}:${window}`
        try {
            const count = await redis.incr(key)
            if (count === 1) await redis.expire(key, windowSeconds)
            if (count > limit) {
                res.setHeader("Retry-After", windowSeconds)
                return res.status(429).json({ message: "Too many requests, try again later" })
            }
        } catch (error) {
            req.log.warn({ err: error }, "Rate limiter unavailable, allowing request")
        }
        next()
    }
