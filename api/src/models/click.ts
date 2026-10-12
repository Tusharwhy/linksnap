import { Schema, model } from "mongoose"

const clickSchema = new Schema({
    // Unique BullMQ job id: if a job is retried, the same click is not stored twice.
    jobId: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    ts: { type: Date, required: true },
    userAgent: String,
    referer: String,
})

// Stats query filters by code and a date range.
clickSchema.index({ code: 1, ts: -1 })

export const Click = model("Click", clickSchema)
