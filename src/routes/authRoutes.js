import express from 'express';
import { login, logout, register, verify } from './../config/controllers/authControllers.js';

const router = express.Router();

router.post('/register', register)
router.post('/verify', verify)

router.post('/login', login)

router.post('/logout', logout)


export default router;