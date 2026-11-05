import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { authenticate } from '../middleware/auth.js';
import { getUsers, saveUsers, logAuditEvent } from '../store.js';
import User from '../models/User.js';

const router = express.Router();

const signToken = (user) => jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: '8h' });

const toSafeUser = (user) => ({
  id: String(user.id || user._id),
  studentId: user.studentId || null,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status || 'active'
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).toLowerCase();
  let user = null;
  if (mongoose.connection.readyState === 1) {
    user = await User.findOne({ email: normalizedEmail });
  }
  user ||= getUsers().find((entry) => entry.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  if (user.status !== 'active') {
    return res.status(403).json({ message: 'This account is inactive.' });
  }

  const safeUser = toSafeUser(user);
  const token = signToken(safeUser);
  logAuditEvent('auth.login', user.email, { role: user.role, studentId: user.studentId || null });
  return res.json({
    token,
    user: safeUser
  });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

router.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const users = getUsers();
  const userIndex = users.findIndex((entry) => entry.id === req.user.id);
  const mongoUser = mongoose.connection.readyState === 1
    ? await User.findOne({ email: req.user.email })
    : null;

  if (userIndex === -1 && !mongoUser) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const match = await bcrypt.compare(currentPassword, mongoUser?.passwordHash || users[userIndex].passwordHash);
  if (!match) {
    return res.status(400).json({ message: 'Current password is incorrect.' });
  }

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  if (mongoUser) {
    mongoUser.passwordHash = passwordHash;
    await mongoUser.save();
  } else {
    users[userIndex].passwordHash = passwordHash;
    users[userIndex].updatedAt = new Date().toISOString();
    saveUsers(users);
  }

  res.json({ message: 'Password updated successfully.' });
});

export default router;
