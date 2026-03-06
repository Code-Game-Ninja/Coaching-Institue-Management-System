import { body } from 'express-validator';

export const createCourseValidator = [
  body('name')
    .trim().escape()
    .notEmpty().withMessage('Course name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('duration')
    .trim()
    .notEmpty().withMessage('Duration is required'),
  body('totalFees')
    .notEmpty().withMessage('Total fees is required')
    .isFloat({ min: 0 }).withMessage('Total fees must be a non-negative number'),
  body('description')
    .optional()
    .trim().escape()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

export const updateCourseValidator = [
  body('name')
    .optional()
    .trim().escape()
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('totalFees')
    .optional()
    .isFloat({ min: 0 }).withMessage('Total fees must be a non-negative number'),
];
