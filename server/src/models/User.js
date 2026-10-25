import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_admin', 'registrar', 'teacher', 'student', 'parent'],
      default: 'student'
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    lastLogin: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
