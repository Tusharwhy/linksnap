import { customAlphabet } from "nanoid"
import { LINK_CACHE_TTL_SECONDS, PUBLIC_BASE_URL } from "../config/environment.js"
import { redis } from "../config/redis.js"
import { Click } from "../models/click.js"
import { Link } from "../models/link.js"
import { HttpError } from "../utils/httpError.js"
import { redirectsTotal } from "../utils/metrics.js"
import type { ListLinksQuery } from "../validations/link.js"

const generateCode = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 7)
const cacheKey = (code: string) => `link:${code}`
const STATS_DAYS = 7

const toLinkResponse = (link: { code: string; url: string; clicks: number; createdAt: Date }) => ({
    code: link.code,
    url: link.url,
    shortUrl: `${PUBLIC_BASE_URL}/r/${link.code}`,
    clicks: link.clicks,
    createdAt: link.createdAt,
})

const findOwnedLink = async (userId: string, code: string) => {
    const link = await Link.findOne({ code, owner: userId })
    if (!link) throw new HttpError(404, "Link not found")
    return link
}

export const createLink = async (userId: string, url: string) => {
    // 62^7 possible codes, so collisions are rare, but the unique index makes them safe to retry.
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            const link = await Link.create({ code: generateCode(), url, owner: userId })
            return toLinkResponse(link)
        } catch (error) {
            if ((error as { code?: number }).code !== 11000) throw error
        }
    }
    throw new Error("Could not generate a unique code")
}

export const listLinks = async (userId: string, { page, limit }: ListLinksQuery) => {
    const filter = { owner: userId }
    const [links, total] = await Promise.all([
        Link.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        Link.countDocuments(filter),
    ])
    return { links: links.map(toLinkResponse), page, limit, total }
}

export const deleteLink = async (userId: string, code: string) => {
    const link = await findOwnedLink(userId, code)
    await Promise.all([link.deleteOne(), Click.deleteMany({ code })])

    // If Redis is down the cached URL survives until its TTL expires. Acceptable for this app.
    await redis.del(cacheKey(code)).catch(() => {})
}

export const getLinkStats = async (userId: string, code: string) => {
    const link = await findOwnedLink(userId, code)

    const since = new Date()
    since.setUTCHours(0, 0, 0, 0)
    since.setUTCDate(since.getUTCDate() - (STATS_DAYS - 1))

    const rows: { _id: string; clicks: number }[] = await Click.aggregate([
        { $match: { code, ts: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } }, clicks: { $sum: 1 } } },
    ])
    const clicksByDay = new Map(rows.map((row) => [row._id, row.clicks]))

    // Fill in days with no clicks so the chart always has 7 points.
    const daily = Array.from({ length: STATS_DAYS }, (_, i) => {
        const date = new Date(since)
        date.setUTCDate(since.getUTCDate() + i)
        const key = date.toISOString().slice(0, 10)
        return { date: key, clicks: clicksByDay.get(key) ?? 0 }
    })

    return { code, url: link.url, totalClicks: link.clicks, daily }
}

// Cache-aside: try Redis first, fall back to MongoDB. A Redis error counts as a cache miss.
export const resolveLink = async (code: string) => {
    const cached = await redis.get(cacheKey(code)).catch(() => null)
    redirectsTotal.inc({ cache: cached ? "hit" : "miss" })
    if (cached) return cached

    const link = await Link.findOne({ code }).select("url").lean()
    if (!link) throw new HttpError(404, "Link not found")

    redis.set(cacheKey(code), link.url, "EX", LINK_CACHE_TTL_SECONDS).catch(() => {})
    return link.url
}
