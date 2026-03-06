import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyToken);
router.get('/stats', getDashboardStats);

export default router;
