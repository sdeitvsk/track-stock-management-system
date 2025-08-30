const express = require('express');
const { register, login, getProfile, changePassword} = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { registerValidation, loginValidation } = require('../validators/authValidators');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', registerValidation, handleValidationErrors, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, handleValidationErrors, login);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, getProfile);

router.post('/change-password', authenticate, changePassword);




module.exports = router;