import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Course name cannot exceed 100 characters'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },
    totalFees: {
      type: Number,
      required: [true, 'Total fees is required'],
      min: [0, 'Fees cannot be negative'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);
