import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import reportCardRoutes from './routes/reportCardRoutes.js';
import schoolRoutes from './routes/schoolRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: env.appName, timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/report-cards', reportCardRoutes);
app.use('/api/school', schoolRoutes);
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
