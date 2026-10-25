import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    audience: { type: String, enum: ['all', 'students', 'teachers', 'parents'], default: 'all' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    publishedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
