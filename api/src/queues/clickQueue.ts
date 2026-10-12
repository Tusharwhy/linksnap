import { Queue } from "bullmq"
import { createQueueConnection } from "../config/redis.js"

export const CLICK_QUEUE_NAME = "clicks"

export interface ClickJobData {
    code: string
    ts: string
    userAgent?: string
    referer?: string
}

// Created on first use, so processes that only consume jobs (the worker) don't open an extra connection.
let clickQueue: Queue<ClickJobData> | undefined

export const getClickQueue = () => {
    clickQueue ??= new Queue<ClickJobData>(CLICK_QUEUE_NAME, {
        connection: createQueueConnection(),
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: "exponential", delay: 1000 },
            removeOnComplete: 1000,
            removeOnFail: 5000,
        },
    })
    return clickQueue
}

export const closeClickQueue = async () => {
    await clickQueue?.close()
}
