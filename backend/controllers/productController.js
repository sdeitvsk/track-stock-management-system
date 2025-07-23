const Products = require('../models/products');
const {sequelize} = require('../config/database');

const saveProduct = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.length < 2) {
      return res.status(400).json({ success: false, message: 'Invalid product name' });
    }

    const [product, created] = await Products.findOrCreate({
      where: { name },
      defaults: { name },
      transaction
    });

    if (!created) {
      return res.status(409).json({ success: false, message: 'Product already exists' });
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Error saving product',
      error: error.message
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Products.findAll();
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

module.exports = {
  saveProduct,
  getAllProducts
};