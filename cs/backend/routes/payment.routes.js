import { Router } from 'express';
import { getPayments, getPendingFees, createPayment, deletePayment } from '../controllers/payment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createPaymentValidator } from '../validators/payment.validator.js';

const router = Router();

router.use(verifyToken);

router.get('/', getPayments);
router.get('/pending', getPendingFees);
router.post('/', createPaymentValidator, validate, createPayment);
router.delete('/:id', deletePayment);

export default router;
