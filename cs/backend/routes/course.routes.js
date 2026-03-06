import { Router } from 'express';
import { getCourses, getCourse, createCourse, updateCourse, deleteCourse } from '../controllers/course.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createCourseValidator, updateCourseValidator } from '../validators/course.validator.js';

const router = Router();

router.use(verifyToken);

router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/', createCourseValidator, validate, createCourse);
router.put('/:id', updateCourseValidator, validate, updateCourse);
router.delete('/:id', deleteCourse);

export default router;
