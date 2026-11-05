import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAnnouncements, getAttendance, getFees, getResults, getStudents, getSubjects, getUsers } from '../store.js';

const router = express.Router();

router.get('/summary', authenticate, (req, res) => {
  const users = getUsers();
  const students = getStudents();
  const announcements = getAnnouncements();
  const fees = getFees();
  const allResults = getResults();
  const linkedStudentIds = new Set((req.user.linkedStudentIds || []).map(String));
  const scopedStudents = req.user.role === 'student'
    ? students.filter((student) => String(student.studentId) === String(req.user.studentId))
    : req.user.role === 'parent'
      ? students.filter((student) => linkedStudentIds.has(String(student.studentId)) || linkedStudentIds.has(String(student.id)))
      : students;
  const scopedStudentIds = new Set(scopedStudents.flatMap((student) => [String(student.studentId), String(student.id)]));
  const attendance = getAttendance().filter((entry) => scopedStudentIds.has(String(entry.studentId)));
  const results = getResults().filter((entry) => scopedStudentIds.has(String(entry.studentId)));
  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  const gradeCounts = scopedStudents.reduce((acc, student) => {
    acc[student.grade] = (acc[student.grade] || 0) + 1;
    return acc;
  }, {});

  const genderCounts = scopedStudents.reduce((acc, student) => {
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
    roleCounts: ['parent', 'student'].includes(req.user.role) ? undefined : roleCounts,
    gradeCounts,
    genderCounts,
    roleStats: {
      linkedStudents: scopedStudents.length,
      attendanceRecords: attendance.length,
      results: results.length,
      subjects: new Set(scopedStudents.flatMap((student) => getSubjects().filter((subject) => subject.grade === student.grade).map((subject) => subject.name))).size,
      attendanceRate: attendance.length ? `${Math.round((attendance.filter((entry) => entry.status === 'Present').length / attendance.length) * 100)}%` : '—',
      averageScore: allResults.length ? Math.round(allResults.reduce((sum, entry) => sum + Number(entry.score || 0), 0) / allResults.length) : 0,
      financialTotal: fees.reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
    },
    recentAnnouncements: announcements.slice(0, 5),
    recentStudents: ['parent', 'student'].includes(req.user.role) ? [] : students.slice(0, 5).map((student) => ({
      id: student.id,
      fullName: student.fullName,
      grade: student.grade,
      section: student.section,
      studentId: student.studentId
    }))
  });
});

export default router;
