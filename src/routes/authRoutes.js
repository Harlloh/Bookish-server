import express from 'express';
import { login, logout, register, verifyEmail } from './../config/controllers/authControllers.js';

const router = express.Router();

router.post('/register', register)

router.post('/verify', verifyEmail)

router.post('/login', login)

router.post('/logout', logout)


export default router;