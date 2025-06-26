
const { Purchase, Transaction, Member } = require('../models');
const { sequelize } = require('../config/database');

const createPurchase = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { member_id, items, description, invoice_no, invoice_date } = req.body;

    // Verify member exists and is a supplier
    const member = await Member.findByPk(member_id);
    if (!member || member.type !== 'supplier') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier member'
      });
    }

    // Create transaction record with invoice details
    const transactionRecord = await Transaction.create({
      type: 'purchase',
      member_id,
      invoice_no,
      invoice_date: invoice_date ? new Date(invoice_date) : null,
      description
    }, { transaction });

    const purchaseRecords = [];

    // Create purchase records for each item
    for (const item of items) {
      const { item_name, quantity, rate } = item;
      
      const purchase = await Purchase.create({
        transaction_id: transactionRecord.id,
        item_name,
        quantity,
        rate,
        remaining_quantity: quantity
      }, { transaction });

      purchaseRecords.push(purchase);
    }

    await transaction.commit();

    // Fetch complete purchase data with associations
    const completePurchases = await Purchase.findAll({
      where: { transaction_id: transactionRecord.id },
      include: [
        {
          model: Transaction,
          as: 'transaction',
          include: [
            {
              model: Member,
              as: 'member'
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: { 
        purchases: completePurchases,
        transaction_id: transactionRecord.id
      }
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Error creating purchase',
      error: error.message
    });
  }
};

const getAllPurchases = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      item_name, 
      member_id,
      start_date,
      end_date,
      transaction_id
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (item_name) whereClause.item_name = { [sequelize.Sequelize.Op.like]: `%${item_name}%` };
    if (transaction_id) whereClause.transaction_id = transaction_id;
    if (start_date && end_date) {
      whereClause.purchase_date = {
        [sequelize.Sequelize.Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    // Transaction where clause for member filter
    const transactionWhere = {};
    if (member_id) transactionWhere.member_id = member_id;

    const { count, rows: purchases } = await Purchase.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Transaction,
          as: 'transaction',
          where: transactionWhere,
          include: [
            {
              model: Member,
              as: 'member'
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['purchase_date', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        purchases,
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
      message: 'Error fetching purchases',
      error: error.message
    });
  }
};

const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchase = await Purchase.findByPk(id, {
      include: [
        {
          model: Transaction,
          as: 'transaction',
          include: [
            {
              model: Member,
              as: 'member'
            }
          ]
        }
      ]
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    res.json({
      success: true,
      data: { purchase }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase',
      error: error.message
    });
  }
};

const getDistinctItemNames = async (req, res) => {
  try {
    const { search = '' } = req.query;
    
    const whereClause = {};
    if (search) {
      whereClause.item_name = {
        [sequelize.Sequelize.Op.like]: `%${search}%`
      };
    }

    const items = await Purchase.findAll({
      attributes: [
        [sequelize.Sequelize.fn('DISTINCT', sequelize.Sequelize.col('item_name')), 'item_name']
      ],
      where: whereClause,
      order: [['item_name', 'ASC']],
      limit: 10,
      raw: true
    });

    const itemNames = items.map(item => item.item_name);

    res.json({
      success: true,
      data: { items: itemNames }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item names',
      error: error.message
    });
  }
};

module.exports = {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  getDistinctItemNames
};
