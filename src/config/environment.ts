import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production"

// In production, secrets must come from the environment. Dev defaults are only for local runs.
const required = (name: string, devDefault: string) => {
    const value = process.env[name] || (isProduction ? undefined : devDefault)
    if (!value) throw new Error(`Missing required env var: ${name}`)
    return value
}

export const API_BASE_URL = process.env.API_BASE_URL || "/api/v1"
export const SERVER_PORT = Number(process.env.SERVER_PORT) || 3000
export const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${SERVER_PORT}`
export const MONGO_URI = required("MONGO_URI", "mongodb://localhost:27017/linksnap")
export const REDIS_URL = required("REDIS_URL", "redis://localhost:6379")
export const JWT_SECRET = required("JWT_SECRET", "dev-secret-change-me")
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"
export const LINK_CACHE_TTL_SECONDS = Number(process.env.LINK_CACHE_TTL_SECONDS) || 3600
export const WORKER_PORT = Number(process.env.WORKER_PORT) || 9100
export const WORKER_CONCURRENCY = Number(process.env.WORKER_CONCURRENCY) || 10
export const LOG_LEVEL = process.env.LOG_LEVEL || "info"
// Number of proxies in front of the app (e.g. 1 behind an AWS ALB) so req.ip is the real client IP.
export const TRUST_PROXY = Number(process.env.TRUST_PROXY) || 0
