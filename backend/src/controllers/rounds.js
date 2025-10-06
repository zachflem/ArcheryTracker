const Round = require('../models/Round');
const Course = require('../models/Course');
const Club = require('../models/Club');
const { User } = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { ROLES } = require('../models/User');

// @desc    Get all rounds
// @route   GET /api/rounds
// @access  Private
exports.getRounds = async (req, res, next) => {
  try {
    let query;

    // If user is not admin, only show rounds they participated in or scored
    if (req.user.role !== ROLES.SUPER_USER && req.user.role !== ROLES.ADMIN) {
      query = Round.find({
        $or: [
          { 'participants.user': req.user.id },
          { scorer: req.user.id }
        ]
      });
    } else {
      // Admins can see all rounds
      query = Round.find();
    }

    // Apply filters
    if (req.query.club) {
      query = query.where('club').equals(req.query.club);
    }

    if (req.query.course) {
      query = query.where('course').equals(req.query.course);
    }

    if (req.query.scoringSystem) {
      query = query.where('scoringSystem').equals(req.query.scoringSystem);
    }

    if (req.query.status) {
      query = query.where('status').equals(req.query.status);
    }

    if (req.query.date) {
      const startDate = new Date(req.query.date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(req.query.date);
      endDate.setHours(23, 59, 59, 999);
      
      query = query.where('date').gte(startDate).lte(endDate);
    }

    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      query = query.where('date').gte(startDate).lte(endDate);
    }

    // Sort by date descending by default
    query = query.sort('-date');

    // Apply limit if provided in query string
    if (req.query.limit) {
      const limit = parseInt(req.query.limit);
      if (!isNaN(limit)) {
        query = query.limit(limit);
      }
    }

    // Populate with related data
    query = query.populate('course', 'name scoringSystem targets arrowsPerTarget')
                .populate('club', 'name')
                .populate('event', 'name')
                .populate('participants.user', 'name email')
                .populate('scorer', 'name email');

    const rounds = await query;

    res.status(200).json({
      success: true,
      count: rounds.length,
      data: rounds
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single round
// @route   GET /api/rounds/:id
// @access  Private
exports.getRound = async (req, res, next) => {
  try {
    const round = await Round.findById(req.params.id)
      .populate('course', 'name scoringSystem targets arrowsPerTarget')
      .populate('club', 'name')
      .populate('event', 'name')
      .populate('participants.user', 'name email')
      .populate('scorer', 'name email');

    if (!round) {
      return next(new ErrorResponse(`Round not found with id of ${req.params.id}`, 404));
    }

    // Check if user is a participant, scorer, or admin
    const isParticipant = round.participants.some(p => p.user && p.user._id.toString() === req.user.id);
    const isScorer = round.scorer && round.scorer._id.toString() === req.user.id;
    const isAdmin = req.user.role === ROLES.SUPER_USER || req.user.role === ROLES.ADMIN;

    if (!isParticipant && !isScorer && !isAdmin) {
      return next(new ErrorResponse(`Not authorized to access this round`, 403));
    }

    res.status(200).json({
      success: true,
      data: round
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new round
// @route   POST /api/rounds
// @access  Private
exports.createRound = async (req, res, next) => {
  try {
    // Set the scorer to the current user
    req.body.scorer = req.user.id;

    // Check if a course was specified
    if (req.body.course) {
      const course = await Course.findById(req.body.course);
      
      if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.body.course}`, 404));
      }
      
      // Prefill scoring system from course if not provided
      if (!req.body.scoringSystem) {
        req.body.scoringSystem = course.scoringSystem;
      }
      
      // Set club from course
      req.body.club = course.club;
    }

    // Initialize participants array with the current user
    if (!req.body.participants) {
      req.body.participants = [];
    }

    // Add current user as a participant if not already included
    const userIncluded = req.body.participants.some(p => p.user && p.user.toString() === req.user.id);
    
    if (!userIncluded) {
      req.body.participants.push({ user: req.user.id });
    }

    // Create round
    const round = await Round.create(req.body);

    // Populate participant details for response
    const populatedRound = await Round.findById(round._id)
      .populate('course', 'name scoringSystem targets arrowsPerTarget')
      .populate('club', 'name')
      .populate('event', 'name')
      .populate('participants.user', 'name email')
      .populate('scorer', 'name email');

    res.status(201).json({
      success: true,
      data: populatedRound
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update round
// @route   PUT /api/rounds/:id
// @access  Private
exports.updateRound = async (req, res, next) => {
  try {
    let round = await Round.findById(req.params.id);

    if (!round) {
      return next(new ErrorResponse(`Round not found with id of ${req.params.id}`, 404));
    }

    // Check if user is the scorer or admin
    if (round.scorer.toString() !== req.user.id && 
        req.user.role !== ROLES.SUPER_USER && 
        req.user.role !== ROLES.ADMIN) {
      return next(new ErrorResponse(`User not authorized to update this round`, 403));
    }

    // Don't allow changing the scorer
    if (req.body.scorer && req.body.scorer !== round.scorer.toString()) {
      return next(new ErrorResponse(`Cannot change the scorer of a round`, 400));
    }

    // Don't allow changing fundamental properties if scores already exist
    if ((req.body.scoringSystem && req.body.scoringSystem !== round.scoringSystem) && 
        (round.participants.some(p => p.scores && p.scores.length > 0) || 
         round.nonMemberParticipants.some(p => p.scores && p.scores.length > 0))) {
      return next(new ErrorResponse(`Cannot change scoring system once scores have been recorded`, 400));
    }

    round = await Round.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('course', 'name scoringSystem targets arrowsPerTarget')
      .populate('club', 'name')
      .populate('event', 'name')
      .populate('participants.user', 'name email')
      .populate('scorer', 'name email');

    res.status(200).json({
      success: true,
      data: round
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete round
// @route   DELETE /api/rounds/:id
// @access  Private
exports.deleteRound = async (req, res, next) => {
  try {
    const round = await Round.findById(req.params.id);

    if (!round) {
      return next(new ErrorResponse(`Round not found with id of ${req.params.id}`, 404));
    }

    // Check if user is the scorer or admin
    if (round.scorer.toString() !== req.user.id && 
        req.user.role !== ROLES.SUPER_USER && 
        req.user.role !== ROLES.ADMIN) {
      return next(new ErrorResponse(`User not authorized to delete this round`, 403));
    }

    // Don't allow deletion if the round is part of an event
    if (round.event) {
      return next(new ErrorResponse(`Cannot delete a round that is part of an event`, 400));
    }

    await round.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add participant to round
// @route   POST /api/rounds/:id/participants
// @access  Private
exports.addParticipant = async (req, res, next) => {
  try {
    const round = await Round.findById(req.params.id);

    if (!round) {
      return next(new ErrorResponse(`Round not found with id of ${req.params.id}`, 404));
    }

    // Check if user is the scorer or admin
    if (round.scorer.toString() !== req.user.id && 
        req.user.role !== ROLES.SUPER_USER && 
        req.user.role !== ROLES.ADMIN) {
      return next(new ErrorResponse(`User not authorized to add participants to this round`, 403));
    }

    // If email is provided, try to find the user
    if (req.body.email) {
      const user = await User.findOne({ email: req.body.email });
      
      if (!user) {
        return next(new ErrorResponse(`User not found with email ${req.body.email}`, 404));
      }
      
      // Check if user is already a participant
      const isParticipant = round.participants.some(p => p.user && p.user.toString() === user._id.toString());
      
      if (isParticipant) {
        return next(new ErrorResponse(`User is already a participant in this round`, 400));
      }
      
      // Add user as participant
      round.participants.push({ user: user._id });
      await round.save();
      
    // Populate for response
    const updatedRound = await Round.findById(round._id)
      .populate('course', 'name scoringSystem targets arrowsPerTarget')
        .populate('club', 'name')
        .populate('event', 'name')
        .populate('participants.user', 'name email')
        .populate('scorer', 'name email');
      
      return res.status(200).json({
        success: true,
        data: updatedRound
      });
    }
    
    // If no email, add non-member participant
    if (req.body.name) {
      // Check if non-member with same name already exists
      const duplicateName = round.nonMemberParticipants.some(p => p.name === req.body.name);
      
      if (duplicateName) {
        return next(new ErrorResponse(`A non-member participant with this name already exists`, 400));
      }
      
      // Add non-member participant
      round.nonMemberParticipants.push({ name: req.body.name });
      await round.save();
      
      return res.status(200).json({
        success: true,
        data: round
      });
    }
    
    return next(new ErrorResponse(`Please provide either an email for registered users or a name for non-member participants`, 400));
  } catch (err) {
    next(err);
  }
};

// @desc    Remove participant from round
// @route   DELETE /api/rounds/:id/participants/:participantId
// @access  Private
exports.removeParticipant = async (req, res, next) => {
  try {
    const round = await Round.findById(req.params.id);

    if (!round) {
      return next(new ErrorResponse(`Round not found with id of ${req.params.id}`, 404));
    }

    // Check if user is the scorer or admin
    if (round.scorer.toString() !== req.user.id && 
        req.user.role !== ROLES.SUPER_USER && 
        req.user.role !== ROLES.ADMIN) {
      return next(new ErrorResponse(`User not authorized to remove participants from this round`, 403));
    }

    // Check if removing registered user or non-member
    if (req.query.type === 'nonmember') {
      // Find the non-member participant
      const participantIndex = round.nonMemberParticipants.findIndex(p => p._id.toString() === req.params.participantId);
      
      if (participantIndex === -1) {
        return next(new ErrorResponse(`Participant not found`, 404));
      }
      
      // Remove non-member participant
      round.nonMemberParticipants.splice(participantIndex, 1);
    } else {
      // Find the registered participant
      const participantIndex = round.participants.findIndex(p => p.user && p.user.toString() === req.params.participantId);
      
      if (participantIndex === -1) {
        return next(new ErrorResponse(`Participant not found`, 404));
      }
      
      // Don't allow removing the scorer
      if (req.params.participantId === round.scorer.toString()) {
        return next(new ErrorResponse(`Cannot remove the scorer from participants`, 400));
      }
      
      // Remove registered participant
      round.participants.splice(participantIndex, 1);
    }
    
    await round.save();
    
    // Populate for response
    const updatedRound = await Round.findById(round._id)
      .populate('course', 'name scoringSystem targets arrowsPerTarget')
      .populate('club', 'name')
      .populate('event', 'name')
      .populate('participants.user', 'name email')
      .populate('scorer', 'name email');
    
    res.status(200).json({
      success: true,
      data: updatedRound
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add score to round
// @route   POST /api/rounds/:id/scores
// @access  Private
exports.addScore = async (req, res, next) => {
  try {
    const round = await Round.findById(req.params.id);

    if (!round) {
      return next(new ErrorResponse(`Round not found with id of ${req.params.id}`, 404));
    }

    // Check if user is the scorer or admin
    if (round.scorer.toString() !== req.user.id && 
        req.user.role !== ROLES.SUPER_USER && 
        req.user.role !== ROLES.ADMIN) {
      return next(new ErrorResponse(`User not authorized to add scores to this round`, 403));
    }

    const { participantId, targetNumber, arrows, isNonMember } = req.body;

    if (!participantId || !targetNumber || !arrows) {
      return next(new ErrorResponse(`Please provide participantId, targetNumber, and arrows`, 400));
    }

    // Calculate total points for the target
    let totalPoints = 0;
    
    if (round.scoringSystem === 'ABA') {
      // ABA scoring: A=20, B=16, C=10, miss=0
      const scoreValues = {
        'A': 20,
        'B': 16,
        'C': 10,
        'miss': 0
      };
      
      arrows.forEach(arrow => {
        arrow.points = scoreValues[arrow.zoneHit] || 0;
        totalPoints += arrow.points;
      });
    } else if (round.scoringSystem === 'IFAA') {
      // IFAA scoring: 5, 4, 3, 2, 1, 0
      arrows.forEach(arrow => {
        totalPoints += arrow.scoreValue;
      });
    }

    // Create the score object
    const score = {
      targetNumber,
      arrows,
      totalPoints
    };

    // Add score to the appropriate participant
    if (isNonMember) {
      // Find non-member participant
      const participant = round.nonMemberParticipants.id(participantId);
      
      if (!participant) {
        return next(new ErrorResponse(`Non-member participant not found`, 404));
      }
      
      // Check if a score for this target already exists
      const existingScoreIndex = participant.scores.findIndex(s => s.targetNumber === targetNumber);
      
      if (existingScoreIndex !== -1) {
        // Update existing score
        participant.scores[existingScoreIndex] = score;
      } else {
        // Add new score
        participant.scores.push(score);
      }
    } else {
      // Find registered participant
      const participant = round.participants.find(p => p.user && p.user.toString() === participantId);
      
      if (!participant) {
        return next(new ErrorResponse(`Participant not found`, 404));
      }
      
      // Check if a score for this target already exists
      const existingScoreIndex = participant.scores.findIndex(s => s.targetNumber === targetNumber);
      
      if (existingScoreIndex !== -1) {
        // Update existing score
        participant.scores[existingScoreIndex] = score;
      } else {
        // Add new score
        participant.scores.push(score);
      }
    }

    await round.save();

    // Populate for response
    const updatedRound = await Round.findById(round._id)
      .populate('course', 'name scoringSystem targets arrowsPerTarget')
      .populate('club', 'name')
      .populate('event', 'name')
      .populate('participants.user', 'name email')
      .populate('scorer', 'name email');

    res.status(200).json({
      success: true,
      data: updatedRound
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Complete round
// @route   PUT /api/rounds/:id/complete
// @access  Private
exports.completeRound = async (req, res, next) => {
  try {
    const round = await Round.findById(req.params.id);

    if (!round) {
      return next(new ErrorResponse(`Round not found with id of ${req.params.id}`, 404));
    }

    // Check if user is the scorer or admin
    if (round.scorer.toString() !== req.user.id && 
        req.user.role !== ROLES.SUPER_USER && 
        req.user.role !== ROLES.ADMIN) {
      return next(new ErrorResponse(`User not authorized to complete this round`, 403));
    }

    if (round.status === 'completed') {
      return next(new ErrorResponse(`Round is already completed`, 400));
    }

    // Update status to completed
    round.status = 'completed';
    await round.save();

    // Check for personal bests for each participant
    for (const participant of round.participants) {
      if (!participant.user) continue;

      // Find user's previous rounds
      const userRounds = await Round.find({
        'participants.user': participant.user,
        'scoringSystem': round.scoringSystem,
        'status': 'completed',
        '_id': { $ne: round._id }
      });

      // Get the participant's total score
      const currentScore = participant.totalScore;

      // Check if this is a personal best
      let isPB = true;
      for (const prevRound of userRounds) {
        const prevParticipant = prevRound.participants.find(
          p => p.user && p.user.toString() === participant.user.toString()
        );
        
        if (prevParticipant && prevParticipant.totalScore >= currentScore) {
          isPB = false;
          break;
        }
      }

      // If it's a personal best, update the flag
      if (isPB) {
        participant.personalBest = true;
      }
    }

    await round.save();

    // Populate for response
    const updatedRound = await Round.findById(round._id)
      .populate('course', 'name scoringSystem targets arrowsPerTarget')
      .populate('club', 'name')
      .populate('event', 'name')
      .populate('participants.user', 'name email')
      .populate('scorer', 'name email');

    res.status(200).json({
      success: true,
      data: updatedRound
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user stats
// @route   GET /api/rounds/stats
// @access  Private
exports.getUserStats = async (req, res, next) => {
  try {
    // Get all rounds where user is a participant
    const rounds = await Round.find({
      'participants.user': req.user.id,
      'status': 'completed'
    })
    .populate('course', 'name scoringSystem targets arrowsPerTarget');

    if (rounds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalRounds: 0,
          averageScore: 0,
          personalBests: 0,
          scoringSystems: {}
        }
      });
    }

    // Calculate stats
    let totalRounds = rounds.length;
    let personalBests = 0;
    let scoringSystems = {};

    rounds.forEach(round => {
      const participant = round.participants.find(
        p => p.user && p.user.toString() === req.user.id
      );

      if (participant) {
        // Count personal bests
        if (participant.personalBest) {
          personalBests++;
        }

        // Track scores by scoring system
        if (!scoringSystems[round.scoringSystem]) {
          scoringSystems[round.scoringSystem] = {
            totalScore: 0,
            count: 0,
            average: 0,
            highScore: 0,
            recentScores: []
          };
        }

        scoringSystems[round.scoringSystem].totalScore += participant.totalScore;
        scoringSystems[round.scoringSystem].count += 1;
        
        // Update high score
        if (participant.totalScore > scoringSystems[round.scoringSystem].highScore) {
          scoringSystems[round.scoringSystem].highScore = participant.totalScore;
        }

        // Add to recent scores (we'll keep the 5 most recent)
        scoringSystems[round.scoringSystem].recentScores.push({
          date: round.date,
          score: participant.totalScore,
          roundId: round._id
        });
      }
    });

    // Calculate averages and sort recent scores
    for (const system in scoringSystems) {
      const stats = scoringSystems[system];
      stats.average = stats.count > 0 ? stats.totalScore / stats.count : 0;
      
      // Sort recent scores by date (newest first) and keep only 5
      stats.recentScores.sort((a, b) => new Date(b.date) - new Date(a.date));
      stats.recentScores = stats.recentScores.slice(0, 5);
    }

    // Calculate overall average
    let totalScore = 0;
    let scoreCount = 0;
    
    for (const system in scoringSystems) {
      totalScore += scoringSystems[system].totalScore;
      scoreCount += scoringSystems[system].count;
    }
    
    const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRounds,
        averageScore,
        personalBests,
        scoringSystems
      }
    });
  } catch (err) {
    next(err);
  }
};
