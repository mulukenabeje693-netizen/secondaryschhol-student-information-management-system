import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { connectDatabase } from './config/db.js';
import User from './models/User.js';
import { getUsers, saveUsers } from './store.js';

const demoAccounts = [
  { name: 'School Administrator', email: 'admin21@gmail.com', password: 'Admin$123', role: 'admin' },
  { name: 'Parent', email: 'parent22@gmail.com', password: 'Parent$123', role: 'parent', linkedStudentIds: ['BS-2025-001'] },
  { name: 'Teacher', email: 'teacher23@gmail.com', password: 'Teacher$123', role: 'teacher' },
  { name: 'Record Officer', email: 'record24@gmail.com', password: 'Record $123', role: 'record' },
  { name: 'System Administrator', email: 'sysadmin25@gmail.com', password: 'SYSADMIN$123', role: 'system_admin' },
  { name: 'Student', email: 'stud26@gmail.com', password: 'Stud $123', role: 'student', studentId: 'BS-2025-001' },
  { name: 'School Director', email: 'directer27@gmail.com', password: 'DIRECTER$123', role: 'director' }
];

const seedDemoAccounts = async () => {
  await connectDatabase();
  const useMongo = mongoose.connection.readyState === 1;
  const users = getUsers();

  for (const account of demoAccounts) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    const fields = {
      name: account.name,
      email: account.email,
      passwordHash,
      role: account.role,
      status: 'active',
      ...(account.studentId ? { studentId: account.studentId } : {}),
      ...(account.linkedStudentIds ? { linkedStudentIds: account.linkedStudentIds } : {})
    };

    if (useMongo) {
      const existing = await User.findOne({ email: new RegExp(`^${account.email}$`, 'i') }).select('_id');
      await User.findOneAndUpdate(
        existing ? { _id: existing._id } : { email: account.email },
        { $set: fields, $setOnInsert: { createdAt: new Date() } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );
      continue;
    }

    const existing = users.find((user) => user.email.toLowerCase() === account.email);
    if (existing) {
      Object.assign(existing, fields, { updatedAt: new Date().toISOString() });
    } else {
      users.push({ id: crypto.randomUUID(), ...fields, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
  }

  if (!useMongo) saveUsers(users);
  console.log(`Seeded ${demoAccounts.length} demo accounts in ${useMongo ? 'MongoDB' : 'file fallback'} mode.`);
  await mongoose.disconnect();
};

seedDemoAccounts().catch((error) => {
  console.error('Unable to seed demo accounts:', error.message);
  process.exitCode = 1;
});
