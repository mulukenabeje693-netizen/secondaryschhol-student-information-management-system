import express from 'express';
import crypto from 'crypto';
import { authenticate, authorize } from '../middleware/auth.js';
import { getStudents, saveStudents } from '../store.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const students = getStudents();
  res.json(students);
});

router.post('/', authenticate, authorize('super_admin', 'registrar'), (req, res) => {
  const students = getStudents();
  const payload = req.body;

  if (!payload.fullName || !payload.grade || !payload.section || !payload.studentId) {
    return res.status(400).json({ message: 'Student ID, full name, grade, and section are required.' });
  }

  if (students.some((student) => student.studentId === payload.studentId)) {
    return res.status(400).json({ message: 'A student with this ID already exists.' });
  }

  const newStudent = {
    id: crypto.randomUUID(),
    studentId: payload.studentId,
    fullName: payload.fullName,
    grade: payload.grade,
    section: payload.section,
    gender: payload.gender || 'Male',
    dateOfBirth: payload.dateOfBirth || null,
    address: payload.address || '',
    guardianName: payload.guardianName || '',
    guardianPhone: payload.guardianPhone || '',
    enrollmentStatus: payload.enrollmentStatus || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  students.push(newStudent);
  saveStudents(students);
  res.status(201).json(newStudent);
});

router.put('/:id', authenticate, authorize('super_admin', 'registrar', 'teacher'), (req, res) => {
  const students = getStudents();
  const index = students.findIndex((student) => student.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  students[index] = {
    ...students[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  saveStudents(students);
  res.json(students[index]);
});

export default router;
