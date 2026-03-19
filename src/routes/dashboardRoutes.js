import express from 'express';
import { getDashboardStat } from '../config/controllers/dashboardController.js';

const router = express.Router()

router.get('/', getDashboardStat)


export default router;