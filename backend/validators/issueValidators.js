const { body, param } = require('express-validator');

const createIssueValidation = [
  body('member_id')
    .isInt({ min: 1 })
    .withMessage('Valid member ID is required'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),

  body('items.*.item_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Each item name must be between 2 and 100 characters'),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each item quantity must be a positive integer'),

  body('invoice_no')
    .trim()
    .notEmpty()
    .withMessage('Invoice number is required'),

  body('invoice_date')
    .isISO8601()
    .withMessage('Invoice date must be a valid ISO 8601 date'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
];

const issueIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid issue ID is required')
];

module.exports = {
  createIssueValidation,
  issueIdValidation
};