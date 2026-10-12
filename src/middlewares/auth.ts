import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config/environment.js"
import { HttpError } from "../utils/httpError.js"

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const [scheme, token] = (req.headers.authorization ?? "").split(" ")
    if (scheme !== "Bearer" || !token) throw new HttpError(401, "Missing token")

    try {
        const payload = jwt.verify(token, JWT_SECRET)
        if (typeof payload === "string" || !payload.sub) throw new Error("Bad payload")
        req.userId = payload.sub
    } catch {
        throw new HttpError(401, "Invalid or expired token")
    }
    next()
}
