const mongoose = require('mongoose');

const BackupSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    unique: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['automatic', 'manual'],
    default: 'automatic'
  },
  description: {
    type: String
  }
});

// Index to find and delete old backups
BackupSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Backup', BackupSchema);
