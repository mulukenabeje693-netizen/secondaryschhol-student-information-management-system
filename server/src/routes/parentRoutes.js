import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getStudents, getUsers } from '../store.js';

const router = express.Router();

const mapChildren = (user) => {
  const linkedIds = (user.linkedStudentIds || []).map(String);
  const students = getStudents().filter((student) => {
    return linkedIds.includes(String(student.id)) || linkedIds.includes(String(student.studentId));
  });

  return {
    ...user,
    children: students
  };
};

router.get('/', authenticate, (req, res) => {
  const user = req.user;

  if (user.role !== 'super_admin' && user.role !== 'registrar') {
    const profile = mapChildren(user);
    return res.json([profile]);
  }

  const users = getUsers().filter((entry) => entry.role === 'parent');
  res.json(users.map((entry) => mapChildren(entry)));
});

router.get('/me', authenticate, (req, res) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({ message: 'This portal is only available to guardians.' });
  }

  const profile = mapChildren(req.user);
  res.json({ parent: profile });
});

export default router;
