import express from 'express';
import crypto from 'crypto';
import { authenticate, authorize } from '../middleware/auth.js';
import { getAnnouncements, saveAnnouncements } from '../store.js';

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  res.json(getAnnouncements());
});

router.post('/', authenticate, authorize('super_admin', 'registrar'), (req, res) => {
  const announcements = getAnnouncements();
  const { title, content, audience } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  const newAnnouncement = {
    id: crypto.randomUUID(),
    title,
    content,
    audience: audience || 'all',
    createdBy: req.user.email,
    publishedAt: new Date().toISOString()
  };

  announcements.unshift(newAnnouncement);
  saveAnnouncements(announcements);
  res.status(201).json(newAnnouncement);
});

export default router;
