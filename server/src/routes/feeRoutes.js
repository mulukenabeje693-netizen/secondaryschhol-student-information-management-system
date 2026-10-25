import express from 'express';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth.js';
import { getFees, saveFees } from '../store.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  res.json(getFees());
});

router.post('/', authenticate, (req, res) => {
  const fees = getFees();
  const { studentId, studentName, category, amount, status, date } = req.body;

  if (!studentId || !studentName || !category || !amount) {
    return res.status(400).json({ message: 'Student ID, name, category, and amount are required.' });
  }

  const record = {
    id: crypto.randomUUID(),
    studentId,
    studentName,
    category,
    amount: Number(amount),
    status: status || 'Pending',
    date: date || new Date().toISOString().slice(0, 10)
  };

  fees.push(record);
  saveFees(fees);
  res.status(201).json(record);
});

export default router;
