const express = require('express');
const { 
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByClub,
  addParticipantToEvent,
  removeParticipantFromEvent
} = require('../controllers/events');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

// Routes for all users
router.get('/', protect, getEvents);
router.get('/:id', protect, getEvent);
router.get('/club/:clubId', protect, getEventsByClub);

// Routes for club admins and admins
router.post('/', protect, authorize('club_admin', 'admin', 'super_user'), createEvent);
router.put('/:id', protect, authorize('club_admin', 'admin', 'super_user'), updateEvent);
router.delete('/:id', protect, authorize('club_admin', 'admin', 'super_user'), deleteEvent);

// Routes for managing participants
router.post('/:id/participants', protect, authorize('club_admin', 'admin', 'super_user'), addParticipantToEvent);
router.delete('/:id/participants/:userId', protect, authorize('club_admin', 'admin', 'super_user'), removeParticipantFromEvent);

module.exports = router;
