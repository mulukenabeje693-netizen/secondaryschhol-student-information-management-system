import express from 'express';
import crypto from 'crypto';
import { authenticate, authorize } from '../middleware/auth.js';
import { getTeachers, saveTeachers, logAuditEvent } from '../store.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  res.json(getTeachers());
});

router.post('/', authenticate, authorize('super_admin', 'registrar'), (req, res) => {
  const teachers = getTeachers();
  const { teacherId, fullName, department, email, status } = req.body;

  if (!teacherId || !fullName || !department || !email) {
    return res.status(400).json({ message: 'Teacher ID, full name, department, and email are required.' });
  }

  if (teachers.some((teacher) => teacher.teacherId === teacherId || teacher.email === email)) {
    return res.status(400).json({ message: 'A teacher with this ID or email already exists.' });
  }

  const newTeacher = {
    id: crypto.randomUUID(),
    teacherId,
    fullName,
    department,
    email,
    status: status || 'active',
    createdAt: new Date().toISOString()
  };

  teachers.push(newTeacher);
  saveTeachers(teachers);
  logAuditEvent('teacher.created', req.user?.email || 'system', { teacherId: newTeacher.teacherId, fullName: newTeacher.fullName });
  res.status(201).json(newTeacher);
});

export default router;
