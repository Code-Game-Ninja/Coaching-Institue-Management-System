import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
      match: [/^$|^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    address: {
      type: String,
      default: '',
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch is required'],
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    totalFees: {
      type: Number,
      required: [true, 'Total fees is required'],
      min: [0, 'Fees cannot be negative'],
    },
    feesPaid: {
      type: Number,
      default: 0,
      min: [0, 'Fees paid cannot be negative'],
    },
    photo: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'completed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentSchema.virtual('remainingFees').get(function () {
  return Math.max(0, this.totalFees - this.feesPaid);
});

studentSchema.virtual('feeStatus').get(function () {
  return this.feesPaid >= this.totalFees ? 'cleared' : 'pending';
});

studentSchema.index({ name: 'text', phone: 'text' });
studentSchema.index({ course: 1 });
studentSchema.index({ batch: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ createdAt: -1 });

export default mongoose.model('Student', studentSchema);
