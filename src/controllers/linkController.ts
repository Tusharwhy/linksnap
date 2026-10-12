import type { Request, Response } from "express"
import { createLink, deleteLink, getLinkStats, listLinks } from "../services/linkService.js"

export const create = async (req: Request, res: Response) => {
    res.status(201).json(await createLink(req.userId!, req.body.url))
}

export const list = async (req: Request, res: Response) => {
    res.json(await listLinks(req.userId!, res.locals.query))
}

export const remove = async (req: Request, res: Response) => {
    await deleteLink(req.userId!, req.params.code as string)
    res.status(204).end()
}

export const stats = async (req: Request, res: Response) => {
    res.json(await getLinkStats(req.userId!, req.params.code as string))
}
