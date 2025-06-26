
const express = require('express');
const {
  getAllLoginUsers,
  createLoginUser,
  updateLoginUser,
  resetPassword,
  deleteLoginUser
} = require('../controllers/loginUserController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// @route   GET /api/login-users
// @desc    Get all login users with pagination and filters
// @access  Private (Admin only)
router.get('/', getAllLoginUsers);

// @route   POST /api/login-users
// @desc    Create new login user
// @access  Private (Admin only)
router.post('/', createLoginUser);

// @route   PUT /api/login-users/:id
// @desc    Update login user
// @access  Private (Admin only)
router.put('/:id', updateLoginUser);

// @route   POST /api/login-users/:id/reset-password
// @desc    Reset user password
// @access  Private (Admin only)
router.post('/:id/reset-password', resetPassword);

// @route   DELETE /api/login-users/:id
// @desc    Delete login user
// @access  Private (Admin only)
router.delete('/:id', deleteLoginUser);

module.exports = router;
