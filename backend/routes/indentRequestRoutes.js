
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const {
  createIndentRequest,
  getIndentRequests,
  getIndentRequestById,
  updateIndentRequestStatus,
  deleteIndentRequest,
  updateIndentRequest // Import the new function
} = require('../controllers/indentRequestController');

// Create a new indent request
router.post('/', authenticate, createIndentRequest);

// Get all indent requests (with filtering)
router.get('/', authenticate, getIndentRequests);

// Get specific indent request by ID
router.get('/:id', authenticate, getIndentRequestById);

// Update (edit) indent request (only creator or admin, only if pending)
router.put('/:id', authenticate, updateIndentRequest);

// Update indent request status (admin only)
router.patch('/:id/status', authenticate, authorize('admin'), updateIndentRequestStatus);

// Delete indent request (admin only, only pending requests)
router.delete('/:id', authenticate, authorize('admin'), deleteIndentRequest);

module.exports = router;
