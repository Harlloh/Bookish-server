import express from 'express';
import { login, logout, register, verifyEmail, refreshAccessToken, fetchUser } from './../config/controllers/authControllers.js';
import { authMiddleware } from './../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register)

router.post('/verify', verifyEmail)

router.post('/login', login)
router.post('/refresh', refreshAccessToken)

router.get('/me', authMiddleware, fetchUser)
router.post('/logout', logout)


export default router;