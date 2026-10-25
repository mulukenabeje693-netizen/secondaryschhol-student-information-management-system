import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || 'bemilew-dev-secret',
  mongoUri: process.env.MONGODB_URI || '',
  appName: process.env.APP_NAME || 'Bemilew Secondary School',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@bemilew.edu',
  adminPassword: process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!'
};
