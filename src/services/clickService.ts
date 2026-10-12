import { Click } from "../models/click.js"
import { Link } from "../models/link.js"
import { getClickQueue, type ClickJobData } from "../queues/clickQueue.js"

// Called by the API: hands the click to the worker through the queue.
export const enqueueClick = (data: ClickJobData) => getClickQueue().add("click", data)

// Called by the worker for each job.
// Upsert on jobId: a retried job finds the existing click and does nothing (idempotent).
export const recordClick = async (jobId: string, { code, ts, userAgent, referer }: ClickJobData) => {
    const result = await Click.updateOne(
        { jobId },
        { $setOnInsert: { code, ts: new Date(ts), userAgent, referer } },
        { upsert: true }
    )
    if (result.upsertedCount === 1) {
        await Link.updateOne({ code }, { $inc: { clicks: 1 } })
    }
}
