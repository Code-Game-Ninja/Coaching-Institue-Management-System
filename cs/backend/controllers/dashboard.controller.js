import Student from '../models/Student.model.js';
import Course from '../models/Course.model.js';
import Batch from '../models/Batch.model.js';
import Payment from '../models/Payment.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';

// GET /api/dashboard/stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalStudents,
    activeStudents,
    totalCourses,
    totalBatches,
    feeAgg,
    recentStudents,
    recentPayments,
  ] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ status: 'active' }),
    Course.countDocuments({ isActive: true }),
    Batch.countDocuments({ isActive: true }),
    Student.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$feesPaid' },
          totalPendingFees: { $sum: { $subtract: ['$totalFees', '$feesPaid'] } },
        },
      },
    ]),
    Student.find()
      .populate('course', 'name')
      .populate('batch', 'name')
      .sort('-createdAt')
      .limit(5)
      .select('name phone course batch admissionDate totalFees feesPaid'),
    Payment.find()
      .populate('student', 'name')
      .sort('-paymentDate')
      .limit(5)
      .select('student amount paymentMode paymentDate'),
  ]);

  const { totalRevenue = 0, totalPendingFees = 0 } = feeAgg[0] || {};

  successResponse(res, {
    stats: {
      totalStudents,
      activeStudents,
      totalCourses,
      totalBatches,
      totalRevenue,
      totalPendingFees,
    },
    recentStudents,
    recentPayments,
  });
});
