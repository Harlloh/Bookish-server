import express from 'express';
import { getAllBooks, addBook } from '../config/controllers/booksControllers.js';

const router = express.Router();

router.get('/', getAllBooks)
router.post('/add-book', addBook)

export default router;