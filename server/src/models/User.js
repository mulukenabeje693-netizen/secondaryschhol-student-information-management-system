import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    studentId: { type: String, default: null },
    linkedStudentIds: { type: [String], default: [] },
    role: {
      type: String,
      enum: ['admin', 'parent', 'teacher', 'record', 'system_admin', 'student', 'director', 'super_admin', 'registrar'],
      default: 'student'
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    lastLogin: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
