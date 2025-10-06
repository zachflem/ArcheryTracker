const express = require('express');
const {
  generateUserQRCode,
  getUserQRCode,
  getUserQRCodeById,
  generateCourseQRCode,
  generateIDCard,
  scanQRCode
} = require('../controllers/qrcodes');

const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middlewares/auth');
const { ROLES } = require('../models/User');

// All routes require authentication
router.use(protect);

// User QR code routes
router.route('/user')
  .post(generateUserQRCode)
  .get(getUserQRCode);

// Get user ID card
router.get('/user/id-card', generateIDCard);

// Admin-only routes
router.get('/user/:id', authorize(ROLES.SUPER_USER, ROLES.ADMIN, ROLES.CLUB_ADMIN), getUserQRCodeById);

// Course QR code routes
router.post('/course/:id', generateCourseQRCode);

// Scan QR code
router.post('/scan', scanQRCode);

module.exports = router;
