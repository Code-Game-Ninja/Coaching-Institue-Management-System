import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import Student from '../models/Student.model.js';
import { sendFeeReminder } from '../utils/emailService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();

router.use(verifyToken);

// POST /api/email/fee-reminder — send to single student
router.post('/fee-reminder', asyncHandler(async (req, res) => {
  const { studentId, dueDate, message } = req.body;

  if (!studentId) {
    return res.status(400).json({ success: false, message: 'Student ID is required' });
  }

  const student = await Student.findById(studentId).populate('course', 'name').populate('batch', 'name');
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  if (!student.email) {
    return res.status(400).json({ success: false, message: `Student "${student.name}" has no email address. Please add an email first.` });
  }

  if (student.feesPaid >= student.totalFees) {
    return res.status(400).json({ success: false, message: 'Student fees are already fully paid' });
  }

  await sendFeeReminder(student, dueDate, message);
  successResponse(res, { sent: true, email: student.email }, `Reminder sent to ${student.email}`);
}));

// POST /api/email/bulk-fee-reminder — send to all students with pending fees
router.post('/bulk-fee-reminder', asyncHandler(async (req, res) => {
  const { dueDate, message } = req.body;

  const students = await Student.find({ status: 'active' })
    .populate('course', 'name')
    .populate('batch', 'name');

  const pending = students.filter(s => s.feesPaid < s.totalFees && s.email);
  
  if (pending.length === 0) {
    return res.status(400).json({ success: false, message: 'No students with pending fees and valid email addresses found' });
  }

  const results = { sent: 0, failed: 0, errors: [] };

  for (const student of pending) {
    try {
      await sendFeeReminder(student, dueDate, message);
      results.sent++;
    } catch (err) {
      results.failed++;
      results.errors.push({ name: student.name, error: err.message });
    }
  }

  successResponse(res, results, `Sent ${results.sent} reminder(s), ${results.failed} failed`);
}));

export default router;
