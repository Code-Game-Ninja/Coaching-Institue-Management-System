import { Router } from 'express';
import { getStudents, getStudent, createStudent, updateStudent, deleteStudent } from '../controllers/student.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createStudentValidator, updateStudentValidator } from '../validators/student.validator.js';

const router = Router();

router.use(verifyToken);

router.get('/', getStudents);
router.get('/:id', getStudent);
router.post('/', createStudentValidator, validate, createStudent);
router.put('/:id', updateStudentValidator, validate, updateStudent);
router.delete('/:id', deleteStudent);

export default router;
