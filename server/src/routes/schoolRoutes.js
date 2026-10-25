import express from 'express';
import crypto from 'crypto';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getSchoolSettings,
  saveSchoolSettings,
  getClasses,
  saveClasses,
  getSubjects,
  saveSubjects
} from '../store.js';

const router = express.Router();

router.get('/settings', authenticate, (req, res) => {
  res.json(getSchoolSettings());
});

router.put('/settings', authenticate, authorize('super_admin', 'registrar'), (req, res) => {
  const current = getSchoolSettings();
  const updated = { ...current, ...req.body, updatedAt: new Date().toISOString() };
  saveSchoolSettings(updated);
  res.json(updated);
});

router.get('/classes', authenticate, (req, res) => {
  res.json(getClasses());
});

router.post('/classes', authenticate, authorize('super_admin', 'registrar'), (req, res) => {
  const classes = getClasses();
  const { name, section, capacity, academicYear } = req.body;

  if (!name || !section || !capacity || !academicYear) {
    return res.status(400).json({ message: 'Class name, section, capacity, and academic year are required.' });
  }

  const entry = {
    id: crypto.randomUUID(),
    name,
    section,
    capacity: Number(capacity),
    academicYear,
    createdAt: new Date().toISOString()
  };

  classes.push(entry);
  saveClasses(classes);
  res.status(201).json(entry);
});

router.get('/subjects', authenticate, (req, res) => {
  res.json(getSubjects());
});

router.post('/subjects', authenticate, authorize('super_admin', 'registrar', 'teacher'), (req, res) => {
  const subjects = getSubjects();
  const { name, grade, teacher } = req.body;

  if (!name || !grade || !teacher) {
    return res.status(400).json({ message: 'Subject name, grade, and teacher are required.' });
  }

  const entry = {
    id: crypto.randomUUID(),
    name,
    grade,
    teacher,
    createdAt: new Date().toISOString()
  };

  subjects.push(entry);
  saveSubjects(subjects);
  res.status(201).json(entry);
});

export default router;
