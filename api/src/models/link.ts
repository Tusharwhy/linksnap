import { Schema, model } from "mongoose"

const linkSchema = new Schema(
    {
        code: { type: String, required: true, unique: true },
        url: { type: String, required: true },
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        clicks: { type: Number, default: 0 },
    },
    { timestamps: true }
)

export const Link = model("Link", linkSchema)
