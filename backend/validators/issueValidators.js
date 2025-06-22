const { body, param } = require('express-validator');

const createIssueValidation = [
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