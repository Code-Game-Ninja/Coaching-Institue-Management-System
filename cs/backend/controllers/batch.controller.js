import Batch from '../models/Batch.model.js';
import Student from '../models/Student.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';

// GET /api/batches
export const getBatches = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.course) filter.course = req.query.course;
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const batches = await Batch.find(filter)
    .populate('course', 'name')
    .sort('name');

  successResponse(res, batches);
});

// GET /api/batches/:id
export const getBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id).populate('course', 'name totalFees');
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }

  successResponse(res, batch);
});

// GET /api/batches/:id/students
export const getBatchStudents = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }

  const students = await Student.find({ batch: req.params.id })
    .populate('course', 'name')
    .sort('name');

  successResponse(res, { batch, students });
});

// POST /api/batches
export const createBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.create(req.body);
  const populated = await batch.populate('course', 'name');
  successResponse(res, populated, 'Batch created successfully', 201);
});

// PUT /api/batches/:id
export const updateBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('course', 'name');

  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }

  successResponse(res, batch, 'Batch updated successfully');
});

// DELETE /api/batches/:id
export const deleteBatch = asyncHandler(async (req, res) => {
  const enrolledCount = await Student.countDocuments({ batch: req.params.id });
  if (enrolledCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete batch with ${enrolledCount} enrolled student(s). Deactivate it instead.`,
    });
  }

  const batch = await Batch.findByIdAndDelete(req.params.id);
  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }

  successResponse(res, null, 'Batch deleted successfully');
});
