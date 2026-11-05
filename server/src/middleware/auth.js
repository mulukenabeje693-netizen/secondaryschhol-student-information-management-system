import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { getUsers } from '../store.js';
import User from '../models/User.js';

const toSafeUser = (user) => ({
  id: String(user.id || user._id),
  studentId: user.studentId || null,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status || 'active',
  linkedStudentIds: user.linkedStudentIds || []
});

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    let user = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: String(payload.email).toLowerCase() }).lean();
    }
    user ||= getUsers().find((entry) => entry.id === payload.sub || entry.email.toLowerCase() === String(payload.email).toLowerCase());

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    req.user = toSafeUser(user);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const compatibleRoles = {
  admin: ['super_admin'],
  system_admin: ['super_admin'],
  record: ['registrar'],
  super_admin: ['admin', 'system_admin'],
  registrar: ['record']
};

export const authorize = (...roles) => (req, res, next) => {
  const userRoles = new Set([req.user?.role, ...(compatibleRoles[req.user?.role] || [])]);
  if (!req.user || !roles.some((role) => userRoles.has(role))) {
    return res.status(403).json({ message: 'You do not have permission to access this resource.' });
  }
  next();
};
