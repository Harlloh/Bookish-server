import express from 'express';
import { getAllBooks, getBookById, addBook, getBookByName } from '../config/controllers/booksControllers.js';
import upload from '../middleware/multer.js';
import { validateRequests } from '../middleware/validateRequestMiddleware.js';
import { addToBooksSchema } from '../validators/addBooksValidator.js';

const router = express.Router();

router.get('/', getAllBooks)
router.post('/search', getBookByName)
router.get(`/:id`, getBookById)
router.post('/add-book', upload.single('image'), validateRequests(addToBooksSchema), addBook);

export default router;