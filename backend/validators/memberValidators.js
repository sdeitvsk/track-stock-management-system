const { body, param } = require('express-validator');

const createMemberValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('type')
    .isIn(['employee', 'supplier', 'station'])
    .withMessage('Type must be employee, supplier, or station'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must not exceed 100 characters'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must not exceed 100 characters'),
  
  body('contact_info')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact info must not exceed 100 characters')
];

const updateMemberValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid member ID is required'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('type')
    .optional()
    .isIn(['employee', 'supplier', 'station'])
    .withMessage('Type must be employee, supplier, or station'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must not exceed 100 characters'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must not exceed 100 characters'),
  
  body('contact_info')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact info must not exceed 100 characters')
];

const memberIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid member ID is required')
];

module.exports = {
  createMemberValidation,
  updateMemberValidation,
  memberIdValidation
};