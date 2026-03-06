import { Router } from 'express';
import { login, getMe, changePassword } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { loginLimiter } from '../middleware/rateLimiter.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { loginValidator, changePasswordValidator } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', loginLimiter, loginValidator, validate, login);
router.get('/me', verifyToken, getMe);
router.put('/change-password', verifyToken, changePasswordValidator, validate, changePassword);

export default router;
