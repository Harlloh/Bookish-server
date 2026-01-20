import jwt from "jsonwebtoken";
import { prisma } from '../config/db.js';


//read token from request cookie

export const authMiddleware = async (req, res, next) => {
    console.log('Auth Middleware reached...');
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies?.jwt) {
        token = req.cookies.jwt
    }
    console.log('This is the token', req.cookies);

    if (!token) {
        return res.status(401).json({ error: 'Not authorized' })
    }
    try {
        //verify the token is valid and extract the user id
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        })
        if (!user) {
            return res.status(401).json({ error: 'User no longer exist' })
        }

        req.user = user
        next()
    } catch (error) {
        console.error('An error occured in the auth middleware...', error)
    }

}