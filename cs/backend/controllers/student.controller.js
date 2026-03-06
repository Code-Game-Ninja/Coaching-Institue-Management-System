import Student from '../models/Student.model.js';
import Payment from '../models/Payment.model.js';
import Course from '../models/Course.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

// GET /api/students
export const getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, course, batch, feeStatus, status, sort = '-createdAt' } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (search) {
    filter.$text = { $search: search };
  }
  if (course) filter.course = course;
  if (batch) filter.batch = batch;
  if (status) filter.status = status;

  let query = Student.find(filter)
    .populate('course', 'name duration')
    .populate('batch', 'name timing')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  const [students, total] = await Promise.all([query, Student.countDocuments(filter)]);

  // Filter by feeStatus (virtual field — filter post-query)
  let items = students;
  if (feeStatus === 'cleared') {
    items = students.filter((s) => s.feesPaid >= s.totalFees);
  } else if (feeStatus === 'pending') {
    items = students.filter((s) => s.feesPaid < s.totalFees);
  }

  paginatedResponse(res, items, {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// GET /api/students/:id
export const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('course', 'name duration totalFees')
    .populate('batch', 'name timing teacher startDate');

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const paymentHistory = await Payment.find({ student: student._id })
    .sort('-paymentDate')
    .select('amount paymentMode paymentDate notes createdAt');

  successResponse(res, { student, paymentHistory });
});

// POST /api/students
export const createStudent = asyncHandler(async (req, res) => {
  const courseDoc = await Course.findById(req.body.course);
  if (!courseDoc) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  const student = await Student.create(req.body);
  const populated = await student.populate('course batch');
  successResponse(res, populated, 'Student added successfully', 201);
});

// PUT /api/students/:id
export const updateStudent = asyncHandler(async (req, res) => {
  // Prevent direct fee manipulation through this endpoint
  delete req.body.feesPaid;

  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('course batch');

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  successResponse(res, student, 'Student updated successfully');
});

// DELETE /api/students/:id
export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // Delete all associated payments first
  await Payment.deleteMany({ student: student._id });
  await student.deleteOne();

  successResponse(res, null, 'Student deleted successfully');
});
