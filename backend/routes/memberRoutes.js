const express = require('express');
const {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember
} = require('../controllers/memberController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const {
  createMemberValidation,
  updateMemberValidation,
  memberIdValidation
} = require('../validators/memberValidators');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   POST /api/members
// @desc    Create new member
// @access  Private (Admin only)
router.post('/', authorize('admin'), createMemberValidation, handleValidationErrors, createMember);

// @route   GET /api/members
// @desc    Get all members with pagination and filters
// @access  Private
router.get('/', getAllMembers);

// @route   GET /api/members/:id
// @desc    Get member by ID
// @access  Private
router.get('/:id', memberIdValidation, handleValidationErrors, getMemberById);

// @route   PUT /api/members/:id
// @desc    Update member
// @access  Private (Admin only)
router.put('/:id', authorize('admin'), updateMemberValidation, handleValidationErrors, updateMember);

// @route   DELETE /api/members/:id
// @desc    Delete member (soft delete)
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), memberIdValidation, handleValidationErrors, deleteMember);

module.exports = router;