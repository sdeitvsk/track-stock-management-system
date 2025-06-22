
const express = require('express');
const { Transaction, Member } = require('../models');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/transactions
// @desc    Get all transactions with pagination
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      member_id,
      start_date,
      end_date,
      invoice_no 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (type) whereClause.type = type;
    if (member_id) whereClause.member_id = member_id;
    if (invoice_no) whereClause.invoice_no = { [require('sequelize').Op.like]: `%${invoice_no}%` };
    if (start_date && end_date) {
      whereClause.transaction_date = {
        [require('sequelize').Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Member,
          as: 'member'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['transaction_date', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id, {
      include: [
        {
          model: Member,
          as: 'member'
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
});

module.exports = router;
