
const express = require('express');
const {
  getTotalTransactions,
  getStockBalanceDetailed,
  getStockBalanceSummary
} = require('../controllers/reportsController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/reports/total-transactions
// @desc    Get total transactions report with date filters
// @access  Private
router.get('/total-transactions', getTotalTransactions);

// @route   GET /api/reports/stock-balance-detailed
// @desc    Get detailed stock balance report as on date
// @access  Private
router.get('/stock-balance-detailed', getStockBalanceDetailed);

// @route   GET /api/reports/stock-balance-summary
// @desc    Get stock balance summary report as on date
// @access  Private
router.get('/stock-balance-summary', getStockBalanceSummary);

module.exports = router;
