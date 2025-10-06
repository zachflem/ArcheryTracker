const express = require('express');
const {
  getBackups,
  getBackup,
  createBackup,
  downloadBackup,
  deleteBackup,
  restoreBackup,
  scheduleBackup
} = require('../controllers/backups');

const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middlewares/auth');
const { ROLES } = require('../models/User');

// All routes require admin access
router.use(protect);
router.use(authorize(ROLES.SUPER_USER, ROLES.ADMIN));

// Routes for backups
router.route('/')
  .get(getBackups)
  .post(createBackup);

router.route('/:id')
  .get(getBackup)
  .delete(deleteBackup);

// Download backup
router.get('/:id/download', downloadBackup);

// Restore from backup
router.post('/:id/restore', restoreBackup);

// Schedule automatic backup
router.post('/schedule', scheduleBackup);

module.exports = router;
