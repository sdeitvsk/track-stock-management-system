const express = require('express');
const { saveProduct, getAllProducts } = require('../controllers/productController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', saveProduct);
router.get('/', getAllProducts);

module.exports = router;
