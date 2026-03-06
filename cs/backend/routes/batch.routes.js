import { Router } from 'express';
import { getBatches, getBatch, getBatchStudents, createBatch, updateBatch, deleteBatch } from '../controllers/batch.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createBatchValidator, updateBatchValidator } from '../validators/batch.validator.js';

const router = Router();

router.use(verifyToken);

router.get('/', getBatches);
router.get('/:id', getBatch);
router.get('/:id/students', getBatchStudents);
router.post('/', createBatchValidator, validate, createBatch);
router.put('/:id', updateBatchValidator, validate, updateBatch);
router.delete('/:id', deleteBatch);

export default router;
