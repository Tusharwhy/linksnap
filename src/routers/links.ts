import { Router } from "express"
import { create, list, remove, stats } from "../controllers/linkController.js"
import { requireAuth } from "../middlewares/auth.js"
import { rateLimit } from "../middlewares/rateLimit.js"
import { validate } from "../utils/validate.js"
import { codeParamSchema, createLinkSchema, listLinksQuerySchema } from "../validations/link.js"

const router = Router()
router.use(requireAuth)

const createLinkRateLimit = rateLimit({ prefix: "create-link", limit: 30, windowSeconds: 60 })

router.post("/", createLinkRateLimit, validate({ body: createLinkSchema }), create)
router.get("/", validate({ query: listLinksQuerySchema }), list)
router.delete("/:code", validate({ params: codeParamSchema }), remove)
router.get("/:code/stats", validate({ params: codeParamSchema }), stats)

export default router
