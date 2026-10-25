import express from 'express';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth.js';
import { getTimetable, saveTimetable } from '../store.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  res.json(getTimetable());
});

router.post('/', authenticate, (req, res) => {
  const timetable = getTimetable();
  const { day, time, className, subject, teacher, room } = req.body;

  if (!day || !time || !className || !subject || !teacher || !room) {
    return res.status(400).json({ message: 'Day, time, class, subject, teacher, and room are required.' });
  }

  const duplicate = timetable.some(
    (entry) => entry.day === day && entry.time === time && entry.className === className
  );

  if (duplicate) {
    return res.status(400).json({ message: 'A timetable entry already exists for this class and timeslot.' });
  }

  const record = {
    id: crypto.randomUUID(),
    day,
    time,
    className,
    subject,
    teacher,
    room,
    createdAt: new Date().toISOString()
  };

  timetable.push(record);
  saveTimetable(timetable);
  res.status(201).json(record);
});

export default router;
