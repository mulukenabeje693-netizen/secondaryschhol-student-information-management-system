import crypto from 'crypto';
import { env } from './config/env.js';
import { getUsers, saveUsers } from './store.js';
import bcrypt from 'bcryptjs';

const ensureAdminUser = async () => {
  const users = getUsers();
  const adminExists = users.some((user) => user.email === env.adminEmail);

  if (!adminExists) {
    users.push({
      id: crypto.randomUUID(),
      name: 'School Administrator',
      email: env.adminEmail,
      passwordHash: await bcrypt.hash(env.adminPassword, 10),
      role: 'super_admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    saveUsers(users);
    console.log(`Seeded admin user: ${env.adminEmail}`);
    return;
  }

  console.log('Admin user already exists.');
};

ensureAdminUser();
