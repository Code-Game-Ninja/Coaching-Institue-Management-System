import { body } from 'express-validator';

export const createBatchValidator = [
  body('name')
    .trim().escape()
    .notEmpty().withMessage('Batch name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('course')
    .notEmpty().withMessage('Course is required')
    .isMongoId().withMessage('Invalid course ID'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format'),
  body('endDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Invalid end date format'),
  body('timing')
    .trim()
    .notEmpty().withMessage('Timing is required'),
  body('teacher')
    .optional()
    .trim().escape(),
];

export const updateBatchValidator = [
  body('name')
    .optional()
    .trim().escape()
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  body('endDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Invalid end date format'),
];
