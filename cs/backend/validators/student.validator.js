import { body } from 'express-validator';

export const createStudentValidator = [
  body('name')
    .trim().escape()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian phone number'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('course')
    .notEmpty().withMessage('Course is required')
    .isMongoId().withMessage('Invalid course ID'),
  body('batch')
    .notEmpty().withMessage('Batch is required')
    .isMongoId().withMessage('Invalid batch ID'),
  body('totalFees')
    .notEmpty().withMessage('Total fees is required')
    .isFloat({ min: 0 }).withMessage('Total fees must be a non-negative number'),
  body('admissionDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Invalid date format'),
  body('address')
    .optional()
    .trim().escape()
    .isLength({ max: 300 }).withMessage('Address cannot exceed 300 characters'),
];

export const updateStudentValidator = [
  body('name')
    .optional()
    .trim().escape()
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian phone number'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'completed']).withMessage('Status must be active, inactive, or completed'),
];
