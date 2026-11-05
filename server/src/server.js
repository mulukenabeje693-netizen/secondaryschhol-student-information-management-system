import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import studentPortalRoutes from './routes/studentPortalRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import reportCardRoutes from './routes/reportCardRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import schoolRoutes from './routes/schoolRoutes.js';
import { authenticate, authorize } from './middleware/auth.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.json({
    ok: true,
    app: env.appName,
    database: { connected: databaseConnected, mode: databaseConnected ? 'mongodb' : 'file-fallback' },
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', authenticate, authorize('admin', 'system_admin', 'record', 'teacher', 'director'), studentRoutes);
app.use('/api/student-portal', authenticate, authorize('student'), studentPortalRoutes);
app.use('/api/parents', authenticate, (req, res, next) => {
  if (req.method === 'GET' && req.path === '/me') return authorize('parent')(req, res, next);
  return authorize('admin', 'system_admin', 'record')(req, res, next);
}, parentRoutes);
app.use('/api/teachers', authenticate, authorize('admin', 'system_admin', 'record', 'teacher', 'director'), teacherRoutes);
app.use('/api/attendance', authenticate, authorize('admin', 'system_admin', 'record', 'teacher', 'director'), attendanceRoutes);
app.use('/api/fees', authenticate, authorize('admin', 'system_admin', 'record', 'director'), feeRoutes);
app.use('/api/timetable', authenticate, authorize('admin', 'system_admin', 'record', 'teacher', 'student', 'parent', 'director'), timetableRoutes);
app.use('/api/results', authenticate, authorize('admin', 'system_admin', 'record', 'teacher', 'director'), resultRoutes);
app.use('/api/report-cards', authenticate, (req, res, next) => {
  if (req.method === 'GET' && ['parent', 'student'].includes(req.user.role)) return next();
  return authorize('admin', 'system_admin', 'record', 'teacher', 'director')(req, res, next);
}, reportCardRoutes);
app.use('/api/audit', authenticate, authorize('admin', 'system_admin', 'director'), auditRoutes);
app.use('/api/school', authenticate, authorize('admin', 'system_admin', 'record', 'teacher', 'director'), schoolRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

const startServer = async () => {
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`${env.appName} API listening on http://localhost:${env.port}`);
  });
};

startServer();
