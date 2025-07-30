const { Purchase, Transaction, Member} = require('../models');
const Product = require('../models/products');
const { sequelize } = require('../config/database');

const savePurchase = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { member_id, items, description, invoice_no, invoice_date, transaction_id } = req.body;

    const member = await validateSupplier(member_id);
    if (!member) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Invalid supplier member' });
    }

    const transactionRecord = await handleTransactionUpsert({
      transaction_id,
      member_id,
      invoice_no,
      invoice_date,
      description,
      dbTransaction: transaction
    });

    await syncPurchaseItems({
      items,
      transaction_id: transactionRecord.id,
      dbTransaction: transaction
    });

    await transaction.commit();

    const completePurchases = await fetchCompletePurchases(transactionRecord.id);

    res.status(transaction_id ? 200 : 201).json({
      success: true,
      message: transaction_id ? 'Purchase updated successfully' : 'Purchase created successfully',
      data: {
        purchases: completePurchases,
        transaction_id: transactionRecord.id
      }
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Error saving purchase',
      error: error.message
    });
  }
};

// ✅ Validates the member as a supplier
async function validateSupplier(member_id) {
  const member = await Member.findByPk(member_id);
  if (!member || member.type !== 'supplier') return null;
  return member;
}

// ✅ Creates or updates the transaction
async function handleTransactionUpsert({ transaction_id, member_id, invoice_no, invoice_date, description, dbTransaction }) {
  if (transaction_id) {
    const transactionRecord = await Transaction.findByPk(transaction_id);
    if (!transactionRecord) throw new Error('Transaction not found');

    await transactionRecord.update({
      member_id,
      invoice_no,
      invoice_date: invoice_date ? new Date(invoice_date) : null,
      description
    }, { transaction: dbTransaction });

    return transactionRecord;
  }

  return await Transaction.create({
    type: 'purchase',
    member_id,
    invoice_no,
    invoice_date: invoice_date ? new Date(invoice_date) : null,
    description
  }, { transaction: dbTransaction });
}

// ✅ Syncs purchase items: add, update, delete
async function syncPurchaseItems({ items, transaction_id, dbTransaction }) {
  const existingPurchases = await Purchase.findAll({
    where: { transaction_id },
    transaction: dbTransaction
  });

  const incomingIds = items.filter(i => i.id).map(i => i.id);
  const existingIds = existingPurchases.map(p => p.id);

  const toDelete = existingIds.filter(id => !incomingIds.includes(id));
  if (toDelete.length) {
    await Purchase.destroy({ where: { id: toDelete }, transaction: dbTransaction });
  }

  for (const item of items) {
    const { id, item_name, item_id, quantity, rate } = item;

    if (id) {
      await Purchase.update({
        item_name,
        item_id,
        quantity,
        rate,
        remaining_quantity: quantity // Adjust as needed for stock tracking
      }, {
        where: { id },
        transaction: dbTransaction
      });
    } else {
      await Purchase.create({
        transaction_id,
        item_name,
        item_id,
        quantity,
        rate,
        remaining_quantity: quantity
      }, { transaction: dbTransaction });
    }
  }
}

// ✅ Fetches purchase with transaction & member details
async function fetchCompletePurchases(transaction_id) {
  return await Purchase.findAll({
    where: { transaction_id },
    include: [{
      model: Transaction,
      as: 'transaction',
      include: [{ model: Member, as: 'member' }]
    }]
  });
}

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

    const items = await Product.findAll({
      where: whereClause,
      attributes: ['id','item_name']
    });

    

    res.json({
      success: true,
      data: { items: items }
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
  savePurchase,
  getAllPurchases,
  getPurchaseById,
  getDistinctItemNames
};
