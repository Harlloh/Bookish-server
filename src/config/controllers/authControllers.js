import { sendVerificationEmail } from "../../services/emailService.js";
import { generateToken } from "../../utils/generateToken.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import { prisma } from "../db.js";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';


export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body
        //check if user already exist
        const userExist = await prisma.user.findUnique({
            where: { email: email }
        });

        if (userExist) {
            errorResponse(409, res, 'User already exist with this email!',)
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

        //GENERATE TOKEN
        const token = generateToken(user.id, res);

        //generate and save user verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        await prisma.verificationToken.create({
            data: {
                userId: user.id,
                token: verificationToken,
                type: 'email_verification',
                expiresAt: new Date(Date.now() + 10 * 60 * 1000) //10 minutes from now
            }
        })
        const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}&id=${user.id}`;
        await sendVerificationEmail(user.email, verificationUrl, user.name);




        // res.json({ msg: 'Holla' })
        successResponse(201, res, user, 'token', token, 'User registered successfully, verification link has been sent to your mail');

    } catch (error) {
        console.error('Registration error:', error)
        errorResponse(500, res, 'An error occured during registration. Please try again', error)
    }
}


export const verify = async (userId) => {
    res.json({ message: 'verification route' })
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
    const token = generateToken(user.id, res);

    // res.json({ msg: 'Holla' })
    res.json({
        status: 'success',
        message: 'User logged in successfully',
        data: {
            user: {
                id: user.id,
                user: user.name,
                email: email
            },
            token,
        }
    })
}


export const logout = async (req, res) => {
    res.cookie('jwt', "", {
        expires: new Date(0),
        httpOnly: true,
    });
    res.status(200).json({ message: 'User logged out successfully' });
}