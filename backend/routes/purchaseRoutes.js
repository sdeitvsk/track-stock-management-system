
const express = require('express');
const {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  getDistinctItemNames
} = require('../controllers/purchaseController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const {
  createPurchaseValidation,
  purchaseIdValidation
} = require('../validators/purchaseValidators');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   POST /api/purchases
// @desc    Create new purchase
// @access  Private
router.post('/', createPurchaseValidation, handleValidationErrors, createPurchase);

// @route   GET /api/purchases
// @desc    Get all purchases with pagination and filters
// @access  Private
router.get('/', getAllPurchases);

// @route   GET /api/purchases/items/search
// @desc    Get distinct item names for autocomplete
// @access  Private
router.get('/items/search', getDistinctItemNames);

// @route   GET /api/purchases/:id
// @desc    Get purchase by ID
// @access  Private
router.get('/:id', purchaseIdValidation, handleValidationErrors, getPurchaseById);

module.exports = router;
