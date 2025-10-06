const express = require('express');
const {
  getRounds,
  getRound,
  createRound,
  updateRound,
  deleteRound,
  addParticipant,
  removeParticipant,
  addScore,
  completeRound,
  getUserStats
} = require('../controllers/rounds');

const router = express.Router();

// Import middleware
const { protect } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// Routes for rounds
router.route('/')
  .get(getRounds)
  .post(createRound);

router.route('/:id')
  .get(getRound)
  .put(updateRound)
  .delete(deleteRound);

// Participant management
router.route('/:id/participants')
  .post(addParticipant);

router.delete('/:id/participants/:participantId', removeParticipant);

// Score management
router.post('/:id/scores', addScore);

// Complete round
router.put('/:id/complete', completeRound);

// Get user statistics
router.get('/stats/me', getUserStats);

module.exports = router;
