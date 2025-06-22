const { body, param } = require('express-validator');

const createPurchaseValidation = [
  body('member_id')
    .isInt({ min: 1 })
    .withMessage('Valid member ID is required'),
  
  body('item_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('rate')
    .isFloat({ min: 0 })
    .withMessage('Rate must be a positive number'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
];

const purchaseIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid purchase ID is required')
];

module.exports = {
  createPurchaseValidation,
  purchaseIdValidation
};