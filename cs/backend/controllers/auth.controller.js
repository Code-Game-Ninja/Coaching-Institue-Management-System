import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });

  successResponse(res, {
    token,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    admin: { _id: admin._id, name: admin.name, email: admin.email },
  }, 'Login successful');
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  successResponse(res, req.admin);
});

// PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.admin._id).select('+password');
  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  admin.password = await bcrypt.hash(newPassword, 12);
  await admin.save();

  successResponse(res, null, 'Password changed successfully');
});
