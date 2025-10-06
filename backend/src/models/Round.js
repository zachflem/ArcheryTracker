const mongoose = require('mongoose');

// Define scoring schemas for different scoring systems
const ABAScoreSchema = new mongoose.Schema({
  targetNumber: {
    type: Number,
    required: true
  },
  arrows: [{
    zoneHit: {
      type: String,
      enum: ['A', 'B', 'C', 'miss'],
      required: true
    },
    points: {
      type: Number,
      required: true
    }
  }],
  totalPoints: {
    type: Number,
    required: true
  }
});

const IFAAScoreSchema = new mongoose.Schema({
  targetNumber: {
    type: Number,
    required: true
  },
  arrows: [{
    scoreValue: {
      type: Number,
      required: true,
      min: 0,
      max: 5
    }
  }],
  totalPoints: {
    type: Number,
    required: true
  }
});

// Schema for non-member participants
const NonMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  scores: {
    type: mongoose.Schema.Types.Mixed, // Will store either ABA or IFAA scores
    default: []
  },
  totalScore: {
    type: Number,
    default: 0
  }
});

const RoundSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a round name'],
    trim: true
  },
  scoringSystem: {
    type: String,
    enum: ['ABA', 'IFAA'],
    required: [true, 'Please specify the scoring system']
  },
  date: {
    type: Date,
    default: Date.now
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    scores: {
      type: mongoose.Schema.Types.Mixed, // Will store either ABA or IFAA scores
      default: []
    },
    totalScore: {
      type: Number,
      default: 0
    },
    personalBest: {
      type: Boolean,
      default: false
    }
  }],
  nonMemberParticipants: [NonMemberSchema],
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  scorer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String
  },
  weather: {
    conditions: String,
    temperature: Number,
    windSpeed: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to calculate total scores for all participants
RoundSchema.pre('save', function(next) {
  // Calculate total scores for registered participants
  this.participants.forEach(participant => {
    let totalScore = 0;
    if (this.scoringSystem === 'ABA') {
      participant.scores.forEach(score => {
        totalScore += score.totalPoints;
      });
    } else if (this.scoringSystem === 'IFAA') {
      participant.scores.forEach(score => {
        totalScore += score.totalPoints;
      });
    }
    participant.totalScore = totalScore;
  });

  // Calculate total scores for non-member participants
  this.nonMemberParticipants.forEach(nonMember => {
    let totalScore = 0;
    if (this.scoringSystem === 'ABA') {
      nonMember.scores.forEach(score => {
        totalScore += score.totalPoints;
      });
    } else if (this.scoringSystem === 'IFAA') {
      nonMember.scores.forEach(score => {
        totalScore += score.totalPoints;
      });
    }
    nonMember.totalScore = totalScore;
  });

  next();
});

module.exports = mongoose.model('Round', RoundSchema);
