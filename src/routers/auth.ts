import { Router } from "express"
import { login, me, register } from "../controllers/authController.js"
import { requireAuth } from "../middlewares/auth.js"
import { rateLimit } from "../middlewares/rateLimit.js"
import { validate } from "../utils/validate.js"
import { loginSchema, registerSchema } from "../validations/auth.js"

const router = Router()

// 10 attempts per IP per minute protects against password guessing.
const authRateLimit = rateLimit({ prefix: "auth", limit: 10, windowSeconds: 60 })

router.post("/register", authRateLimit, validate({ body: registerSchema }), register)
router.post("/login", authRateLimit, validate({ body: loginSchema }), login)
router.get("/me", requireAuth, me)

export default router
