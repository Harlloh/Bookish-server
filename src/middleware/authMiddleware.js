import jwt from "jsonwebtoken";
import { prisma } from '../config/db.js';
import { generateAccessToken } from "../utils/generateToken.js";


//read token from request cookie

export const authMiddleware = async (req, res, next) => {
    try {
        console.log('Auth Middleware reached...');
        let token;

        //check if the token is sent as a bearer token or as httpOnly token
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(' ')[1]
        } else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken
        }
        console.log(token, 'Token found in auth middleware');
        if (!token) {
            // Check if refresh token exists
            if (req.cookies?.refreshToken) {
                // Has refresh token but no access token - frontend should refresh
                return res.status(401).json({
                    error: 'Access token missing. Please refresh.',
                    code: 'NO_ACCESS_TOKEN'
                });
            }
            // No access token AND no refresh token - must sign in
            return res.status(401).json({
                error: 'Not authorized. Please sign in.',
                code: 'NO_TOKEN'
            });
        }


        try {
            //verify the token is valid and extract the user id
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            //check if user exist in the database
            const user = await prisma.user.findUnique({
                where: { id: decoded.id }
            });

            if (!user) {
                return res.status(401).json({ error: 'User no longer exist' })
            }
            // Attach the user data to the request object for future use
            req.user = user;

            next()

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error: 'Access token expired',
                    code: 'ACCESS_TOKEN_EXPIRED' // Frontend uses this to trigger refresh
                });
            };
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    error: 'Invalid token'
                });
            };
            return res.status(401).json({
                error: 'Token verification failed'
            });

        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            error: 'Authentication failed'
        });
    }


}