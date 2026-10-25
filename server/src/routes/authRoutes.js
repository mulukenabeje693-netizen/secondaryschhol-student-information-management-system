import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { authenticate } from '../middleware/auth.js';
import { getUsers, saveUsers } from '../store.js';

const router = express.Router();

const signToken = (user) => jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: '8h' });

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const users = getUsers();
  const user = users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());
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

  const token = signToken(user);
  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    }
  });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

router.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const users = getUsers();
  const userIndex = users.findIndex((entry) => entry.id === req.user.id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const match = await bcrypt.compare(currentPassword, users[userIndex].passwordHash);
  if (!match) {
    return res.status(400).json({ message: 'Current password is incorrect.' });
  }

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
  }

  users[userIndex].passwordHash = await bcrypt.hash(newPassword, 10);
  users[userIndex].updatedAt = new Date().toISOString();
  saveUsers(users);

  res.json({ message: 'Password updated successfully.' });
});

export default router;
