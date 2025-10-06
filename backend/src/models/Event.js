const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an event name'],
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
  startDate: {
    type: Date,
    required: [true, 'Please specify a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please specify an end date']
  },
  rounds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round'
  }],
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registered: {
      type: Date,
      default: Date.now
    },
    attended: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  visibility: {
    type: String,
    enum: ['public', 'club-only', 'private'],
    default: 'club-only'
  },
  qrCode: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  fee: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'AUD'
    }
  },
  organizers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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

// Create compound index for club and event name to ensure unique names within a club
EventSchema.index({ club: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Event', EventSchema);
