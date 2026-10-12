import pino from "pino"
import { LOG_LEVEL } from "./environment.js"

// Structured JSON logs, one object per line. Easy to search in CloudWatch / Loki later.
export const logger = pino({ level: LOG_LEVEL })
