import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import crypto from 'crypto';




export const generateAccessToken = (userId, res) => {
    const payload = { id: userId };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '10m',
    });
    res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 10 * 60 * 1000 ///10 minutes in milli second
    })
    return token
}

export const generateRefreshToken = async (userId, res) => {
    const usersId = userId
    const token = crypto.randomBytes(64).toString('hex');
    try {
        await prisma.refreshToken.upsert({
            where: { userId: usersId },
            update: {
                token,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            create: {
                token,
                userId: userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 ///7 days in milli second
        });
        return token
    } catch (error) {
        console.log("error saving refresh token: ", error);
        throw new Error('Failed to generate refresh token');
    }
}