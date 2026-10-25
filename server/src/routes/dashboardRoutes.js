import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAnnouncements, getStudents, getUsers } from '../store.js';

const router = express.Router();

router.get('/summary', authenticate, (req, res) => {
  const users = getUsers();
  const students = getStudents();
  const announcements = getAnnouncements();

  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  const gradeCounts = students.reduce((acc, student) => {
    acc[student.grade] = (acc[student.grade] || 0) + 1;
    return acc;
  }, {});

  const genderCounts = students.reduce((acc, student) => {
    const key = student.gender || 'Male';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totals: {
      students: students.length,
      users: users.length,
      announcements: announcements.length,
      activeStudents: students.filter((student) => student.enrollmentStatus === 'active').length,
      teachers: users.filter((user) => user.role === 'teacher').length
    },
    roleCounts,
    gradeCounts,
    genderCounts,
    recentAnnouncements: announcements.slice(0, 5),
    recentStudents: students.slice(0, 5).map((student) => ({
      id: student.id,
      fullName: student.fullName,
      grade: student.grade,
      section: student.section,
      studentId: student.studentId
    }))
  });
});

export default router;
