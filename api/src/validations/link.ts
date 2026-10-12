import { z } from "zod"

export const CODE_PATTERN = /^[0-9A-Za-z]{7}$/

export const codeParamSchema = z.object({
    code: z.string().regex(CODE_PATTERN, "Invalid link code"),
})

export const createLinkSchema = z.object({
    url: z.url({ protocol: /^https?$/ }).max(2048),
})

export const listLinksQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateLinkInput = z.infer<typeof createLinkSchema>
export type ListLinksQuery = z.infer<typeof listLinksQuerySchema>
