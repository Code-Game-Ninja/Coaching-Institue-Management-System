import Course from '../models/Course.model.js';
import Batch from '../models/Batch.model.js';
import Student from '../models/Student.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';

// GET /api/courses
export const getCourses = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const courses = await Course.find(filter).sort('name');

  // Attach student count per course
  const withCounts = await Promise.all(
    courses.map(async (course) => {
      const studentCount = await Student.countDocuments({ course: course._id });
      return { ...course.toObject(), studentCount };
    })
  );

  successResponse(res, withCounts);
});

// GET /api/courses/:id
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  const batches = await Batch.find({ course: course._id }).sort('name');
  successResponse(res, { course, batches });
});

// POST /api/courses
export const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  successResponse(res, course, 'Course created successfully', 201);
});

// PUT /api/courses/:id
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  successResponse(res, course, 'Course updated successfully');
});

// DELETE /api/courses/:id
export const deleteCourse = asyncHandler(async (req, res) => {
  const enrolledCount = await Student.countDocuments({ course: req.params.id });
  if (enrolledCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete course with ${enrolledCount} enrolled student(s). Deactivate it instead.`,
    });
  }

  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  successResponse(res, null, 'Course deleted successfully');
});
