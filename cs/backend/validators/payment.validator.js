import { body } from 'express-validator';

export const createPaymentValidator = [
  body('student')
    .notEmpty().withMessage('Student is required')
    .isMongoId().withMessage('Invalid student ID'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('paymentMode')
    .notEmpty().withMessage('Payment mode is required')
    .isIn(['Cash', 'UPI', 'Bank Transfer']).withMessage('Payment mode must be Cash, UPI, or Bank Transfer'),
  body('paymentDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Invalid date format'),
  body('notes')
    .optional()
    .trim().escape()
    .isLength({ max: 300 }).withMessage('Notes cannot exceed 300 characters'),
];
