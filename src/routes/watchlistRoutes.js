import express from 'express';
import { addToWatchList, deleteFromWatchList, updateWatchList } from './../config/controllers/watchlistController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequests } from '../middleware/validateRequestMiddleware.js';
import { addToWatchListSchema } from '../validators/watchlistValidators.js';

const router = express.Router();

router.use(authMiddleware) //this adds the middleware for all the routes defined below
router.post('/', validateRequests(addToWatchListSchema), addToWatchList)
// router.post('/', authMiddleware, addToWatchList) this only adds the middleware for this route

// router.post('/login', login)

// router.post('/logout', logout)
router.delete('/delete/:id', deleteFromWatchList)
router.put('/delete/:id', updateWatchList)


export default router;