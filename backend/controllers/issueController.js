
const { Issue, Transaction, Member, Purchase } = require('../models');
const { sequelize } = require('../config/database');

const createOrUpdateIssue = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { transaction_id, member_id, items, description, invoice_no, invoice_date, indent_request_id } = req.body;

    // 1. Validate member
    const member = await validateMember(member_id);
    if (!member) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Member not found' });
    }

    // 2. Handle transaction creation or update
    const transactionRecord = await upsertIssueTransaction({
      transaction_id,
      member_id,
      invoice_no,
      invoice_date,
      description,
      indent_request_id,
      dbTransaction: transaction
    });

    // 3. If editing, revert previous issues and delete them
    if (transaction_id) {
      await revertPreviousIssues(transaction_id, transaction);
    }

    // 4. Create new issue items using FIFO logic
    const issueRecords = await processIssueItems({
      items,
      transaction_id: transactionRecord.id,
      member_id,
      dbTransaction: transaction
    });

    // 5. Commit DB changes
    await transaction.commit();

    // 6. Fetch complete issue details
    const completeIssues = await fetchCompleteIssues(transactionRecord.id);

    res.status(transaction_id ? 200 : 201).json({
      success: true,
      message: transaction_id ? 'Issue updated successfully' : 'Issue created successfully',
      data: {
        issues: completeIssues,
        transaction_id: transactionRecord.id
      }
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Error processing issue',
      error: error.message
    });
  }
};

async function validateMember(member_id) {
  return await Member.findByPk(member_id);
}

async function upsertIssueTransaction({ transaction_id, member_id, invoice_no, invoice_date, description,  indent_request_id, dbTransaction }) {
  if (transaction_id) {
    const transactionRecord = await Transaction.findByPk(transaction_id);
    if (!transactionRecord) throw new Error('Transaction not found');

    await transactionRecord.update({
      member_id,
      invoice_no,
      invoice_date: invoice_date ? new Date(invoice_date) : null,
      description,
      indent_request_id
    }, { transaction: dbTransaction });

    return transactionRecord;
  }

  return await Transaction.create({
    type: 'issue',
    member_id,
    invoice_no,
    invoice_date: invoice_date ? new Date(invoice_date) : null,
    description,
    indent_request_id
  }, { transaction: dbTransaction });
}

async function revertPreviousIssues(transaction_id, dbTransaction) {
  const previousIssues = await Issue.findAll({
    where: { transaction_id },
    transaction: dbTransaction
  });

  for (const issue of previousIssues) {
    // Restore remaining_quantity in associated purchase
    const purchase = await Purchase.findByPk(issue.purchase_id, { transaction: dbTransaction });
    if (purchase) {
      await purchase.update({
        remaining_quantity: purchase.remaining_quantity + issue.quantity
      }, { transaction: dbTransaction });
    }
  }

  await Issue.destroy({
    where: { transaction_id },
    transaction: dbTransaction
  });
}

async function processIssueItems({ items, transaction_id, member_id, dbTransaction }) {
  const issueRecords = [];

  for (const item of items) {
    const { item_name, quantity } = item;

    const availablePurchases = await Purchase.findAll({
      where: {
        id: item.purchase_id,
        remaining_quantity: { [sequelize.Sequelize.Op.gt]: 0 }
      },
      order: [['purchase_date', 'ASC']],
      transaction: dbTransaction
    });

    const totalAvailable = availablePurchases.reduce((sum, p) => sum + p.remaining_quantity, 0);
    if (totalAvailable < quantity) {
      throw new Error(`Insufficient stock for ${item_name}. Available: ${totalAvailable}, Requested: ${quantity}`);
    }

    let remainingToIssue = quantity;

    for (const purchase of availablePurchases) {
      if (remainingToIssue <= 0) break;

      const quantityToIssue = Math.min(remainingToIssue, purchase.remaining_quantity);

      const issue = await Issue.create({
        transaction_id,
        member_id,
        purchase_id: purchase.id,
        item_name,
        quantity: quantityToIssue
      }, { transaction: dbTransaction });

      issueRecords.push(issue);

      await purchase.update({
        remaining_quantity: purchase.remaining_quantity - quantityToIssue
      }, { transaction: dbTransaction });

      remainingToIssue -= quantityToIssue;
    }
  }

  return issueRecords;
}

async function fetchCompleteIssues(transaction_id) {
  return await Issue.findAll({
    where: { transaction_id },
    include: [
      {
        model: Transaction,
        as: 'transaction',
        include: [{ model: Member, as: 'member' }]
      },
      { model: Purchase, as: 'purchase' },
      { model: Member, as: 'member' }
    ]
  });
}


// Function to get all issues with pagination and filters

const getAllIssues = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      item_name, 
      member_id,
       transaction_id,
      start_date,
      end_date 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (item_name) whereClause.item_name = { [sequelize.Sequelize.Op.like]: `%${item_name}%` };
    if (transaction_id) whereClause.transaction_id = transaction_id;
    if (member_id) whereClause.member_id = member_id;
    if (start_date && end_date) {
      whereClause.issue_date = {
        [sequelize.Sequelize.Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const { count, rows: issues } = await Issue.findAndCountAll({
      where: whereClause,
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
        },
        {
          model: Purchase,
          as: 'purchase'
        },
        {
          model: Member,
          as: 'member'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['issue_date', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        issues,
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
      message: 'Error fetching issues',
      error: error.message
    });
  }
};

const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findByPk(id, {
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
        },
        {
          model: Purchase,
          as: 'purchase'
        },
        {
          model: Member,
          as: 'member'
        }
      ]
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.json({
      success: true,
      data: { issue }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching issue',
      error: error.message
    });
  }
};

module.exports = {
  createIssue: createOrUpdateIssue ,
  getAllIssues,
  getIssueById
};
