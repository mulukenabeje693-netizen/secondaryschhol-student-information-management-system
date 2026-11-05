import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAnnouncements, getAttendance, getFees, getResults, getStudents, getTimetable, getUsers } from '../store.js';

const router = express.Router();

const mapChildren = (user) => {
  const linkedIds = (user.linkedStudentIds || []).map(String);
  const students = getStudents().filter((student) => {
    return linkedIds.includes(String(student.id)) || linkedIds.includes(String(student.studentId));
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    children: students
  };
};

router.get('/', authenticate, (req, res) => {
  const user = req.user;

  const users = getUsers().filter((entry) => entry.role === 'parent');
  res.json(users.map((entry) => mapChildren(entry)));
});

router.get('/me', authenticate, (req, res) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({ message: 'This portal is only available to guardians.' });
  }

  const profile = mapChildren(req.user);
  const studentIds = new Set(profile.children.flatMap((student) => [String(student.id), String(student.studentId)]));
  const gradeNames = new Set(profile.children.map((student) => student.grade));
  res.json({
    parent: profile,
    attendance: getAttendance().filter((entry) => studentIds.has(String(entry.studentId))),
    results: getResults().filter((entry) => studentIds.has(String(entry.studentId))),
    fees: getFees().filter((entry) => studentIds.has(String(entry.studentId))),
    timetable: getTimetable().filter((entry) => gradeNames.has(entry.className)),
    announcements: getAnnouncements()
  });
});

export default router;
