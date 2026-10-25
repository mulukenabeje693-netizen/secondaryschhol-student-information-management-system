import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

export const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('MONGODB_URI not set. Falling back to file-based in-memory seeded data store.');
    ensureDataDir();
    return { connected: false, mode: 'file' };
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully.');
    return { connected: true, mode: 'mongodb' };
  } catch (error) {
    console.warn('MongoDB connection failed, falling back to file-based data store:', error.message);
    ensureDataDir();
    return { connected: false, mode: 'file' };
  }
};

export const readJsonFile = (fileName, fallback = []) => {
  ensureDataDir();
  const target = path.join(dataDir, fileName);
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, JSON.stringify(fallback, null, 2));
    return fallback;
  }
  try {
    const raw = fs.readFileSync(target, 'utf8');
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const writeJsonFile = (fileName, data) => {
  ensureDataDir();
  const target = path.join(dataDir, fileName);
  fs.writeFileSync(target, JSON.stringify(data, null, 2));
};
