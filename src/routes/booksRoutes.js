import express from 'express';
import { getAllBooks, addBook } from '../config/controllers/booksControllers.js';
import upload from '../middleware/multer.js';

const router = express.Router();

router.get('/', getAllBooks)
router.post('/add-book', upload.single('image'), addBook)

export default router;