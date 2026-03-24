import { generateAccessToken, generateRefreshToken } from "../../utils/generateToken.js";
import { prisma } from "../db.js";
import bcrypt from 'bcryptjs';
import { errorResponse, successResponse } from './../../utils/response.js';
import { sendVerificationEmail } from "../../services/emailService.js";
import crypto from 'crypto';
import jwt from "jsonwebtoken";

//HANDLES REGISTERATION AND SENDING VERIFICATION EMAIL
export const register = async (req, res) => {
    const { name, email, password } = req.body
    //check if user already exist
    const userExist = await prisma.user.findUnique({
        where: { email: email }
    });

    if (userExist) {
        errorResponse(409, res, 'User already exist with this email!');
    }

    //HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt)

    //CREATE USER
    const user = await prisma.user.create({
        data: {
            name,
            password: hashedPassword,
            email
        }
    });

    //Generate and send verification email here
    await handleEmailVerification(user);

    // res.json({ msg: 'Holla' })
    successResponse(200, res, user, 'User registered successfully, check your mail for verification link');

}

export const resendEmailVerification = async (req, res) => {
    const { userId } = req.body;

    const user = await prisma.user.findFirst({
        where: { id: userId }
    })
    if (!user) {
        return res.json({ success: false, message: 'User does not exist' })
    };
    if (user.isVerified) {
        return res.json({ success: false, message: 'User is already verified' })
    }

    const userToken = await prisma.verificationToken.findFirst({
        where: { userId: user.id },
    });

    if (userToken) {
        await prisma.verificationToken.delete({
            where: { id: userToken.id }
        });
    }
    await handleEmailVerification(user);

    return successResponse(200, res, null, 'Verification email resent successfully');

}
const handleEmailVerification = async (user) => {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await prisma.verificationToken.create({
        data: {
            userId: user.id,
            token: verificationToken,
            type: 'email_verification',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        }
    });
    const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}&id=${user.id}`;

    await sendVerificationEmail(user.email, verificationUrl, user.name)
}






//EMAIL VERIFICATION HANDLER/ROUTE
export const verifyEmail = async (req, res) => {
    const { token, userId } = req.body;
    console.log(token, userId);
    const record = await prisma.verificationToken.findFirst({
        where: {
            userId: userId,
            token: token
        }
    })
    console.log(record, 'Record');
    if (!record) {
        errorResponse(400, res, 'Invalid or expired verification token');
    }

    if (record.usedAt) {
        return errorResponse(400, res, 'Verification token already used');
    }

    if (record.expiresAt < new Date()) {
        return errorResponse(400, res, 'Verification token expired');
    }

    await prisma.user.update({
        where: { id: record.userId },
        data: { isVerified: true }
    });

    await prisma.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() }
    });

    successResponse(200, res, null, 'message', 'Email verified successfully');
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    //CHECK IF USER EXIST
    const user = await prisma.user.findUnique({
        where: { email: email }
    })
    console.log('user object', user);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' })
    }

    if (!user.isVerified) {
        return res.status(401).json({ error: 'Please verify your email to login' })
    }


    //CHECK IF PASSWORD IS CORRECT
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' })
    }

    //GENERATE JWT TOKEN
    await generateRefreshToken(user.id, res);
    const accessToken = generateAccessToken(user.id, res);

    // res.json({ msg: 'Holla' })
    res.json({
        success: true,
        message: 'User logged in successfully',
        user: {
            id: user.id,
            user: user.name,
            email: email,
            isVerified: user.isVerified,
            accessToken,
            createdAt: user.createdAt
        },
    })
}


export const refreshAccessToken = async (req, res) => {
    console.log("Refresh token body", req.body);
    console.log("🔄 Refresh started");
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({
                error: 'Refresh token required',
                code: 'NO_REFRESH_TOKEN'
            });
        }


        // Find refresh token in database
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });

        if (!storedToken) {
            return res.status(401).json({
                error: 'Invalid refresh token',
                code: 'INVALID_REFRESH_TOKEN'
            });
        };


        // Check if expired (correct comparison!)
        if (storedToken.expiresAt < new Date()) { // ✅ This is correct
            // Delete expired token
            await prisma.refreshToken.delete({
                where: { token: refreshToken }
            });


            return res.status(401).json({
                error: 'Refresh token expired. Please log in again.',
                code: 'REFRESH_TOKEN_EXPIRED'
            });
        };

        // Generate NEW access token
        const newAccessToken = generateAccessToken(storedToken.userId, res);

        return res.status(200).json({
            message: 'Access token refreshed successfully',
            accessToken: newAccessToken
        });


    } catch (error) {
        console.error("Refresh error: ", error);
        return res.status(500).json({ error: 'Failed to refresh token' })
    }
}

export const fetchUser = async (req, res) => {
    try {
        const { accessToken } = req.cookies
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                isVerified: true,
                createdAt: true
                // Don't send password!
            }
        })
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
}


export const logout = async (req, res) => {
    res.cookie('jwt', "", {
        expires: new Date(0),
        httpOnly: true,
    });
    res.status(200).json({ message: 'User logged out successfully' });
}