import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    grade: { type: String, required: true },
    section: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
    dateOfBirth: { type: Date },
    address: { type: String },
    guardianName: { type: String },
    guardianPhone: { type: String },
    enrollmentStatus: {
      type: String,
      enum: ['active', 'graduated', 'transferred', 'withdrawn'],
      default: 'active'
    }
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model('Student', studentSchema);
