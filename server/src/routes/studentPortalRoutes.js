import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAttendance, getFees, getResults, getStudents } from '../store.js';

const router = express.Router();

router.get('/me', authenticate, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'This portal is only available to students.' });
  }

  const students = getStudents();
  const student = students.find((entry) => {
    return String(entry.studentId) === String(req.user.studentId) || String(entry.fullName) === String(req.user.name);
  });

  const studentId = student?.studentId || req.user.studentId;
  const attendance = studentId ? getAttendance().filter((entry) => String(entry.studentId) === String(studentId)) : [];
  const results = studentId ? getResults().filter((entry) => String(entry.studentId) === String(studentId)) : [];
  const fees = studentId ? getFees().filter((entry) => String(entry.studentId) === String(studentId)) : [];

  res.json({
    student,
    attendance,
    results,
    fees
  });
});

export default router;
