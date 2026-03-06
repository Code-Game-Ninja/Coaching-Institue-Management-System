import { Router } from 'express';
import { exportStudents, exportPayments } from '../controllers/report.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/students', exportStudents);
router.get('/payments', exportPayments);

export default router;
