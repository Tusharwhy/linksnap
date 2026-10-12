import type { Request, Response } from "express"
import { enqueueClick } from "../services/clickService.js"
import { resolveLink } from "../services/linkService.js"

export const redirect = async (req: Request, res: Response) => {
    const code = req.params.code as string
    const url = await resolveLink(code)

    // Not awaited: the user is redirected immediately, the worker records the click later.
    enqueueClick({
        code,
        ts: new Date().toISOString(),
        userAgent: req.get("user-agent"),
        referer: req.get("referer"),
    }).catch((error) => req.log.warn({ err: error }, "Failed to enqueue click"))

    res.redirect(302, url)
}
