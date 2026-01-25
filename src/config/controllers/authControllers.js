import { generateTokens } from "../../utils/generateToken.js";
import { prisma } from "../db.js";
import bcrypt from 'bcryptjs';
import { errorResponse, successResponse } from './../../utils/response.js';
import { sendVerificationEmail } from "../../services/emailService.js";
import crypto from 'crypto';

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

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' })
    }

    //GENERATE JWT TOKEN
    const { accessToken, refreshToken } = await generateTokens(user.id, res);

    // res.json({ msg: 'Holla' })
    successResponse(200, res, user, 'accessToken', accessToken, 'User logged in successfully');
    // res.json({
    //     status: 'success',
    //     message: 'User logged in successfully',
    //     data: {
    //         user: {
    //             id: user.id,
    //             user: user.name,
    //             email: email
    //         },
    //         token,
    //     }
    // })
}


export const logout = async (req, res) => {
    res.cookie('jwt', "", {
        expires: new Date(0),
        httpOnly: true,
    });
    res.status(200).json({ message: 'User logged out successfully' });
}