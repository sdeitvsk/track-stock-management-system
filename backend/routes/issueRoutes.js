const express = require('express');
const {
  createIssue,
  getAllIssues,
  getIssueById
} = require('../controllers/issueController');
const { authenticate } = require('../middlewares/authMiddleware');
const {
  createIssueValidation,
  issueIdValidation
} = require('../validators/issueValidators');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   POST /api/issues
// @desc    Create new issue (with FIFO logic)
// @access  Private
router.post('/', createIssueValidation, handleValidationErrors, createIssue);

// @route   GET /api/issues
// @desc    Get all issues with pagination and filters
// @access  Private
router.get('/', getAllIssues);

// @route   GET /api/issues/:id
// @desc    Get issue by ID
// @access  Private
router.get('/:id', issueIdValidation, handleValidationErrors, getIssueById);

module.exports = router;