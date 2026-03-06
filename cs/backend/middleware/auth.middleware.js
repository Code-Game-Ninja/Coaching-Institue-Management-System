import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const admin = await Admin.findById(decoded.id).select('-password');
  if (!admin) {
    return res.status(401).json({
      success: false,
      message: 'Admin not found. Token is no longer valid.',
    });
  }

  req.admin = admin;
  next();
});
