import { Router } from "express";
import authRouter from "./auth.js"
import linksRouter from "./links.js"

const router = Router()

router.use("/auth", authRouter)
router.use("/links", linksRouter)

export default router
