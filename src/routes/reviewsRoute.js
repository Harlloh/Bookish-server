import express from 'express';
import { addReviewController, editReviewController } from '../config/controllers/reviewControllers.js';

const router = express.Router();

router.post('/add-review/:id', addReviewController)
router.put('/edit-review/:id', editReviewController)

export default router