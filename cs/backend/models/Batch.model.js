import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Batch name is required'],
      trim: true,
      maxlength: [100, 'Batch name cannot exceed 100 characters'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    teacher: {
      type: String,
      default: '',
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          return !value || value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    timing: {
      type: String,
      required: [true, 'Batch timing is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Batch', batchSchema);
