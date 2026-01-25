import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import crypto from 'crypto';

export const generateTokens = async (userId, res) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = await generateRefreshToken(userId);
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
        maxAge: 10 * 60 * 1000 ///10 minutes in milli second
    })
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000 ///7 days in milli second
    })
    return { accessToken, refreshToken }
}


const generateAccessToken = (userId) => {
    const payload = { id: userId };
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '10m',
    })
}

const generateRefreshToken = async (userId) => {
    const token = crypto.randomBytes(64).toString('hex');
    try {
        await prisma.refreshToken.create({
            data: {
                token,
                userId: userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });
        return token;
    } catch (error) {
        console.log("error saving refresh token: ", error);
        throw new Error('Failed to generate refresh token');
    }
}