import express from 'express';
import { login, logout, register, verifyEmail, refreshAccessToken } from './../config/controllers/authControllers.js';

const router = express.Router();

router.post('/register', register)

router.post('/verify', verifyEmail)

router.post('/login', login)
router.post('/refresh', refreshAccessToken)

router.post('/logout', logout)


export default router;