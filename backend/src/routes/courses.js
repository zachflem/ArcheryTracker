const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseQRCode,
  regenerateQRCode
} = require('../controllers/courses');

const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middlewares/auth');
const { ROLES } = require('../models/User');

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);
router.get('/:id/qrcode', getCourseQRCode);

// Protected routes
router.use(protect);

// Course creation and management
router.post('/', createCourse);

router.route('/:id')
  .put(updateCourse)
  .delete(deleteCourse);

// QR Code regeneration
router.put('/:id/qrcode', regenerateQRCode);

module.exports = router;
