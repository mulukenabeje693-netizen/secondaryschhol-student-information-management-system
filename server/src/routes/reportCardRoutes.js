import express from 'express';
import crypto from 'crypto';
import { authenticate, authorize } from '../middleware/auth.js';
import { getReportCards, saveReportCards, logAuditEvent } from '../store.js';

const router = express.Router();

const scoreToPoint = (grade) => ({
  A: 4,
  B: 3,
  C: 2,
  D: 1,
  F: 0
}[grade] ?? 0);

const getRemark = (gpa) => {
  if (gpa >= 3.5) return 'Excellent performance and strong academic progress.';
  if (gpa >= 3.0) return 'Very good performance with room for growth.';
  if (gpa >= 2.0) return 'Satisfactory result; focus on improvement in key areas.';
  return 'Needs support and close academic monitoring.';
};

router.get('/', authenticate, (req, res) => {
  const cards = getReportCards();
  if (req.user.role === 'student') {
    return res.json(cards.filter((card) => String(card.studentId) === String(req.user.studentId)));
  }
  if (req.user.role === 'parent') {
    const linkedIds = new Set((req.user.linkedStudentIds || []).map(String));
    return res.json(cards.filter((card) => linkedIds.has(String(card.studentId))));
  }
  res.json(cards);
});

router.get('/student/:studentId', authenticate, (req, res) => {
  if (req.user.role === 'student' && String(req.user.studentId) !== String(req.params.studentId)) {
    return res.status(403).json({ message: 'You may only view your own report cards.' });
  }
  if (req.user.role === 'parent' && !(req.user.linkedStudentIds || []).map(String).includes(String(req.params.studentId))) {
    return res.status(403).json({ message: 'You may only view linked student report cards.' });
  }
  const cards = getReportCards().filter((card) => String(card.studentId) === String(req.params.studentId));
  res.json(cards);
});

router.post('/', authenticate, authorize('super_admin', 'registrar', 'teacher'), (req, res) => {
  const { studentId, studentName, grade, section, term, academicYear, subjects } = req.body;

  if (!studentId || !studentName || !grade || !section || !term || !academicYear) {
    return res.status(400).json({ message: 'Student, grade, section, term, and academic year are required.' });
  }

  const normalizedSubjects = Array.isArray(subjects) && subjects.length
    ? subjects
    : [{ name: 'Overall', score: 0, maxScore: 0, grade: 'F' }];

  const totalPoints = normalizedSubjects.reduce((sum, subject) => sum + scoreToPoint(subject.grade || 'F'), 0);
  const gpa = normalizedSubjects.length ? Number((totalPoints / normalizedSubjects.length).toFixed(2)) : 0;

  const record = {
    id: crypto.randomUUID(),
    studentId,
    studentName,
    grade,
    section,
    term,
    academicYear,
    gpa,
    remark: getRemark(gpa),
    subjects: normalizedSubjects,
    generatedAt: new Date().toISOString()
  };

  const current = getReportCards();
  current.push(record);
  saveReportCards(current);
  logAuditEvent('report-card.generated', req.user?.email || 'system', { studentId: record.studentId, gpa: record.gpa, term: record.term });
  res.status(201).json(record);
});

export default router;
