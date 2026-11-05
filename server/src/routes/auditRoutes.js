import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getAuditLogs } from '../store.js';

const router = express.Router();

router.get('/', authenticate, authorize('super_admin', 'registrar', 'admin', 'system_admin', 'director'), (req, res) => {
  res.json(getAuditLogs().slice(0, 100));
});

export default router;
