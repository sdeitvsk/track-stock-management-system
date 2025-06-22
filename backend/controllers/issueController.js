const { Issue, Transaction, Member, Purchase } = require('../models');
const { sequelize } = require('../config/database');

const createIssue = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { member_id, item_name, quantity, description } = req.body;

    // Verify member exists
    const member = await Member.findByPk(member_id);
    if (!member) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Find available purchases with FIFO logic (oldest first)
    const availablePurchases = await Purchase.findAll({
      where: {
        item_name,
        remaining_quantity: { [sequelize.Sequelize.Op.gt]: 0 }
      },
      order: [['purchase_date', 'ASC']],
      transaction
    });

    // Check if enough stock is available
    const totalAvailable = availablePurchases.reduce((sum, p) => sum + p.remaining_quantity, 0);
    if (totalAvailable < quantity) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${totalAvailable}, Requested: ${quantity}`
      });
    }

    // Create transaction record
    const transactionRecord = await Transaction.create({
      type: 'issue',
      member_id,
      description
    }, { transaction });

    let remainingToIssue = quantity;
    const issueRecords = [];

    // Process FIFO logic
    for (const purchase of availablePurchases) {
      if (remainingToIssue <= 0) break;

      const quantityToIssue = Math.min(remainingToIssue, purchase.remaining_quantity);

      // Create issue record
      const issue = await Issue.create({
        transaction_id: transactionRecord.id,
        member_id,
        purchase_id: purchase.id,
        item_name,
        quantity: quantityToIssue
      }, { transaction });

      issueRecords.push(issue);

      // Update purchase remaining quantity
      await purchase.update({
        remaining_quantity: purchase.remaining_quantity - quantityToIssue
      }, { transaction });

      remainingToIssue -= quantityToIssue;
    }

    await transaction.commit();

    // Fetch complete issue data with associations
    const completeIssues = await Issue.findAll({
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

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: { 
        issues: completeIssues,
        total_quantity: quantity
      }
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Error creating issue',
      error: error.message
    });
  }
};

const getAllIssues = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      item_name, 
      member_id,
      start_date,
      end_date 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (item_name) whereClause.item_name = { [sequelize.Sequelize.Op.like]: `%${item_name}%` };
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
  createIssue,
  getAllIssues,
  getIssueById
};