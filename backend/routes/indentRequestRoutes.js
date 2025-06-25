
const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');
const {
  createIndentRequest,
  getIndentRequests,
  getIndentRequestById,
  updateIndentRequestStatus,
  deleteIndentRequest
} = require('../controllers/indentRequestController');

// Create a new indent request
router.post('/', requireAuth, createIndentRequest);

// Get all indent requests (with filtering)
router.get('/', requireAuth, getIndentRequests);

// Get specific indent request by ID
router.get('/:id', requireAuth, getIndentRequestById);

// Update indent request status (admin only)
router.patch('/:id/status', requireAuth, requireAdmin, updateIndentRequestStatus);

// Delete indent request (admin only, only pending requests)
router.delete('/:id', requireAuth, requireAdmin, deleteIndentRequest);

module.exports = router;
