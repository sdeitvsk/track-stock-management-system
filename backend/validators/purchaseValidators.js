const { body, param } = require('express-validator');

const createPurchaseValidation = [
  body('member_id')
    .isInt({ min: 1 })
    .withMessage('Valid member ID is required'),

  body('invoice_no')
    .trim()
    .notEmpty()
    .withMessage('Invoice number is required'),

  body('invoice_date')
    .isISO8601()
    .withMessage('Invoice date must be a valid date'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),

  body('items.*.item_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  body('items.*.rate')
    .isFloat({ min: 0 })
    .withMessage('Rate must be a positive number'),
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