import mongoose from 'mongoose';
import Student from './Student.model.js';

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Payment amount must be greater than 0'],
    },
    paymentMode: {
      type: String,
      required: [true, 'Payment mode is required'],
      enum: {
        values: ['Cash', 'UPI', 'Bank Transfer'],
        message: 'Payment mode must be Cash, UPI, or Bank Transfer',
      },
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Recorded by admin is required'],
    },
  },
  { timestamps: true }
);

// Post-save hook: update student feesPaid after each payment
paymentSchema.post('save', async function (doc) {
  const student = await Student.findById(doc.student);
  if (student) {
    const newFeesPaid = Math.min(student.feesPaid + doc.amount, student.totalFees);
    await Student.findByIdAndUpdate(doc.student, { feesPaid: newFeesPaid });
  }
});

// Post-delete hook: subtract amount from student feesPaid when payment is deleted
paymentSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Student.findByIdAndUpdate(doc.student, {
      $inc: { feesPaid: -doc.amount },
    });
  }
});

export default mongoose.model('Payment', paymentSchema);
