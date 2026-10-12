import { Router } from "express"
import { redirect } from "../controllers/redirectController.js"
import { validate } from "../utils/validate.js"
import { codeParamSchema } from "../validations/link.js"

const router = Router()

router.get("/:code", validate({ params: codeParamSchema }), redirect)

export default router
