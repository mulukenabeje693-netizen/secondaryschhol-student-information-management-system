import express from 'express';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth.js';
import { getResults, saveResults } from '../store.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  res.json(getResults());
});

router.post('/', authenticate, (req, res) => {
  const results = getResults();
  const { studentId, studentName, subject, exam, score, maxScore } = req.body;

  if (!studentId || !studentName || !subject || !exam || score === undefined || maxScore === undefined) {
    return res.status(400).json({ message: 'Student details, subject, exam, score, and max score are required.' });
  }

  const numericScore = Number(score);
  const numericMax = Number(maxScore);

  if (numericScore < 0 || numericMax <= 0 || numericScore > numericMax) {
    return res.status(400).json({ message: 'Score must be between 0 and the maximum allowed mark.' });
  }

  const grade = numericScore >= 90 ? 'A' : numericScore >= 80 ? 'B' : numericScore >= 70 ? 'C' : numericScore >= 60 ? 'D' : 'F';

  const record = {
    id: crypto.randomUUID(),
    studentId,
    studentName,
    subject,
    exam,
    score: numericScore,
    maxScore: numericMax,
    grade,
    recordedAt: new Date().toISOString()
  };

  results.push(record);
  saveResults(results);
  res.status(201).json(record);
});

export default router;
