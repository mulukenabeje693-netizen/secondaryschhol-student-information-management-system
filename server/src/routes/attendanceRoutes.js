import express from 'express';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth.js';
import { getAttendance, saveAttendance, getStudents, logAuditEvent } from '../store.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const records = getAttendance();
  const { className } = req.query;

  const filtered = className ? records.filter((entry) => entry.className === className) : records;
  res.json(filtered);
});

router.post('/', authenticate, (req, res) => {
  const attendance = getAttendance();
  const students = getStudents();
  const { studentId, className, date, status } = req.body;

  if (!studentId || !className || !date || !status) {
    return res.status(400).json({ message: 'Student ID, class, date, and status are required.' });
  }

  if (!students.some((student) => student.studentId === studentId)) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  const duplicate = attendance.some(
    (record) => record.studentId === studentId && record.className === className && record.date === date
  );

  if (duplicate) {
    return res.status(400).json({ message: 'Attendance already recorded for this student, class, and date.' });
  }

  const record = {
    id: crypto.randomUUID(),
    studentId,
    className,
    date,
    status,
    recordedBy: req.user.email
  };

  attendance.push(record);
  saveAttendance(attendance);
  logAuditEvent('attendance.recorded', req.user?.email || 'system', { studentId: record.studentId, className: record.className, status: record.status, date: record.date });
  res.status(201).json(record);
});

export default router;
