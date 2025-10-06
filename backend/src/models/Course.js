const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a course name'],
    trim: true
  },
  description: {
    type: String
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  scoringSystem: {
    type: String,
    enum: ['ABA', 'IFAA'],
    required: [true, 'Please specify the scoring system']
  },
  targets: {
    type: Number,
    required: [true, 'Please specify the number of targets'],
    min: [1, 'Course must have at least one target']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  arrowsPerTarget: {
    type: Number,
    default: 3,
    max: 3
  },
  qrCode: {
    type: String,
    default: null
  },
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for club and course name to ensure unique names within a club
CourseSchema.index({ club: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Course', CourseSchema);
