import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/environment.js"
import { User } from "../models/user.js"
import { HttpError } from "../utils/httpError.js"
import type { LoginInput, RegisterInput } from "../validations/auth.js"

const signToken = (userId: string) =>
    jwt.sign({}, JWT_SECRET, {
        subject: userId,
        expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    })

const toAuthResponse = (user: { id: string; email: string }) => ({
    token: signToken(user.id),
    user: { id: user.id, email: user.email },
})

export const registerUser = async ({ email, password }: RegisterInput) => {
    const passwordHash = await bcrypt.hash(password, 10)
    try {
        const user = await User.create({ email, passwordHash })
        return toAuthResponse(user)
    } catch (error) {
        if ((error as { code?: number }).code === 11000) throw new HttpError(409, "Email already registered")
        throw error
    }
}

export const loginUser = async ({ email, password }: LoginInput) => {
    const user = await User.findOne({ email })

    // Same message for "no user" and "wrong password" so attackers can't discover emails.
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw new HttpError(401, "Invalid email or password")
    }
    return toAuthResponse(user)
}

export const getUserById = async (userId: string) => {
    const user = await User.findById(userId).select("email createdAt")
    if (!user) throw new HttpError(404, "User not found")
    return { id: user.id, email: user.email, createdAt: user.createdAt }
}
