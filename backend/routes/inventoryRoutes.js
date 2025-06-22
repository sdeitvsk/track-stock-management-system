const express = require('express');
const {
  getInventorySummary,
  getItemHistory,
  getTransactionSummary
} = require('../controllers/inventoryController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/inventory/summary
// @desc    Get inventory summary with stock levels
// @access  Private
router.get('/summary', getInventorySummary);

// @route   GET /api/inventory/item/:item_name/history
// @desc    Get complete history for a specific item
// @access  Private
router.get('/item/:item_name/history', getItemHistory);

// @route   GET /api/inventory/transactions/summary
// @desc    Get transaction summary by date and type
// @access  Private
router.get('/transactions/summary', getTransactionSummary);

module.exports = router;