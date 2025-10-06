const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  verifyUser,
  createChildAccount,
  migrateChildAccount,
  changeUserRole,
  searchUsers,
  setHomeClub
} = require('../controllers/users');

const router = express.Router();

// Import middleware
const { protect, authorize, isParentOf } = require('../middlewares/auth');
const { ROLES } = require('../models/User');

// Routes that require admin access
router.use(protect);

// Search endpoint - accessible to all authenticated users
router.get('/search', searchUsers);

// Admin only routes
router.route('/')
  .get(authorize(ROLES.SUPER_USER, ROLES.ADMIN), getUsers)
  .post(authorize(ROLES.SUPER_USER, ROLES.ADMIN), createUser);

router.route('/:id')
  .get(authorize(ROLES.SUPER_USER, ROLES.ADMIN), getUser)
  .put(authorize(ROLES.SUPER_USER, ROLES.ADMIN), updateUser)
  .delete(authorize(ROLES.SUPER_USER, ROLES.ADMIN), deleteUser);

router.put('/:id/verify', authorize(ROLES.SUPER_USER, ROLES.ADMIN, ROLES.CLUB_ADMIN), verifyUser);
router.put('/:id/role', authorize(ROLES.SUPER_USER, ROLES.ADMIN), changeUserRole);
router.put('/:id/homeclub', setHomeClub); // Available to user themselves or admins (logic in controller)

// Parent-child account management
router.post('/child', createChildAccount);
router.put('/child/:id/migrate', isParentOf, migrateChildAccount);

module.exports = router;
