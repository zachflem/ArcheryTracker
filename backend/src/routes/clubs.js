const express = require('express');
const {
  getClubs,
  getClub,
  createClub,
  updateClub,
  deleteClub,
  uploadClubLogo,
  approveClub,
  addMember,
  removeMember,
  addAdmin,
  removeAdmin
} = require('../controllers/clubs');

const router = express.Router();

// Import middleware
const { protect, authorize, isClubMember, isClubAdmin } = require('../middlewares/auth');
const { ROLES } = require('../models/User');

// Public routes
router.get('/', getClubs);
router.get('/:name', getClub);

// Protected routes
router.use(protect);

// Club creation
router.post('/', createClub);

// Club management
router.route('/:name')
  .put(isClubAdmin, updateClub)
  .delete(isClubAdmin, deleteClub);

// Logo upload
router.put('/:name/logo', isClubAdmin, uploadClubLogo);

// Admin only routes
router.put('/:name/approve', authorize(ROLES.SUPER_USER, ROLES.ADMIN), approveClub);

// Member management
router.route('/:name/members')
  .put(isClubAdmin, addMember);

router.delete('/:name/members/:userId', isClubAdmin, removeMember);

// Admin management
router.route('/:name/admins')
  .put(isClubAdmin, addAdmin);

router.delete('/:name/admins/:userId', isClubAdmin, removeAdmin);

// =================== Course Management Routes ===================
const { 
  getClubCourses,
  getClubCourse,
  createClubCourse,
  updateClubCourse,
  deleteClubCourse
} = require('../controllers/clubs');

// Course routes
router.route('/:name/courses')
  .get(isClubMember, getClubCourses)
  .post(isClubAdmin, createClubCourse);

router.route('/:name/courses/:courseId')
  .get(isClubMember, getClubCourse)
  .put(isClubAdmin, updateClubCourse)
  .delete(isClubAdmin, deleteClubCourse);

// =================== Event Management Routes ===================
const { 
  getClubEvents,
  getClubEvent,
  createClubEvent,
  updateClubEvent,
  deleteClubEvent,
  addEventParticipant,
  removeEventParticipant
} = require('../controllers/clubs');

// Event routes
router.route('/:name/events')
  .get(isClubMember, getClubEvents)
  .post(isClubAdmin, createClubEvent);

router.route('/:name/events/:eventId')
  .get(isClubMember, getClubEvent)
  .put(isClubAdmin, updateClubEvent)
  .delete(isClubAdmin, deleteClubEvent);

router.route('/:name/events/:eventId/participants')
  .post(isClubAdmin, addEventParticipant);

router.delete('/:name/events/:eventId/participants/:userId', 
  isClubAdmin, 
  removeEventParticipant
);

module.exports = router;
