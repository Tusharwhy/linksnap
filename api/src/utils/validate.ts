import type { NextFunction, Request, Response } from "express"
import type { ZodType } from "zod"

interface RequestSchemas {
    body?: ZodType
    params?: ZodType
    query?: ZodType
}

// Validates and replaces input with the parsed (trimmed, typed, defaulted) value.
// Invalid input throws a ZodError, which the error handler turns into a 400.
export const validate = (schemas: RequestSchemas) => (req: Request, res: Response, next: NextFunction) => {
    if (schemas.body) req.body = schemas.body.parse(req.body)
    if (schemas.params) req.params = schemas.params.parse(req.params) as Request["params"]
    // req.query is read-only in Express 5, so the parsed query is stored on res.locals
    if (schemas.query) res.locals.query = schemas.query.parse(req.query)
    next()
}
