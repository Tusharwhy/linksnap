import { z } from "zod"

const email = z.string().trim().toLowerCase().pipe(z.email())

export const registerSchema = z.object({
    email,
    password: z.string().min(8).max(128),
})

export const loginSchema = z.object({
    email,
    password: z.string().min(1).max(128),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
