const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const Backup = require('../models/Backup');
const ErrorResponse = require('../utils/errorResponse');
const { ROLES } = require('../models/User');

// @desc    Get all backups
// @route   GET /api/backups
// @access  Private/Admin
exports.getBackups = async (req, res, next) => {
  try {
    const backups = await Backup.find().sort('-createdAt');

    res.status(200).json({
      success: true,
      count: backups.length,
      data: backups
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single backup
// @route   GET /api/backups/:id
// @access  Private/Admin
exports.getBackup = async (req, res, next) => {
  try {
    const backup = await Backup.findById(req.params.id);

    if (!backup) {
      return next(new ErrorResponse(`Backup not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: backup
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create backup
// @route   POST /api/backups
// @access  Private/Admin
exports.createBackup = async (req, res, next) => {
  try {
    // Check if BACKUP_DIR exists, create if not
    if (!fs.existsSync(process.env.BACKUP_DIR)) {
      fs.mkdirSync(process.env.BACKUP_DIR, { recursive: true });
    }

    // Generate backup filename
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `backup_${timestamp}.zip`;
    const backupPath = path.join(process.env.BACKUP_DIR, filename);

    // Create database dump using mongodump
    const dbBackupPath = path.join(process.env.BACKUP_DIR, 'db_dump');
    
    // Ensure dbBackupPath exists
    if (!fs.existsSync(dbBackupPath)) {
      fs.mkdirSync(dbBackupPath, { recursive: true });
    }

    // Create db dump
    await exec(`mongodump --host mongodb --db archery_tracker --out ${dbBackupPath}`);

    // Create zip file with database dump and uploaded files
    await exec(`zip -r ${backupPath} ${dbBackupPath} ${process.env.IMAGES_DIR} ${process.env.QRCODES_DIR}`);

    // Clean up temporary db dump
    await exec(`rm -rf ${dbBackupPath}`);

    // Get file stats
    const stats = fs.statSync(backupPath);

    // Create backup record in database
    const backup = await Backup.create({
      filename,
      path: backupPath,
      size: stats.size,
      createdBy: req.user.id,
      type: req.body.type || 'manual',
      description: req.body.description || `Manual backup created by ${req.user.id}`
    });

    res.status(201).json({
      success: true,
      data: backup
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download backup
// @route   GET /api/backups/:id/download
// @access  Private/Admin
exports.downloadBackup = async (req, res, next) => {
  try {
    const backup = await Backup.findById(req.params.id);

    if (!backup) {
      return next(new ErrorResponse(`Backup not found with id of ${req.params.id}`, 404));
    }

    // Check if file exists
    if (!fs.existsSync(backup.path)) {
      return next(new ErrorResponse('Backup file not found', 404));
    }

    res.download(backup.path, backup.filename);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete backup
// @route   DELETE /api/backups/:id
// @access  Private/Admin
exports.deleteBackup = async (req, res, next) => {
  try {
    const backup = await Backup.findById(req.params.id);

    if (!backup) {
      return next(new ErrorResponse(`Backup not found with id of ${req.params.id}`, 404));
    }

    // Delete file if it exists
    if (fs.existsSync(backup.path)) {
      fs.unlinkSync(backup.path);
    }

    // Delete from database
    await backup.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Restore from backup
// @route   POST /api/backups/:id/restore
// @access  Private/Admin
exports.restoreBackup = async (req, res, next) => {
  try {
    const backup = await Backup.findById(req.params.id);

    if (!backup) {
      return next(new ErrorResponse(`Backup not found with id of ${req.params.id}`, 404));
    }

    // Check if file exists
    if (!fs.existsSync(backup.path)) {
      return next(new ErrorResponse('Backup file not found', 404));
    }

    // Create temporary directory for extraction
    const extractPath = path.join(process.env.BACKUP_DIR, 'restore_temp');
    
    // Ensure extractPath exists and is empty
    if (fs.existsSync(extractPath)) {
      await exec(`rm -rf ${extractPath}`);
    }
    fs.mkdirSync(extractPath, { recursive: true });

    // Extract backup
    await exec(`unzip -o ${backup.path} -d ${extractPath}`);

    // Find the extracted database dump
    const dbDumpPath = path.join(extractPath, 'db_dump/archery_tracker');
    
    if (!fs.existsSync(dbDumpPath)) {
      await exec(`rm -rf ${extractPath}`);
      return next(new ErrorResponse('Invalid backup format: missing database dump', 400));
    }

    // Restore database
    await exec(`mongorestore --host mongodb --drop --db archery_tracker ${dbDumpPath}`);

    // Restore uploaded files
    if (fs.existsSync(path.join(extractPath, 'uploads'))) {
      // First, create the target directories if they don't exist
      for (const dir of ['images', 'qrcodes', 'backups']) {
        if (!fs.existsSync(path.join(process.env[`${dir.toUpperCase()}_DIR`]))) {
          fs.mkdirSync(path.join(process.env[`${dir.toUpperCase()}_DIR`]), { recursive: true });
        }
      }

      // Copy files from extracted backup to appropriate directories
      if (fs.existsSync(path.join(extractPath, 'uploads/images'))) {
        await exec(`cp -r ${path.join(extractPath, 'uploads/images')}/* ${process.env.IMAGES_DIR}`);
      }
      if (fs.existsSync(path.join(extractPath, 'uploads/qrcodes'))) {
        await exec(`cp -r ${path.join(extractPath, 'uploads/qrcodes')}/* ${process.env.QRCODES_DIR}`);
      }
      if (fs.existsSync(path.join(extractPath, 'uploads/backups'))) {
        await exec(`cp -r ${path.join(extractPath, 'uploads/backups')}/* ${process.env.BACKUP_DIR}`);
      }
    }

    // Clean up
    await exec(`rm -rf ${extractPath}`);

    res.status(200).json({
      success: true,
      message: 'Backup restored successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Schedule automatic backup
// @route   POST /api/backups/schedule
// @access  Private/Admin
exports.scheduleBackup = async (req, res, next) => {
  try {
    // This function would typically set up a cron job or scheduler
    // For simplicity in this MVP, we'll just create a backup with type 'automatic'
    
    // Check if BACKUP_DIR exists, create if not
    if (!fs.existsSync(process.env.BACKUP_DIR)) {
      fs.mkdirSync(process.env.BACKUP_DIR, { recursive: true });
    }

    // Generate backup filename
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `auto_backup_${timestamp}.zip`;
    const backupPath = path.join(process.env.BACKUP_DIR, filename);

    // Create database dump using mongodump
    const dbBackupPath = path.join(process.env.BACKUP_DIR, 'db_dump');
    
    // Ensure dbBackupPath exists
    if (!fs.existsSync(dbBackupPath)) {
      fs.mkdirSync(dbBackupPath, { recursive: true });
    }

    // Create db dump
    await exec(`mongodump --host mongodb --db archery_tracker --out ${dbBackupPath}`);

    // Create zip file with database dump and uploaded files
    await exec(`zip -r ${backupPath} ${dbBackupPath} ${process.env.IMAGES_DIR} ${process.env.QRCODES_DIR}`);

    // Clean up temporary db dump
    await exec(`rm -rf ${dbBackupPath}`);

    // Get file stats
    const stats = fs.statSync(backupPath);

    // Create backup record in database
    const backup = await Backup.create({
      filename,
      path: backupPath,
      size: stats.size,
      createdBy: req.user.id,
      type: 'automatic',
      description: 'Automatic scheduled backup'
    });

    // Check for old automatic backups (older than 3 months) and delete them
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const oldBackups = await Backup.find({
      type: 'automatic',
      createdAt: { $lt: threeMonthsAgo }
    });

    for (const oldBackup of oldBackups) {
      // Delete file if it exists
      if (fs.existsSync(oldBackup.path)) {
        fs.unlinkSync(oldBackup.path);
      }

      // Delete from database
      await oldBackup.remove();
    }

    res.status(201).json({
      success: true,
      data: backup,
      message: `Automatic backup created. ${oldBackups.length} old backups were deleted.`
    });
  } catch (err) {
    next(err);
  }
};
