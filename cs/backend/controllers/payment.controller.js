import Payment from '../models/Payment.model.js';
import Student from '../models/Student.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

// GET /api/payments
export const getPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, student, paymentMode, sort = '-paymentDate' } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (student) filter.student = student;
  if (paymentMode) filter.paymentMode = paymentMode;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate('student', 'name phone')
      .populate('recordedBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Payment.countDocuments(filter),
  ]);

  paginatedResponse(res, payments, {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// GET /api/payments/pending
export const getPendingFees = asyncHandler(async (req, res) => {
  const students = await Student.find({ status: 'active' })
    .populate('course', 'name')
    .populate('batch', 'name')
    .sort('-createdAt');

  const pending = students.filter((s) => s.feesPaid < s.totalFees);
  successResponse(res, pending);
});

// POST /api/payments
export const createPayment = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.body.student);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  if (student.feesPaid >= student.totalFees) {
    return res.status(400).json({
      success: false,
      message: 'Student fees are already fully paid',
    });
  }

  const maxPayable = student.totalFees - student.feesPaid;
  if (req.body.amount > maxPayable) {
    return res.status(400).json({
      success: false,
      message: `Payment amount exceeds remaining balance. Maximum payable: ₹${maxPayable}`,
    });
  }

  const payment = await Payment.create({ ...req.body, recordedBy: req.admin._id });
  const populated = await payment.populate('student', 'name phone');

  successResponse(res, populated, 'Payment recorded successfully', 201);
});

// DELETE /api/payments/:id
export const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOneAndDelete({ _id: req.params.id });
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment not found' });
  }

  // The post-findOneAndDelete hook in Payment model handles decrementing feesPaid
  successResponse(res, null, 'Payment deleted successfully');
});
