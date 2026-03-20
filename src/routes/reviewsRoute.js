import express from 'express';
import { addReviewController } from '../config/controllers/reviewControllers.js';

const router = express.Router();

router.post('/add-review/:id', addReviewController)

export default router